const WeeklyMenu = require('../models/WeeklyMenu');
const MealOption = require('../models/MealOption');
const Vote = require('../models/Vote');
const FinalMenu = require('../models/FinalMenu');

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const getActiveWeek = async (weekId) => {
    if (weekId) {
        const byId = await WeeklyMenu.findById(weekId);
        return byId;
    }
    return WeeklyMenu.findOne().sort({ weekStartDate: -1 }).exec();
};

const createWeek = async ({ weekStartDate, userId }) => {
    if (!weekStartDate) {
        throw new Error('weekStartDate is required');
    }
    const date = new Date(weekStartDate);
    if (Number.isNaN(date.getTime())) {
        throw new Error('Invalid weekStartDate');
    }

    const existing = await WeeklyMenu.findOne({ weekStartDate: date });
    if (existing) {
        return existing;
    }

    const weeklyMenu = await WeeklyMenu.create({
        weekStartDate: date,
        createdBy: userId || undefined,
    });

    return weeklyMenu;
};

const addOptions = async ({ weeklyMenuId, options }) => {
    if (!weeklyMenuId) {
        throw new Error('weeklyMenuId is required');
    }
    if (!Array.isArray(options) || options.length === 0) {
        throw new Error('At least one option is required');
    }

    const week = await WeeklyMenu.findById(weeklyMenuId);
    if (!week) {
        throw new Error('Weekly menu not found');
    }
    if (week.status === 'FINALIZED') {
        throw new Error('Cannot add options to a finalized week');
    }

    const docs = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const opt of options) {
        const { day, meal, foodName } = opt;
        if (day == null || !MEAL_TYPES.includes(meal) || !foodName?.trim()) {
            // eslint-disable-next-line no-continue
            continue;
        }
        try {
            // dedupe by unique index
            // eslint-disable-next-line no-await-in-loop
            const created = await MealOption.findOneAndUpdate(
                {
                    weekId: weeklyMenuId,
                    day,
                    mealType: meal,
                    foodName: foodName.trim(),
                },
                {},
                { new: true, upsert: true, setDefaultsOnInsert: true },
            );
            docs.push(created);
        } catch (err) {
            // ignore duplicates
        }
    }

    return docs;
};

const buildOptionsByDayMeal = (options) => {
    const byDayMeal = Array.from({ length: 7 }, () => ({}));
    options.forEach((opt) => {
        if (!byDayMeal[opt.day]) {
            // eslint-disable-next-line no-param-reassign
            byDayMeal[opt.day] = {};
        }
        if (!byDayMeal[opt.day][opt.mealType]) {
            byDayMeal[opt.day][opt.mealType] = [];
        }
        byDayMeal[opt.day][opt.mealType].push({
            _id: opt._id,
            foodName: opt.foodName,
            voteCount: opt.voteCount,
        });
    });
    return byDayMeal;
};

const buildFinalByDayMeal = (finals) => {
    const byDayMeal = Array.from({ length: 7 }, () => ({}));
    finals.forEach((fm) => {
        if (!byDayMeal[fm.day]) {
            // eslint-disable-next-line no-param-reassign
            byDayMeal[fm.day] = {};
        }
        // eslint-disable-next-line no-param-reassign
        byDayMeal[fm.day][fm.mealType] = {
            foodName: fm.foodName,
            voteCount: fm.voteCount,
        };
    });
    return byDayMeal;
};

const getWeek = async ({ weekId }) => {
    const weeklyMenu = await getActiveWeek(weekId);
    if (!weeklyMenu) {
        return { weeklyMenu: null };
    }

    const [options, finals] = await Promise.all([
        MealOption.find({ weekId: weeklyMenu._id }).sort({ day: 1, mealType: 1, createdAt: 1 }),
        weeklyMenu.status === 'FINALIZED'
            ? FinalMenu.find({ weekId: weeklyMenu._id })
            : Promise.resolve([]),
    ]);

    const optionsByDayMeal = buildOptionsByDayMeal(options);
    const finalMenuByDayMeal = buildFinalByDayMeal(finals);

    return {
        weeklyMenu,
        status: weeklyMenu.status,
        optionsByDayMeal,
        finalMenuByDayMeal,
    };
};

const getFinal = async ({ weekId }) => {
    const weeklyMenu = await getActiveWeek(weekId);
    if (!weeklyMenu) {
        return { weeklyMenu: null };
    }

    const finals = await FinalMenu.find({ weekId: weeklyMenu._id });
    return {
        weeklyMenu,
        status: weeklyMenu.status,
        finalMenuByDayMeal: buildFinalByDayMeal(finals),
    };
};

const getMyVotes = async ({ weekId, studentId }) => {
    const weeklyMenu = await getActiveWeek(weekId);
    if (!weeklyMenu) {
        return { myVotes: {} };
    }

    const votes = await Vote.find({
        weekId: weeklyMenu._id,
        studentId,
    });

    const myVotes = {};
    votes.forEach((v) => {
        myVotes[`${v.day}-${v.mealType}`] = String(v.mealOptionId);
    });

    return { myVotes };
};

const vote = async ({ studentId, mealOptionId }) => {
    const option = await MealOption.findById(mealOptionId);
    if (!option) {
        throw new Error('Option not found');
    }

    const week = await WeeklyMenu.findById(option.weekId);
    if (!week) {
        throw new Error('Weekly menu not found');
    }
    if (week.status !== 'VOTING') {
        throw new Error('Voting is closed for this week');
    }

    const key = {
        studentId,
        weekId: week._id,
        day: option.day,
        mealType: option.mealType,
    };

    const session = await WeeklyMenu.startSession();
    await session.withTransaction(async () => {
        const existing = await Vote.findOne(key).session(session);
        if (existing && String(existing.mealOptionId) === String(mealOptionId)) {
            return;
        }

        if (existing) {
            await MealOption.findByIdAndUpdate(
                existing.mealOptionId,
                { $inc: { voteCount: -1 } },
                { session },
            );
            // eslint-disable-next-line no-param-reassign
            existing.mealOptionId = mealOptionId;
            await existing.save({ session });
        } else {
            await Vote.create([{ ...key, mealOptionId }], { session });
        }

        await MealOption.findByIdAndUpdate(
            mealOptionId,
            { $inc: { voteCount: 1 } },
            { session },
        );
    });
    await session.endSession();

    return { success: true };
};

const getVotes = async ({ weekId }) => {
    const weeklyMenu = await getActiveWeek(weekId);
    if (!weeklyMenu) {
        return { totalVotes: 0, byDayMeal: [] };
    }

    const options = await MealOption.find({ weekId: weeklyMenu._id });
    const byDayMeal = Array.from({ length: 7 }, () => ({}));
    let totalVotes = 0;

    options.forEach((opt) => {
        if (!byDayMeal[opt.day][opt.mealType]) {
            byDayMeal[opt.day][opt.mealType] = [];
        }
        byDayMeal[opt.day][opt.mealType].push({
            foodName: opt.foodName,
            count: opt.voteCount,
        });
        totalVotes += opt.voteCount;
    });

    // sort each meal list by count desc
    byDayMeal.forEach((dayObj) => {
        MEAL_TYPES.forEach((meal) => {
            if (dayObj[meal]) {
                dayObj[meal].sort((a, b) => b.count - a.count);
            }
        });
    });

    return { totalVotes, byDayMeal };
};

const finalizeWeek = async ({ weekId }) => {
    const weeklyMenu = await getActiveWeek(weekId);
    if (!weeklyMenu) {
        throw new Error('Weekly menu not found');
    }
    if (weeklyMenu.status === 'FINALIZED') {
        return weeklyMenu;
    }

    const options = await MealOption.find({ weekId: weeklyMenu._id }).sort({
        day: 1,
        mealType: 1,
        voteCount: -1,
        createdAt: 1,
    });

    const grouped = {};
    options.forEach((opt) => {
        const key = `${opt.day}-${opt.mealType}`;
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(opt);
    });

    const session = await WeeklyMenu.startSession();
    await session.withTransaction(async () => {
        // eslint-disable-next-line no-restricted-syntax
        for (const value of Object.values(grouped)) {
            const top = value[0];
            if (!top) {
                // eslint-disable-next-line no-continue
                continue;
            }

            // eslint-disable-next-line no-await-in-loop
            await FinalMenu.findOneAndUpdate(
                {
                    weekId: weeklyMenu._id,
                    day: top.day,
                    mealType: top.mealType,
                },
                {
                    foodName: top.foodName,
                    voteCount: top.voteCount,
                },
                {
                    new: true,
                    upsert: true,
                    session,
                },
            );
        }

        // eslint-disable-next-line no-param-reassign
        weeklyMenu.status = 'FINALIZED';
        await weeklyMenu.save({ session });
    });
    await session.endSession();

    return weeklyMenu;
};

const listWeeks = async () => WeeklyMenu.find().sort({ weekStartDate: -1 }).exec();

module.exports = {
    createWeek,
    addOptions,
    getWeek,
    getFinal,
    getMyVotes,
    vote,
    getVotes,
    finalizeWeek,
    listWeeks,
};

