import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './style.css';
import { Calendar, Clock, MapPin, Plus, Flag, Ticket, CheckCircle, X } from 'lucide-react';

const Events = () => {
    const [userRole, setUserRole] = useState('student');
    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [submissionStatus, setSubmissionStatus] = useState({}); // { eventId: true/false }

    // Token Apply Modal State
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [selectedEventForToken, setSelectedEventForToken] = useState(null);
    const [tokenAnswers, setTokenAnswers] = useState({}); // { question: answer }

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        volunteersNeeded: false,
        tokenRequired: false,
        eventType: 'Cultural'
    });

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setUserRole(role);
        setCurrentUser(user);
        fetchEvents(user._id);
    }, []);

    const fetchEvents = async (studentId) => {
        try {
            console.log('Fetching events...');
            const data = await api.get('/events');
            console.log('Events fetched:', data);
            setEvents(data);

            // Check submission status for all events if student
            if (studentId) {
                const statusMap = {};
                for (const ev of data) {
                    if (ev.tokenRequired) {
                        try {
                            const res = await api.get(`/events/${ev._id}/token-status/${studentId}`);
                            statusMap[ev._id] = res.submitted;
                        } catch (e) {
                            console.error('Failed to check status', e);
                        }
                    }
                }
                setSubmissionStatus(statusMap);
            }

            setError(null);
        } catch (error) {
            console.error('Failed to fetch events', error);
            setError('Failed to load events. Please try again.');
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, createdBy: currentUser?.id || currentUser?._id };
            await api.post('/events', payload);
            alert('Event created successfully!');
            setShowForm(false);
            setFormData({
                title: '', description: '', date: '', time: '', volunteersNeeded: false, tokenRequired: false, eventType: 'Cultural'
            });
            fetchEvents(currentUser._id);
        } catch (error) {
            alert('Failed to create event');
        }
    };

    const openTokenModal = (event) => {
        setSelectedEventForToken(event);
        // Initialize answers with first option
        const initialAnswers = {};
        if (event.tokenConfig) {
            event.tokenConfig.forEach(q => {
                initialAnswers[q.question] = q.options[0];
            });
        }
        setTokenAnswers(initialAnswers);
        setShowTokenModal(true);
    };

    const handleAnswerChange = (question, answer) => {
        setTokenAnswers({ ...tokenAnswers, [question]: answer });
    };

    const [submitStatus, setSubmitStatus] = useState('idle'); // idle, submitting, success, error

    const submitTokenRequest = async () => {
        if (!selectedEventForToken) return;

        const responses = Object.keys(tokenAnswers).map(q => ({
            question: q,
            answer: tokenAnswers[q]
        }));

        setSubmitStatus('submitting');
        try {
            await api.post(`/events/${selectedEventForToken._id}/token-submit`, {
                studentId: currentUser._id,
                responses
            });
            setSubmitStatus('success');
            setSubmissionStatus({ ...submissionStatus, [selectedEventForToken._id]: true });
            setTimeout(() => {
                setShowTokenModal(false);
                setSubmitStatus('idle');
            }, 1500);
        } catch (error) {
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus('idle'), 2000);
        }
    };

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

    return (
        <div className="events-container">
            <div className="events-header">
                <h2>Upcoming Events</h2>
                {userRole === 'warden' && (
                    <button className="btn-create-event" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : <><Plus size={18} /> Create Event</>}
                    </button>
                )}
            </div>

            {error && (
                <div style={{ color: 'red', marginBottom: '20px', padding: '10px', background: '#fee2e2', borderRadius: '8px' }}>
                    {error}
                </div>
            )}

            {showForm && (
                <div className="event-form-card">
                    <h3>Create New Event</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Event Title</label>
                            <input required type="text" name="title" value={formData.title} onChange={handleFormChange} />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea required name="description" value={formData.description} onChange={handleFormChange} rows="3" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Date</label>
                                <input required type="date" name="date" value={formData.date} onChange={handleFormChange} />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input required type="time" name="time" value={formData.time} onChange={handleFormChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Event Type</label>
                                <select name="eventType" value={formData.eventType} onChange={handleFormChange}>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Meeting">Meeting</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input type="checkbox" name="volunteersNeeded" checked={formData.volunteersNeeded} onChange={handleFormChange} />
                                    Volunteers Needed?
                                </label>
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input type="checkbox" name="tokenRequired" checked={formData.tokenRequired} onChange={handleFormChange} />
                                    Token Required?
                                </label>
                            </div>
                        </div>
                        <button type="submit" className="btn-submit-event">Create Event</button>
                    </form>
                </div>
            )}

            <div className="events-grid">
                {events.length === 0 ? (
                    <p className="no-events">No upcoming events scheduled.</p>
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
                                    {event.tokenRequired && (
                                        <div className="volunteers-badge" style={{ color: '#059669', borderColor: '#a7f3d0', background: '#ecfdf5' }}>
                                            <Ticket size={14} /> Token Required
                                        </div>
                                    )}
                                </div>

                                {event.tokenRequired && userRole === 'student' && (
                                    <>
                                        {submissionStatus[event._id] ? (
                                            <button className="btn-token-status ok" disabled>
                                                <CheckCircle size={16} /> Token Acquired
                                            </button>
                                        ) : (
                                            <button className="btn-token-apply" onClick={() => openTokenModal(event)}>
                                                Get Token
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Token Modal */}
            {showTokenModal && selectedEventForToken && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Get Token for {selectedEventForToken.title}</h3>
                            <button className="btn-close" onClick={() => setShowTokenModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-desc">Please answer the following to generate your token:</p>

                            {selectedEventForToken.tokenConfig && selectedEventForToken.tokenConfig.length > 0 ? (
                                selectedEventForToken.tokenConfig.map((q, idx) => (
                                    <div key={idx} className="token-question">
                                        <label>{q.question}</label>
                                        <select
                                            value={tokenAnswers[q.question] || ''}
                                            onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                        >
                                            {q.options.map((opt, i) => (
                                                <option key={i} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))
                            ) : (
                                <p>No specific preference required. Click confirm to proceed.</p>
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
};

export default Events;
