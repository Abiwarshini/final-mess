const Week = require('../models/Week');
const MenuOption = require('../models/MenuOption');
const Vote = require('../models/Vote');

// @desc    Get current week with options
// @route   GET /api/menu/week
// @access  Protected
const getWeek = async (req, res) => {
    try {
        const weekId = req.query.weekId;
        let week;

        if (weekId) {
            week = await Week.findById(weekId);
        } else {
            // Get latest week
            week = await Week.findOne().sort({ createdAt: -1 });
        }

        if (!week) {
            return res.status(404).json({ message: 'No active week found' });
        }

        // Populate options
        const options = await MenuOption.find({ weekId: week._id });

        // Group options by day and meal
        const menuStructure = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const meals = ['Breakfast', 'Lunch', 'Dinner'];

        days.forEach(day => {
            menuStructure[day] = {};
            meals.forEach(meal => {
                menuStructure[day][meal] = options.filter(o => o.day === day && o.meal === meal);
            });
        });

        res.json({
            week,
            menu: menuStructure
        });
    } catch (err) {
        res.status(400).json({ message: err.message || 'Failed to get week' });
    }
};

// @desc    Get finalized menu
// @route   GET /api/menu/final
// @access  Protected
const getFinal = async (req, res) => {
    try {
        const weekId = req.query.weekId;
        let week;

        if (weekId) {
            week = await Week.findById(weekId);
        } else {
            week = await Week.findOne({ status: 'Finalized' }).sort({ createdAt: -1 });
        }

        if (!week) {
            return res.status(404).json({ message: 'No finalized menu found' });
        }

        res.json(week);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Failed to get final menu' });
    }
};

// @desc    Create new week
// @route   POST /api/menu/week
// @access  Caretaker/Warden
const createWeek = async (req, res) => {
    try {
        const { weekStartDate } = req.body;

        // Calculate end date (7 days from start)
        const startDate = new Date(weekStartDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        const week = await Week.create({
            startDate,
            endDate,
            status: 'Voting Open',
            createdBy: req.user?._id
        });

        res.status(201).json(week);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Failed to create week' });
    }
};

// @desc    Add food options
// @route   POST /api/menu/options
// @access  Caretaker/Warden
const addOptions = async (req, res) => {
    try {
        const { weeklyMenuId, options } = req.body;

        const week = await Week.findById(weeklyMenuId);
        if (!week) return res.status(404).json({ message: 'Week not found' });
        if (week.status !== 'Voting Open') {
            return res.status(400).json({ message: 'Voting is not open for this week' });
        }

        const createdOptions = [];
        for (const opt of options) {
            const menuOption = await MenuOption.create({
                weekId: weeklyMenuId,
                day: opt.day,
                meal: opt.meal,
                name: opt.name
            });
            createdOptions.push(menuOption);
        }

        res.status(201).json({ options: createdOptions });
    } catch (err) {
        res.status(400).json({ message: err.message || 'Failed to add options' });
    }
};

// @desc    Vote for option
// @route   POST /api/menu/vote
// @access  Student
const vote = async (req, res) => {
    try {
        const { mealOptionId } = req.body;
        const userId = req.user._id;

        if (!mealOptionId) {
            return res.status(400).json({ message: 'mealOptionId is required' });
        }

        // Get the option to find week, day, meal
        const option = await MenuOption.findById(mealOptionId);
        if (!option) return res.status(404).json({ message: 'Menu option not found' });

        const week = await Week.findById(option.weekId);
        if (!week) return res.status(404).json({ message: 'Week not found' });
        if (week.status !== 'Voting Open') {
            return res.status(400).json({ message: 'Voting is closed' });
        }

        // Check if user already voted for this meal
        const existingVote = await Vote.findOne({
            user: userId,
            weekId: option.weekId,
            day: option.day,
            meal: option.meal
        });

        if (existingVote) {
            // Decrease previous option count
            const prevOption = await MenuOption.findById(existingVote.menuOptionId);
            if (prevOption) {
                prevOption.votes = Math.max(0, prevOption.votes - 1);
                await prevOption.save();
            }

            // Delete old vote
            await Vote.deleteOne({ _id: existingVote._id });
        }

        // Add new vote
        await Vote.create({
            user: userId,
            weekId: option.weekId,
            day: option.day,
            meal: option.meal,
            menuOptionId: mealOptionId
        });

        // Update option count
        option.votes += 1;
        await option.save();

        res.status(201).json({ message: 'Vote recorded' });
    } catch (err) {
        res.status(400).json({ message: err.message || 'Failed to vote' });
    }
};

// @desc    Get my votes for a week
// @route   GET /api/menu/my-votes
// @access  Student
const getMyVotes = async (req, res) => {
    try {
        const weekId = req.query.weekId;
        const studentId = req.user._id;

        if (!weekId) {
            return res.status(400).json({ message: 'weekId is required' });
        }

        const votes = await Vote.find({ user: studentId, weekId });
        res.json(votes);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Failed to get votes' });
    }
};

// @desc    Get all votes for a week (admin)
// @route   GET /api/menu/votes
// @access  Caretaker/Warden
const getVotes = async (req, res) => {
    try {
        const weekId = req.query.weekId;

        if (!weekId) {
            return res.status(400).json({ message: 'weekId is required' });
        }

        const votes = await Vote.find({ weekId }).populate('user', 'name email');
        res.json(votes);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Failed to get votes' });
    }
};

// @desc    Finalize menu
// @route   POST /api/menu/finalize
// @access  Caretaker/Warden
const finalize = async (req, res) => {
    try {
        const { weeklyMenuId } = req.body;

        const week = await Week.findById(weeklyMenuId);
        if (!week) return res.status(404).json({ message: 'Week not found' });

        // Get all options
        const options = await MenuOption.find({ weekId: week._id });

        const finalizedMenu = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const meals = ['Breakfast', 'Lunch', 'Dinner'];

        days.forEach(day => {
            finalizedMenu[day] = {};
            meals.forEach(meal => {
                const mealOptions = options.filter(o => o.day === day && o.meal === meal);
                if (mealOptions.length > 0) {
                    // Find max votes
                    const winner = mealOptions.reduce((prev, current) =>
                        (prev.votes > current.votes) ? prev : current
                    );
                    finalizedMenu[day][meal] = winner.name;
                } else {
                    finalizedMenu[day][meal] = "N/A";
                }
            });
        });

        week.status = 'Finalized';
        week.finalizedMenu = finalizedMenu;
        await week.save();

        res.json(week);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Failed to finalize menu' });
    }
};

// @desc    List all weeks
// @route   GET /api/menu/weeks
// @access  Caretaker/Warden
const listWeeks = async (req, res) => {
    try {
        const weeks = await Week.find().sort({ createdAt: -1 });
        res.json(weeks);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Failed to list weeks' });
    }
};

module.exports = {
    getWeek,
    getFinal,
    createWeek,
    addOptions,
    vote,
    getMyVotes,
    getVotes,
    finalize,
    listWeeks
};
