import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './style.css';
import { Save, Plus, Trash2, HelpCircle, CheckCircle, Ticket, Calendar, Clock, X, Flag } from 'lucide-react';

const TokenAllocation = () => {
    const [userRole, setUserRole] = useState('student');
    const [currentUser, setCurrentUser] = useState(null);

    // Common State
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial Load
    useEffect(() => {
        const role = sessionStorage.getItem('userRole');
        const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        setUserRole(role);
        setCurrentUser(user);
        fetchTokenEvents(user._id);
    }, []);

    const fetchTokenEvents = async (studentId) => {
        try {
            const allEvents = await api.get('/events');
            const tokenEvents = allEvents.filter(e => e.tokenRequired);
            setEvents(tokenEvents);

            // If student, check submission status
            if (studentId) {
                const statusMap = {};
                for (const ev of tokenEvents) {
                    try {
                        const res = await api.get(`/events/${ev._id}/token-status/${studentId}`);
                        statusMap[ev._id] = res.submitted;
                    } catch (e) {
                        console.error('Failed to check status', e);
                    }
                }
                setSubmissionStatus(statusMap);
            }
        } catch (error) {
            console.error('Failed to fetch events', error);
        }
    };

    // -------------------------------------------------------------------------
    // WARDEN / CARETAKER LOGIC (Configuration & Stats)
    // -------------------------------------------------------------------------
    const [selectedEventId, setSelectedEventId] = useState('');
    const [questions, setQuestions] = useState([]);
    const [stats, setStats] = useState(null);
    const [saveStatus, setSaveStatus] = useState('idle');

    const handleEventSelect = async (e) => {
        const eventId = e.target.value;
        setSelectedEventId(eventId);
        setStats(null);
        if (!eventId) {
            setQuestions([]);
            return;
        }

        const event = events.find(ev => ev._id === eventId);
        if (event) {
            if (event.tokenConfig) {
                setQuestions(JSON.parse(JSON.stringify(event.tokenConfig)));
            } else {
                setQuestions([]);
            }
            fetchStats(eventId);
        }
    };

    const fetchStats = async (eventId) => {
        try {
            const data = await api.get(`/events/${eventId}/token-stats`);
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const addQuestion = () => setQuestions([...questions, { question: '', options: [''] }]);
    const removeQuestion = (i) => {
        const n = [...questions]; n.splice(i, 1); setQuestions(n);
    };
    const updateQuestion = (i, v) => {
        const n = [...questions]; n[i].question = v; setQuestions(n);
    };
    const handleOptionChange = (qi, oi, v) => {
        const n = [...questions]; n[qi].options[oi] = v; setQuestions(n);
    };
    const addOption = (qi) => {
        const n = [...questions]; n[qi].options.push(''); setQuestions(n);
    };
    const removeOption = (qi, oi) => {
        const n = [...questions]; n[qi].options.splice(oi, 1); setQuestions(n);
    };

    const handleSave = async () => {
        if (!selectedEventId) return;
        if (questions.some(q => !q.question.trim() || q.options.some(o => !o.trim()))) {
            alert('Please fill in all questions and options.');
            return;
        }

        setSaveStatus('saving');
        try {
            await api.put(`/events/${selectedEventId}/token-config`, { tokenConfig: questions });
            setSaveStatus('success');
            fetchTokenEvents(currentUser?._id);
            fetchStats(selectedEventId);
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Save failed', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    // -------------------------------------------------------------------------
    // STUDENT LOGIC (Get Token)
    // -------------------------------------------------------------------------
    const [submissionStatus, setSubmissionStatus] = useState({});
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [selectedEventForToken, setSelectedEventForToken] = useState(null);
    const [tokenAnswers, setTokenAnswers] = useState({});
    const [submitStatus, setSubmitStatus] = useState('idle');

    const openTokenModal = (event) => {
        setSelectedEventForToken(event);
        const initialAnswers = {};
        if (event.tokenConfig) {
            event.tokenConfig.forEach(q => initialAnswers[q.question] = q.options[0]);
        }
        setTokenAnswers(initialAnswers);
        setShowTokenModal(true);
    };

    const submitTokenRequest = async () => {
        if (!selectedEventForToken) return;
        const responses = Object.keys(tokenAnswers).map(q => ({
            question: q, answer: tokenAnswers[q]
        }));
        setSubmitStatus('submitting');
        try {
            await api.post(`/events/${selectedEventForToken._id}/token-submit`, {
                studentId: currentUser._id, responses
            });
            setSubmitStatus('success');
            setSubmissionStatus({ ...submissionStatus, [selectedEventForToken._id]: true });
            setTimeout(() => { setShowTokenModal(false); setSubmitStatus('idle'); }, 1500);
        } catch (error) {
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus('idle'), 2000);
        }
    };


    // -------------------------------------------------------------------------
    // RENDER: STUDENT VIEW
    // -------------------------------------------------------------------------
    const getEventTypeColor = (type) => {
        const colors = {
            'Cultural': '#ec4899', // Pink
            'Sports': '#f59e0b', // Amber
            'Academic': '#3b82f6', // Blue
            'Meeting': '#6366f1', // Indigo
            'Other': '#6b7280' // Gray
        };
        return colors[type] || colors['Other'];
    };

    if (userRole === 'student') {
        return (
            <div className="token-allocation-container">
                <div className="ta-header">
                    <h2>Available Tokens</h2>
                    <p>Apply for event tokens by answering the required questions.</p>
                </div>

                <div className="events-grid">
                    {events.length === 0 ? (
                        <p className="no-data">No token-based events available right now.</p>
                    ) : (
                        events.map(event => (
                            <div key={event._id} className="event-card">
                                <div className="event-type-badge" style={{ backgroundColor: getEventTypeColor(event.eventType) }}>
                                    {event.eventType}
                                </div>
                                <h3 className="event-title">{event.title}</h3>
                                <div className="event-meta">
                                    <span><Calendar size={14} /> {new Date(event.date).toLocaleDateString()}</span>
                                    <span><Clock size={14} /> {event.time}</span>
                                </div>
                                <p className="event-desc">{event.description}</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {event.volunteersNeeded && (
                                            <div className="volunteers-badge">
                                                <Flag size={14} /> Volunteers Needed
                                            </div>
                                        )}
                                        <div className="volunteers-badge" style={{ color: '#059669', borderColor: '#a7f3d0', background: '#ecfdf5' }}>
                                            <Ticket size={14} /> Token Required
                                        </div>
                                    </div>

                                    {submissionStatus[event._id] ? (
                                        <button className="btn-token-status ok" disabled>
                                            <CheckCircle size={16} /> Token Acquired
                                        </button>
                                    ) : (
                                        <button className="btn-token-apply" onClick={() => openTokenModal(event)}>
                                            Get Token
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Token Modal for Student */}
                {showTokenModal && selectedEventForToken && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Get Token: {selectedEventForToken.title}</h3>
                                <button className="btn-close" onClick={() => setShowTokenModal(false)}><X size={20} /></button>
                            </div>
                            <div className="modal-body">
                                <p className="modal-desc">Please confirm your preferences:</p>
                                {selectedEventForToken.tokenConfig && selectedEventForToken.tokenConfig.length > 0 ? (
                                    selectedEventForToken.tokenConfig.map((q, idx) => (
                                        <div key={idx} className="token-question">
                                            <label>{q.question}</label>
                                            <select
                                                value={tokenAnswers[q.question] || ''}
                                                onChange={(e) => setTokenAnswers({ ...tokenAnswers, [q.question]: e.target.value })}
                                            >
                                                {q.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    ))
                                ) : (
                                    <p>No specific preference required.</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className={`btn-primary ${submitStatus === 'success' ? 'btn-success' : ''} ${submitStatus === 'error' ? 'btn-error' : ''}`}
                                    onClick={submitTokenRequest}
                                    disabled={submitStatus !== 'idle'}
                                >
                                    {submitStatus === 'submitting' && 'Submitting...'}
                                    {submitStatus === 'success' && 'Success!'}
                                    {submitStatus === 'error' && 'Failed'}
                                    {submitStatus === 'idle' && 'Confirm & Get Token'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: WARDEN / CARETAKER VIEW
    // -------------------------------------------------------------------------
    return (
        <div className="token-allocation-container">
            <div className="ta-header">
                <h2>Token Configuration & Stats</h2>
                <p>Configure questions and manage allocations.</p>
            </div>

            <div className="ta-selector-card">
                <label>Select Event</label>
                <select value={selectedEventId} onChange={handleEventSelect}>
                    <option value="">-- Select an Event --</option>
                    {events.map(ev => (
                        <option key={ev._id} value={ev._id}>
                            {ev.title} ({new Date(ev.date).toLocaleDateString()})
                        </option>
                    ))}
                </select>
            </div>

            {selectedEventId && (
                <div className="ta-content-grid">
                    {/* Builder */}
                    <div className="ta-builder-area">
                        <h3 className="section-title">Configuration</h3>
                        <div className="questions-list">
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="question-card">
                                    <div className="q-header">
                                        <span>Question {qIndex + 1}</span>
                                        <button className="btn-icon-danger" onClick={() => removeQuestion(qIndex)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <input
                                        className="input-question"
                                        placeholder="E.g. Food Preference"
                                        value={q.question}
                                        onChange={(e) => updateQuestion(qIndex, e.target.value)}
                                    />
                                    <div className="options-list">
                                        <label>Options</label>
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="option-row">
                                                <div className="option-dot"></div>
                                                <input
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                />
                                                {q.options.length > 1 && (
                                                    <button className="btn-icon-subtle" onClick={() => removeOption(qIndex, oIndex)}>×</button>
                                                )}
                                            </div>
                                        ))}
                                        <button className="btn-add-option" onClick={() => addOption(qIndex)}>+ Add Option</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="ta-actions">
                            <button className="btn-secondary" onClick={addQuestion}><Plus size={18} /> Add Question</button>
                            <button
                                className={`btn-primary ${saveStatus === 'success' ? 'btn-success' : ''} ${saveStatus === 'error' ? 'btn-error' : ''}`}
                                onClick={handleSave}
                                disabled={saveStatus !== 'idle'}
                            >
                                {saveStatus === 'saving' && 'Saving...'}
                                {saveStatus === 'success' && <><CheckCircle size={18} /> Saved!</>}
                                {saveStatus === 'error' && 'Failed!'}
                                {saveStatus === 'idle' && <><Save size={18} /> Save Configuration</>}
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="ta-stats-area">
                        <h3 className="section-title">Live Statistics</h3>
                        {stats ? (
                            <div className="stats-container">
                                {Object.keys(stats).length === 0 ? (
                                    <p className="no-data">No data yet.</p>
                                ) : (
                                    Object.entries(stats).map(([question, counts], idx) => (
                                        <div key={idx} className="stat-card">
                                            <h4>{question}</h4>
                                            <div className="stat-bars">
                                                {Object.entries(counts).map(([option, count]) => (
                                                    <div key={option} className="stat-row">
                                                        <span className="stat-label">{option}</span>
                                                        <div className="stat-bar-bg">
                                                            <div className="stat-bar-fill" style={{ width: `${Math.max(5, Math.min(100, count * 10))}%` }}></div>
                                                        </div>
                                                        <span className="stat-count">{count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <p>Loading stats...</p>
                        )}
                    </div>
                </div>
            )}

            {selectedEventId && questions.length === 0 && !stats && (
                <div className="empty-config">
                    <HelpCircle size={40} />
                    <p>No questions configured yet.</p>
                    <button className="btn-primary" onClick={addQuestion}>Start Configuring</button>
                </div>
            )}
        </div>
    );
};

export default TokenAllocation;
