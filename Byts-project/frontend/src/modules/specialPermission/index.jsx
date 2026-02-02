import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import './style.css';
import { Clock, Calendar, FileText, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

const SpecialPermission = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState('student');
    const [currentUser, setCurrentUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('new'); // for student: new | history

    // Form State
    const [formData, setFormData] = useState({
        outDate: '',
        inDate: '',
        outTime: '',
        inTime: '',
        reason: '',
        description: ''
    });

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setUserRole(role);
        setCurrentUser(user);
        fetchRequests(role, user.id || user._id);
    }, []);

    const fetchRequests = async (role, userId) => {
        try {
            const data = await api.get(`/special-permission?role=${role}&userId=${userId}`);
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                studentId: currentUser.id || currentUser._id,
                studentName: currentUser.name,
                roomNo: currentUser.roomNo || currentUser.room || 'N/A'
            };
            await api.post('/special-permission', payload);
            alert('Request submitted successfully!');
            setFormData({
                outDate: '', inDate: '', outTime: '', inTime: '', reason: '', description: ''
            });
            fetchRequests(userRole, currentUser.id || currentUser._id);
            setActiveTab('history');
        } catch (error) {
            alert('Failed to submit request');
        }
    };

    const handleAction = async (id, status) => {
        let rejectionReason = '';
        if (status === 'Rejected') {
            rejectionReason = prompt('Enter reason for rejection:');
            if (!rejectionReason) return;
        }

        try {
            await api.put(`/special-permission/${id}/status`, {
                status,
                wardenId: currentUser.id || currentUser._id,
                rejectionReason
            });
            fetchRequests(userRole, currentUser.id || currentUser._id);
        } catch (error) {
            alert('Failed to update status');
        }
    };

    // --- RENDER HELPERS ---

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'danger';
            case 'Hold': return 'warning';
            default: return 'neutral';
        }
    };

    const renderStudentView = () => (
        <div className="sp-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Leave Requests</h2>
                <button 
                    onClick={() => navigate('/leaves')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Leaves <ArrowRight size={16} />
                </button>
            </div>
            <div className="sp-tabs">
                <button
                    className={`sp-tab ${activeTab === 'new' ? 'active' : ''}`}
                    onClick={() => setActiveTab('new')}
                >
                    New Request
                </button>
                <button
                    className={`sp-tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>

            {activeTab === 'new' ? (
                <div className="sp-form-card">
                    <h3>Apply for Special Permission</h3>
                    <form onSubmit={handleSubmit} className="sp-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Out Date</label>
                                <input required type="date" name="outDate" value={formData.outDate} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Out Time</label>
                                <input required type="time" name="outTime" value={formData.outTime} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>In Date</label>
                                <input required type="date" name="inDate" value={formData.inDate} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>In Time</label>
                                <input required type="time" name="inTime" value={formData.inTime} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Reason (One line)</label>
                            <input required type="text" name="reason" maxLength="100" value={formData.reason} onChange={handleInputChange} placeholder="Brief reason..." />
                        </div>
                        <div className="form-group">
                            <label>Description (approx 5 lines)</label>
                            <textarea required name="description" maxLength="500" value={formData.description} onChange={handleInputChange} rows="5" placeholder="Detailed description..." />
                        </div>
                        <button type="submit" className="btn-submit">Submit Request</button>
                    </form>
                </div>
            ) : (
                <div className="sp-list">
                    {requests.map(req => (
                        <div key={req._id} className={`sp-card status-${req.status.toLowerCase()}`}>
                            <div className="sp-card-header">
                                <span className={`status-badge ${getStatusColor(req.status)}`}>{req.status}</span>
                                <span className="sp-date">{new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4>{req.reason}</h4>
                            <p className="sp-desc">{req.description}</p>
                            <div className="sp-details">
                                <span>📤 {new Date(req.outDate).toLocaleDateString()} at {req.outTime}</span>
                                <span>📥 {new Date(req.inDate).toLocaleDateString()} at {req.inTime}</span>
                            </div>
                            {req.rejectionReason && (
                                <div className="rejection-note">
                                    <strong>Warden Note:</strong> {req.rejectionReason}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderWardenView = () => (
        <div className="sp-container">
            <h3>Student Leave Requests</h3>
            <div className="sp-list">
                {requests.map(req => (
                    <div key={req._id} className="sp-card">
                        <div className="sp-card-header">
                            <div>
                                <strong>{req.studentName}</strong> <span className="room-badge">{req.roomNo}</span>
                            </div>
                            <span className={`status-badge ${getStatusColor(req.status)}`}>{req.status}</span>
                        </div>
                        <div className="sp-card-body">
                            <p><strong>Reason:</strong> {req.reason}</p>
                            <p><strong>Description:</strong> {req.description}</p>
                            <div className="sp-time-row">
                                <span>From: {new Date(req.outDate).toLocaleDateString()} {req.outTime}</span>
                                <span>To: {new Date(req.inDate).toLocaleDateString()} {req.inTime}</span>
                            </div>
                        </div>

                        {req.status !== 'Approved' && (
                            <div className="sp-actions">
                                {req.status !== 'Approved' && (
                                    <button
                                        onClick={() => handleAction(req._id, 'Approved')}
                                        className="btn-action approve"
                                        disabled={req.status === 'Approved'}
                                    >
                                        Accept
                                    </button>
                                )}
                                <button
                                    onClick={() => handleAction(req._id, 'Rejected')}
                                    className="btn-action reject"
                                    disabled={req.status === 'Approved'}
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleAction(req._id, 'Hold')}
                                    className="btn-action hold"
                                    disabled={req.status === 'Approved'}
                                >
                                    Hold
                                </button>
                            </div>
                        )}
                        {req.rejectionReason && <p className="rejection-msg">Reason: {req.rejectionReason}</p>}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCaretakerView = () => (
        <div className="sp-container">
            <h3>Approved Leave Requests</h3>
            <div className="table-responsive">
                <table className="sp-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Room No</th>
                            <th>Out Date/Time</th>
                            <th>In Date/Time</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No approved requests</td></tr>
                        ) : (
                            requests.map(req => (
                                <tr key={req._id}>
                                    <td>{req.studentName}</td>
                                    <td>{req.roomNo}</td>
                                    <td>{new Date(req.outDate).toLocaleDateString()} {req.outTime}</td>
                                    <td>{new Date(req.inDate).toLocaleDateString()} {req.inTime}</td>
                                    <td>{req.reason}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="special-permission-module">
            {userRole === 'student' && renderStudentView()}
            {userRole === 'warden' && renderWardenView()}
            {userRole === 'caretaker' && renderCaretakerView()}
        </div>
    );
};

export default SpecialPermission;
