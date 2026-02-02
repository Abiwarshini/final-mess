import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { api } from '../../utils/api';
import './style.css';

const Volunteers = () => {
    const [userRole, setUserRole] = useState('student');
    const [currentUser, setCurrentUser] = useState(null);
    const [volunteering, setVolunteering] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showRegistration, setShowRegistration] = useState(null);
    const [registrationData, setRegistrationData] = useState({
        studentName: '',
        roomNo: '',
        mobileNo: ''
    });

    const [formData, setFormData] = useState({
        purpose: '',
        description: '',
        membersNeeded: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        const role = sessionStorage.getItem('userRole');
        const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        setUserRole(role);
        setCurrentUser(user);
        setRegistrationData({
            studentName: user?.name || '',
            roomNo: user?.roomNo || '',
            mobileNo: user?.mobileNo || ''
        });
        fetchVolunteering();
    }, []);

    const fetchVolunteering = async () => {
        try {
            const data = await api.get('/volunteering');
            console.log('Volunteering data received:', data);
            setVolunteering(data);
        } catch (error) {
            console.error('Fetch failed', error);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRegistrationChange = (e) => {
        const { name, value } = e.target;
        setRegistrationData({ ...registrationData, [name]: value });
    };

    const handleCreateVolunteering = async (e) => {
        e.preventDefault();
        if (!formData.purpose || !formData.membersNeeded) return;

        try {
            await api.post('/volunteering', formData);
            alert('Volunteering opportunity created');
            setFormData({ purpose: '', description: '', membersNeeded: '', startDate: '', endDate: '' });
            setShowForm(false);
            fetchVolunteering();
        } catch (error) {
            alert('Failed to create opportunity');
        }
    };

    const handleRegister = async (id) => {
        try {
            const response = await api.post(`/volunteering/${id}/register`, registrationData);
            console.log('Registration response:', response);
            alert('Successfully registered!');
            setShowRegistration(null);
            fetchVolunteering();
        } catch (error) {
            alert('Failed to register: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCancel = async (id, studentId) => {
        if (window.confirm('Remove this registration?')) {
            try {
                await api.post(`/volunteering/${id}/cancel`, { studentId });
                fetchVolunteering();
            } catch (error) {
                alert('Failed to cancel');
            }
        }
    };

    const isRegistered = (opportunity) => {
        const userId = currentUser?.id || currentUser?._id;
        const registered = opportunity.registrations.some(r => r.studentId === userId.toString());
        return registered;
    };

    return (
        <div className="volunteers-container">
            <div className="volunteers-hero">
                <h2 className="volunteers-title">Volunteering Opportunities</h2>
            </div>

            {/* Caretaker: Create Opportunity Form */}
            {(userRole === 'warden' || userRole === 'caretaker') && (
                <div className="create-section">
                    {!showForm ? (
                        <button className="btn-create" onClick={() => setShowForm(true)}>
                            <Plus size={18} /> Create Opportunity
                        </button>
                    ) : (
                        <div className="form-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '18px' }}>Create Volunteering Opportunity</h3>
                                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>×</button>
                            </div>
                            <form onSubmit={handleCreateVolunteering} className="form-grid">
                                <div>
                                    <label>Purpose</label>
                                    <input
                                        type="text"
                                        name="purpose"
                                        value={formData.purpose}
                                        onChange={handleFormChange}
                                        placeholder="e.g., Hostel Cleaning Drive"
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Members Needed</label>
                                    <input
                                        type="number"
                                        name="membersNeeded"
                                        value={formData.membersNeeded}
                                        onChange={handleFormChange}
                                        placeholder="Number of volunteers"
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        placeholder="Describe the volunteering activity..."
                                        style={{ minHeight: '80px' }}
                                    />
                                </div>

                                <div>
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div>
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <button type="submit" className="btn-primary">Create Opportunity</button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Volunteering Opportunities List */}
            <div className="opportunities-list">
                {volunteering.length === 0 ? (
                    <div className="empty-state">
                        <Users size={40} />
                        <p>No volunteering opportunities at the moment</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {volunteering.map(opp => (
                            <div key={opp._id} className="opportunity-card">
                                <div className="card-header">
                                    <div>
                                        <h3 className="opp-title">{opp.purpose}</h3>
                                        <p className="opp-meta">Created by: {opp.createdBy}</p>
                                    </div>
                                    <div className="slots-badge">
                                        {opp.slotsAvailable}/{opp.membersNeeded}
                                    </div>
                                </div>

                                {opp.description && <p className="opp-desc">{opp.description}</p>}

                                {opp.startDate && (
                                    <p className="opp-dates">
                                        📅 {opp.startDate} to {opp.endDate}
                                    </p>
                                )}

                                {/* Student: Registration Form */}
                                {userRole === 'student' && (
                                    <div style={{ marginTop: '12px' }}>
                                        {isRegistered(opp) ? (
                                            <div className="registered-badge">✓ You've registered for this</div>
                                        ) : opp.slotsAvailable > 0 ? (
                                            <>
                                                {showRegistration === opp._id ? (
                                                    <div className="registration-form">
                                                        <input
                                                            type="text"
                                                            name="studentName"
                                                            value={registrationData.studentName}
                                                            onChange={handleRegistrationChange}
                                                            placeholder="Your Name"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="roomNo"
                                                            value={registrationData.roomNo}
                                                            onChange={handleRegistrationChange}
                                                            placeholder="Room Number"
                                                            required
                                                        />
                                                        <input
                                                            type="tel"
                                                            name="mobileNo"
                                                            value={registrationData.mobileNo}
                                                            onChange={handleRegistrationChange}
                                                            placeholder="Mobile Number"
                                                            required
                                                        />
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                className="btn-primary btn-sm"
                                                                onClick={() => handleRegister(opp._id)}
                                                            >
                                                                Register
                                                            </button>
                                                            <button
                                                                className="btn-outline btn-sm"
                                                                onClick={() => setShowRegistration(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="btn-register"
                                                        onClick={() => setShowRegistration(opp._id)}
                                                    >
                                                        Register as Volunteer
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="full-badge">⚠️ No slots available</div>
                                        )}
                                    </div>
                                )}

                                {/* Caretaker/Warden: View Registrations */}
                                {(userRole === 'warden' || userRole === 'caretaker') && (
                                    <div className="registrations-section">
                                        <h4 style={{ marginTop: '16px', marginBottom: '12px', color: 'var(--primary-color)', fontWeight: '600' }}>
                                            Registrations ({opp.registrations.length}/{opp.membersNeeded})
                                        </h4>
                                        {opp.registrations.length === 0 ? (
                                            <p style={{ fontSize: '13px', color: '#6b7280' }}>No registrations yet</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {opp.registrations.map((reg, idx) => (
                                                    <div key={idx} className="registration-item">
                                                        <div>
                                                            <strong>{reg.studentName}</strong>
                                                            <p style={{ margin: '2px 0', fontSize: '12px', color: '#6b7280' }}>
                                                                Room: {reg.roomNo} | Mobile: {reg.mobileNo}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCancel(opp._id, reg.studentId)}
                                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Volunteers;

