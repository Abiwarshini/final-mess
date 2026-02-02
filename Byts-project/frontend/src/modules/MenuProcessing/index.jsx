import React, { useState, useEffect, useCallback } from 'react';
import { menuApi } from '../../utils/menuApi';
import './style.css';

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

const MenuProcessing = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weekData, setWeekData] = useState(null);
    const [myVotes, setMyVotes] = useState({});
    const [voting, setVoting] = useState(null);
    const [adminTab, setAdminTab] = useState('create');
    const [weeks, setWeeks] = useState([]);
    const [selectedWeekId, setSelectedWeekId] = useState('');
    const [voteStats, setVoteStats] = useState(null);
    const [adminOptions, setAdminOptions] = useState({ day: 0, meal: 'breakfast', foodName: '', weeklyMenuId: '' });
    const [createWeekDate, setCreateWeekDate] = useState('');
    const [adminMessage, setAdminMessage] = useState(null);

    const userRole = (() => {
        try {
            const u = JSON.parse(localStorage.getItem('currentUser'));
            return u?.role || 'student';
        } catch {
            return 'student';
        }
    })();
    const isAdmin = userRole === 'caretaker' || userRole === 'warden';

    const fetchWeek = useCallback(async (weekId = null) => {
        setError(null);
        setLoading(true);
        try {
            const data = await menuApi.getWeek(weekId || undefined);
            setWeekData(data);
            setSelectedWeekId(data?.weeklyMenu?._id || '');
            if (data?.weeklyMenu?._id && userRole === 'student') {
                const res = await menuApi.getMyVotes(data.weeklyMenu._id);
                setMyVotes(res.myVotes || {});
            }
        } catch (e) {
            setError(e.message || 'Failed to load menu');
            setWeekData(null);
        } finally {
            setLoading(false);
        }
    }, [userRole]);

    useEffect(() => {
        fetchWeek();
    }, [fetchWeek]);

    useEffect(() => {
        if (isAdmin) {
            menuApi.listWeeks().then(setWeeks).catch(() => setWeeks([]));
        }
    }, [isAdmin]);

    const handleVote = async (day, meal, mealOptionId) => {
        if (!weekData?.weeklyMenu?._id || weekData.status !== 'VOTING') return;
        setVoting(`${day}-${meal}`);
        setError(null);
        try {
            await menuApi.vote({ day, meal, mealOptionId });
            setMyVotes((prev) => ({ ...prev, [`${day}-${meal}`]: mealOptionId }));
        } catch (e) {
            setError(e.message || 'Vote failed');
        } finally {
            setVoting(null);
        }
    };

    const handleCreateWeek = async (e) => {
        e.preventDefault();
        if (!createWeekDate.trim()) return;
        setAdminMessage(null);
        try {
            await menuApi.createWeek(createWeekDate);
            setAdminMessage('Week created. You can add options next.');
            setCreateWeekDate('');
            const list = await menuApi.listWeeks();
            setWeeks(list);
            fetchWeek();
        } catch (e) {
            setAdminMessage(e.message || 'Failed to create week');
        }
    };

    const handleAddOptions = async (e) => {
        e.preventDefault();
        const wid = adminOptions.weeklyMenuId || weekData?.weeklyMenu?._id;
        if (!wid || !adminOptions.foodName.trim()) {
            setAdminMessage('Select a week and enter food name.');
            return;
        }
        setAdminMessage(null);
        try {
            await menuApi.addOptions(wid, [{
                day: Number(adminOptions.day),
                meal: adminOptions.meal,
                foodName: adminOptions.foodName.trim(),
            }]);
            setAdminMessage('Option added.');
            setAdminOptions((prev) => ({ ...prev, foodName: '' }));
            fetchWeek(selectedWeekId || undefined);
        } catch (err) {
            setAdminMessage(err.message || 'Failed to add option');
        }
    };

    const loadVoteStats = async () => {
        const wid = selectedWeekId || weekData?.weeklyMenu?._id;
        if (!wid) return;
        setAdminMessage(null);
        try {
            const stats = await menuApi.getVotes(wid);
            setVoteStats(stats);
        } catch (e) {
            setAdminMessage(e.message || 'Failed to load votes');
        }
    };

    const handleFinalize = async (e) => {
        e.preventDefault();
        const wid = selectedWeekId || weekData?.weeklyMenu?._id;
        if (!wid) return;
        setAdminMessage(null);
        try {
            await menuApi.finalize(wid);
            setAdminMessage('Menu finalized. Voting is now closed.');
            setVoteStats(null);
            fetchWeek(wid);
        } catch (e) {
            setAdminMessage(e.message || 'Failed to finalize');
        }
    };

    if (loading && !weekData) {
        return (
            <div className="menu-processing-container">
                <div className="menu-loading">Loading menu...</div>
            </div>
        );
    }

    return (
        <div className="menu-processing-container">
            <h2>Mess Menu</h2>
            {error && <div className="menu-error">{error}</div>}
            {adminMessage && <div className="menu-admin-msg">{adminMessage}</div>}

            {!weekData?.weeklyMenu && !loading && (
                <div className="menu-empty">
                    No menu is set for this week. {isAdmin && 'Use Admin section to create a week and add options.'}
                </div>
            )}

            {weekData?.weeklyMenu && (
                <>
                    <div className="menu-week-info">
                        Week of {weekData.weeklyMenu.weekStartDate ? new Date(weekData.weeklyMenu.weekStartDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        <span className={`menu-status menu-status-${(weekData.status || '').toLowerCase()}`}>
                            {weekData.status === 'FINALIZED' ? 'Finalized' : 'Voting open'}
                        </span>
                    </div>

                    {weekData.status === 'FINALIZED' && weekData.finalMenuByDayMeal && (
                        <section className="menu-final-section">
                            <h3>Finalized Menu</h3>
                            <div className="menu-final-grid">
                                {DAY_LABELS.map((label, d) => (
                                    <div key={d} className="menu-final-day">
                                        <h4>{label}</h4>
                                        {['breakfast', 'lunch', 'dinner'].map((meal) => {
                                            const cell = weekData.finalMenuByDayMeal[d]?.[meal];
                                            return (
                                                <div key={meal} className="menu-final-meal">
                                                    <strong>{MEAL_LABELS[meal]}:</strong>{' '}
                                                    {cell?.foodName || '—'}
                                                    {cell?.voteCount != null && <span className="menu-vote-count"> ({cell.voteCount} votes)</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {weekData.status === 'VOTING' && userRole === 'student' && (
                        <section className="menu-vote-section">
                            <h3>Vote for the week</h3>
                            <p className="menu-vote-hint">One vote per day per meal. Your selection is saved immediately.</p>
                            <div className="menu-vote-grid">
                                {DAY_LABELS.map((_, day) => (
                                    <div key={day} className="menu-vote-day-card">
                                        <h4>{DAY_LABELS[day]}</h4>
                                        {['breakfast', 'lunch', 'dinner'].map((meal) => {
                                            const options = weekData.optionsByDayMeal?.[day]?.[meal] || [];
                                            const key = `${day}-${meal}`;
                                            const selectedId = myVotes[key];
                                            const isSubmitting = voting === key;
                                            return (
                                                <div key={meal} className="menu-vote-meal-block">
                                                    <div className="menu-vote-meal-label">{MEAL_LABELS[meal]}</div>
                                                            {options.length === 0 ? (
                                                                <div className="menu-no-options">No options</div>
                                                            ) : (
                                                                <div className="menu-option-cards">
                                                                    {options.map((opt) => {
                                                                        const voted = selectedId === opt._id;
                                                                        return (
                                                                            <div key={opt._id} className={`menu-option-card ${voted ? 'voted' : ''}`}>
                                                                                <div className="menu-option-name">{opt.foodName}</div>
                                                                                <div className="menu-option-action">
                                                                                    <button
                                                                                        type="button"
                                                                                        className={voted ? 'voted-btn' : 'vote-btn'}
                                                                                        onClick={() => handleVote(day, meal, opt._id)}
                                                                                        disabled={isSubmitting}
                                                                                    >
                                                                                        {voted ? '✓ Voted' : 'Vote for this'}
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            {isAdmin && (
                <section className="menu-admin-section">
                    <h3>Admin</h3>
                    <div className="menu-admin-tabs">
                        <button type="button" className={adminTab === 'create' ? 'active' : ''} onClick={() => setAdminTab('create')}>Create week</button>
                        <button type="button" className={adminTab === 'options' ? 'active' : ''} onClick={() => setAdminTab('options')}>Add options</button>
                        <button type="button" className={adminTab === 'votes' ? 'active' : ''} onClick={() => setAdminTab('votes')}>Vote stats</button>
                        <button type="button" className={adminTab === 'finalize' ? 'active' : ''} onClick={() => setAdminTab('finalize')}>Finalize</button>
                    </div>

                    {adminTab === 'create' && (
                        <form onSubmit={handleCreateWeek} className="menu-admin-form">
                            <label>Week start (Monday)</label>
                            <input type="date" value={createWeekDate} onChange={(e) => setCreateWeekDate(e.target.value)} required />
                            <button type="submit">Create week</button>
                        </form>
                    )}

                    {adminTab === 'options' && (
                        <form onSubmit={handleAddOptions} className="menu-admin-form">
                            <label>Week</label>
                            <select value={adminOptions.weeklyMenuId || selectedWeekId} onChange={(e) => setAdminOptions((p) => ({ ...p, weeklyMenuId: e.target.value }))}>
                                <option value="">Select week</option>
                                {weeks.map((w) => (
                                    <option key={w._id} value={w._id}>
                                        {new Date(w.weekStartDate).toLocaleDateString()} ({w.status})
                                    </option>
                                ))}
                            </select>
                            <label>Day</label>
                            <select value={adminOptions.day} onChange={(e) => setAdminOptions((p) => ({ ...p, day: Number(e.target.value) }))}>
                                {DAY_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
                            </select>
                            <label>Meal</label>
                            <select value={adminOptions.meal} onChange={(e) => setAdminOptions((p) => ({ ...p, meal: e.target.value }))}>
                                {Object.entries(MEAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            <label>Food name</label>
                            <input type="text" value={adminOptions.foodName} onChange={(e) => setAdminOptions((p) => ({ ...p, foodName: e.target.value }))} placeholder="e.g. Idli" required />
                            <button type="submit">Add option</button>
                        </form>
                    )}

                    {adminTab === 'votes' && (
                        <div className="menu-admin-form">
                            <label>Week</label>
                            <select value={selectedWeekId} onChange={(e) => { setSelectedWeekId(e.target.value); setVoteStats(null); }}>
                                <option value="">Select week</option>
                                {weeks.map((w) => (
                                    <option key={w._id} value={w._id}>{new Date(w.weekStartDate).toLocaleDateString()} ({w.status})</option>
                                ))}
                            </select>
                            <button type="button" onClick={loadVoteStats}>Load vote stats</button>
                            {voteStats && (
                                <div className="menu-vote-stats">
                                    <p>Total votes: {voteStats.totalVotes}</p>
                                    <div className="menu-stats-grid">
                                        {DAY_LABELS.map((label, d) => (
                                            <div key={d} className="menu-stats-day">
                                                <h4>{label}</h4>
                                                {['breakfast', 'lunch', 'dinner'].map((meal) => {
                                                    const list = voteStats.byDayMeal?.[d]?.[meal] || [];
                                                    return (
                                                        <div key={meal}>
                                                            <strong>{MEAL_LABELS[meal]}</strong>
                                                            {list.length === 0 ? <div>—</div> : list.map((o, i) => <div key={i}>{o.foodName}: {o.count}</div>)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {adminTab === 'finalize' && (
                        <div className="menu-admin-form">
                            <label>Week to finalize</label>
                            <select value={selectedWeekId} onChange={(e) => setSelectedWeekId(e.target.value)}>
                                <option value="">Select week</option>
                                {weeks.filter((w) => w.status === 'VOTING').map((w) => (
                                    <option key={w._id} value={w._id}>{new Date(w.weekStartDate).toLocaleDateString()}</option>
                                ))}
                            </select>
                            <button type="button" onClick={handleFinalize}>Finalize menu</button>
                            <p className="menu-finalize-hint">Lock menu and disable voting. Max-voted option per day/meal will be set.</p>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default MenuProcessing;
