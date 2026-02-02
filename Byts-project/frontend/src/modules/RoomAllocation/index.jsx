import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './style.css';
import { Home, Users, CheckCircle, UserPlus, X, Bell, UserCheck, UserX, Search, PlusCircle, MessageCircle } from 'lucide-react';

const RoomAllocation = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [sharingType, setSharingType] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [eligibleStudents, setEligibleStudents] = useState([]);
    const [selectedRoommates, setSelectedRoommates] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [allocationStatus, setAllocationStatus] = useState(null);
    const [allocatedRoom, setAllocatedRoom] = useState(null);
    const [activeTab, setActiveTab] = useState('new'); // 'new', 'browse', 'my-mate'
    const [openMateRequests, setOpenMateRequests] = useState([]);
    const [myMateRequests, setMyMateRequests] = useState([]);

    const fetchUserProfile = async () => {
        try {
            const userData = await api.get('/auth/me');
            const storedUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
            const updatedUser = { ...userData, token: storedUser.token };

            sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);

            if (updatedUser.hasRoom) {
                setAllocationStatus('already_allocated');
                // Fetch room details only if hasRoom is true
                try {
                    const roomData = await api.get('/rooms/my-room');
                    setAllocatedRoom(roomData);
                } catch (roomError) {
                    console.error('Failed to fetch allocated room', roomError);
                    // If room fetch fails, it means hasRoom was stale or broken
                    // The backend getMyRoom already resets the state, so we just reset local state
                    setAllocationStatus(null);
                    const freshUser = await api.get('/auth/me');
                    setCurrentUser({ ...freshUser, token: storedUser.token });
                }
            } else {
                setAllocationStatus(null);
                fetchMyRequests(updatedUser._id);
                fetchOpenMateRequests(updatedUser.hostel);
                fetchMyMateRequests(updatedUser._id);
            }
        } catch (error) {
            console.error('Failed to sync profile', error);
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (sharingType && currentUser) {
            fetchRooms();
            fetchEligibleStudents();
            setSelectedRoom(null);
            setSelectedRoommates([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sharingType, currentUser]);

    const fetchRooms = async () => {
        try {
            const rooms = await api.get(`/rooms/available?type=${sharingType}&hostel=${encodeURIComponent(currentUser.hostel)}`);
            setAvailableRooms(rooms);
        } catch (error) {
            console.error('Failed to fetch rooms', error);
        }
    };

    const fetchEligibleStudents = async () => {
        try {
            const students = await api.get(`/rooms/eligible-students?hostel=${encodeURIComponent(currentUser.hostel)}&excludeUserId=${currentUser._id}`);
            setEligibleStudents(students);
        } catch (error) {
            console.error('Failed to fetch students', error);
        }
    };

    const fetchMyRequests = async (userId) => {
        try {
            const requests = await api.get(`/rooms/requests/${userId}`);
            setMyRequests(requests);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        }
    };

    const fetchOpenMateRequests = async (hostel) => {
        try {
            const requests = await api.get(`/rooms/mate-requests/open?hostel=${encodeURIComponent(hostel)}`);
            setOpenMateRequests(requests);
        } catch (error) {
            console.error('Failed to fetch mate requests', error);
        }
    };

    const fetchMyMateRequests = async (userId) => {
        try {
            const requests = await api.get(`/rooms/mate-requests/my/${userId}`);
            setMyMateRequests(requests);
        } catch (error) {
            console.error('Failed to fetch my mate requests', error);
        }
    };

    const handleRoommateToggle = (student) => {
        if (selectedRoommates.find(s => s._id === student._id)) {
            setSelectedRoommates(prev => prev.filter(s => s._id !== student._id));
        } else {
            if (selectedRoommates.length < (sharingType - 1)) {
                setSelectedRoommates(prev => [...prev, student]);
            }
        }
    };

    const handleSendInvitation = async () => {
        if (!selectedRoom || selectedRoommates.length !== (sharingType - 1)) return;

        setLoading(true);
        try {
            await api.post('/rooms/request', {
                roomId: selectedRoom._id,
                initiatorId: currentUser._id,
                roommateIds: selectedRoommates.map(s => s._id)
            });

            alert('Invitations sent successfully!');
            fetchMyRequests(currentUser._id);
            setSharingType(null);
            setSelectedRoom(null);
            setSelectedRoommates([]);
        } catch (error) {
            alert(error.message || 'Failed to send invitations');
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (requestId, status) => {
        setLoading(true);
        try {
            await api.post('/rooms/request/respond', {
                requestId,
                studentId: currentUser._id,
                status
            });

            if (status === 'accepted') {
                alert('Invitation accepted!');
                // Check if this acceptance finalized the room
                fetchUserProfile();
            } else {
                alert('Request rejected');
                fetchMyRequests(currentUser._id);
            }
        } catch (error) {
            alert(error.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePostMateRequest = async () => {
        if (!selectedRoom || !sharingType) return;
        setLoading(true);
        try {
            await api.post('/rooms/mate-request', {
                roomId: selectedRoom._id,
                initiatorId: currentUser._id,
                existingRoommateIds: selectedRoommates.map(s => s._id),
                hostel: currentUser.hostel,
                sharingType: sharingType
            });
            alert('Roommate request posted successfully!');
            fetchMyMateRequests(currentUser._id);
            fetchOpenMateRequests(currentUser.hostel);
            setActiveTab('my-mate');
            setSharingType(null);
            setSelectedRoom(null);
            setSelectedRoommates([]);
        } catch (error) {
            alert(error.message || 'Failed to post request');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyMate = async (requestId) => {
        setLoading(true);
        try {
            await api.post('/rooms/mate-request/apply', {
                requestId,
                studentId: currentUser._id
            });
            alert('Application sent successfully!');
            fetchMyMateRequests(currentUser._id);
            setActiveTab('my-mate');
        } catch (error) {
            alert(error.message || 'Failed to apply');
        } finally {
            setLoading(false);
        }
    };

    const handleMateAppResponse = async (requestId, applicantId, status) => {
        setLoading(true);
        try {
            await api.post('/rooms/mate-request/handle-app', {
                requestId,
                applicantId,
                status
            });
            alert(`Application ${status === 'accepted' ? 'accepted' : 'rejected'}!`);
            fetchMyMateRequests(currentUser._id);
            if (status === 'accepted') {
                // If this filled the room, we might need a profile sync
                fetchUserProfile();
            }
        } catch (error) {
            alert(error.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="room-allocation-container loading">
                <div className="loader-box">
                    <div className="spinner"></div>
                    <p>Syncing your allocation status...</p>
                </div>
            </div>
        );
    }

    if (allocationStatus === 'already_allocated') {
        return (
            <div className="room-allocation-container success">
                <div className="allocated-card">
                    <div className="allocated-header">
                        <CheckCircle size={48} color="#10b981" />
                        <div>
                            <h2>Room Allocated</h2>
                            <p className="room-badge">Room {allocatedRoom?.roomNumber}</p>
                        </div>
                    </div>

                    <div className="roommates-details">
                        <h3>Your Roommates</h3>
                        <div className="roommates-grid">
                            {allocatedRoom?.students
                                .filter(s => s._id !== currentUser?._id)
                                .map(student => (
                                    <div key={student._id} className="roommate-info-card">
                                        <div className="avatar">
                                            {student.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="details">
                                            <p className="name">{student.name}</p>
                                            <p className="roll">{student.rollNo}</p>
                                        </div>
                                    </div>
                                ))}
                            {allocatedRoom?.students.length === 1 && (
                                <p className="single-occupant">You are the only person in this room.</p>
                            )}
                        </div>
                    </div>

                    <div className="room-info-footer">
                        <p><strong>Hostel:</strong> {allocatedRoom?.hostel}</p>
                        <p><strong>Type:</strong> {allocatedRoom?.type} Sharing</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="room-allocation-container">
            <header className="module-header">
                <h1>Room Allocation</h1>
                <p>Select your sharing preference and invite roommates for <strong>{currentUser?.hostel}</strong>.</p>
            </header>

            <div className="roommate-tabs">
                <button
                    className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
                    onClick={() => setActiveTab('new')}
                >
                    <PlusCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    New Allocation
                </button>
                <button
                    className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
                    onClick={() => setActiveTab('browse')}
                >
                    <Search size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Browse Roommates
                </button>
                <button
                    className={`tab-btn ${activeTab === 'my-mate' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-mate')}
                >
                    <Bell size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    My Requests {myMateRequests.length > 0 && <span className="notification-badge">{myMateRequests.length}</span>}
                </button>
            </div>

            {/* Main Content Based on Tabs */}
            {activeTab === 'new' && (
                <>
                    {myRequests.length > 0 && (
                        <section className="invitations-section">
                            <div className="section-title">
                                <Bell size={20} />
                                <h3>{myRequests.some(req => req.roommates.find(r => r.student._id === currentUser?._id)?.status === 'accepted' || req.initiator._id === currentUser?._id) ? 'Your Room Allocation Status' : 'Pending Invitations'}</h3>
                            </div>
                            <div className="requests-list">
                                {myRequests.map(req => {
                                    const myStatus = req.roommates.find(r => r.student._id === currentUser?._id)?.status;
                                    const isInitiator = req.initiator._id === currentUser?._id;
                                    const hasAccepted = isInitiator || myStatus === 'accepted';

                                    return (
                                        <div key={req._id} className={`request-card ${hasAccepted ? 'confirmed-card' : ''}`}>
                                            <div className="request-info">
                                                <div className="room-info-header">
                                                    <Home size={24} className="room-icon" />
                                                    <div>
                                                        <p className="room-no">Room {req.room?.roomNumber}</p>
                                                        <p className="room-type">{req.room?.type} Sharing</p>
                                                    </div>
                                                </div>

                                                <div className="allocation-details">
                                                    <p className="detail-label">Roommates</p>
                                                    <div className="roommates-inline-list">
                                                        <span className="roommate-tag initiator">
                                                            {req.initiator.name} (Initiator)
                                                        </span>
                                                        {req.roommates.map(r => (
                                                            <span key={r.student._id} className={`roommate-tag ${r.status}`}>
                                                                {r.student.name} ({r.status})
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {!hasAccepted ? (
                                                <div className="request-actions">
                                                    <button className="btn-accept" onClick={() => handleRespond(req._id, 'accepted')} disabled={loading}>
                                                        <UserCheck size={18} /> Accept
                                                    </button>
                                                    <button className="btn-reject" onClick={() => handleRespond(req._id, 'rejected')} disabled={loading}>
                                                        <UserX size={18} /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="confirmed-status">
                                                    <CheckCircle size={20} color="#10b981" />
                                                    <span>
                                                        {isInitiator ? 'Request Sent' : 'Invitation Accepted'}
                                                        <small>Awaiting response from others</small>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Only show registration form if NO invitations/requests exist */}
                    {myRequests.length === 0 ? (
                        <>
                            <div className="sharing-selector">
                                {[2, 3, 4].map(type => (
                                    <button
                                        key={type}
                                        className={`sharing-btn ${sharingType === type ? 'active' : ''}`}
                                        onClick={() => setSharingType(type)}
                                    >
                                        <Users size={24} />
                                        <span>{type} Sharing</span>
                                    </button>
                                ))}
                            </div>

                            {sharingType && (
                                <div className="allocation-grid">
                                    <section className="rooms-section">
                                        <h3>Available Rooms ({availableRooms.length})</h3>
                                        <div className="rooms-list">
                                            {availableRooms.length === 0 ? (
                                                <p className="empty-msg">No rooms available.</p>
                                            ) : (
                                                availableRooms.map(room => (
                                                    <div
                                                        key={room._id}
                                                        className={`room-card ${selectedRoom?._id === room._id ? 'selected' : ''}`}
                                                        onClick={() => setSelectedRoom(room)}
                                                    >
                                                        <Home size={20} />
                                                        <span>Room {room.roomNumber}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </section>

                                    <section className="roommates-section">
                                        <h3>Select Roommates ({selectedRoommates.length}/{sharingType - 1})</h3>
                                        <div className="students-list">
                                            {eligibleStudents.length === 0 ? (
                                                <div className="empty-msg-box">
                                                    <p className="empty-msg">No eligible roommates found.</p>
                                                </div>
                                            ) : (
                                                eligibleStudents.map(student => (
                                                    <div
                                                        key={student._id}
                                                        className={`student-card ${selectedRoommates.find(s => s._id === student._id) ? 'selected' : ''}`}
                                                        onClick={() => handleRoommateToggle(student)}
                                                    >
                                                        <div className="student-info">
                                                            <span className="student-name">{student.name}</span>
                                                            <span className="student-roll">{student.rollNo || 'No Roll No'}</span>
                                                        </div>
                                                        {selectedRoommates.find(s => s._id === student._id) ? <X size={18} /> : <UserPlus size={18} />}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {selectedRoom && (
                                <div className="booking-summary-inline">
                                    <div className="booking-card">
                                        <h3>Room Booking Summary</h3>
                                        <div className="summary-info">
                                            <p><strong>Room:</strong> {selectedRoom.roomNumber} ({sharingType} Sharing)</p>
                                            <p><strong>Initiator:</strong> {currentUser.name}</p>
                                            {selectedRoommates.length > 0 ? (
                                                <>
                                                    <p><strong>Inviting:</strong></p>
                                                    <ul>
                                                        {selectedRoommates.map(s => <li key={s._id}>{s.name} ({s.rollNo})</li>)}
                                                    </ul>
                                                </>
                                            ) : (
                                                <p><strong>Wait!</strong> You are booking this room alone.</p>
                                            )}
                                        </div>

                                        {selectedRoommates.length === (sharingType - 1) ? (
                                            <>
                                                <p className="hint-text">Allocation will update once everyone accepts.</p>
                                                <button className="btn-book" disabled={loading} onClick={handleSendInvitation}>
                                                    {loading ? 'Sending...' : 'Send Invitations'}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <p className="hint-text">You haven't selected enough roommates. You can post a public request instead.</p>
                                                <button className="btn-book" style={{ background: '#8b5cf6' }} disabled={loading} onClick={handlePostMateRequest}>
                                                    {loading ? 'Posting...' : 'Post Need for Roommate'}
                                                </button>
                                            </>
                                        )}
                                        <button className="btn-cancel" onClick={() => { setSelectedRoom(null); setSelectedRoommates([]); }}>Clear Selection</button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null}
                </>
            )}

            {activeTab === 'browse' && (
                <section className="browse-mates-section">
                    <div className="section-title">
                        <Search size={20} />
                        <h3>Browse Available Roommates</h3>
                    </div>
                    {openMateRequests.length === 0 ? (
                        <div className="empty-state">
                            <Users size={48} color="#cbd5e1" />
                            <p>No open roommate requests.</p>
                        </div>
                    ) : (
                        <div className="mate-requests-grid">
                            {openMateRequests.map(req => (
                                <div key={req._id} className="mate-request-card">
                                    <div className="mate-request-header">
                                        <h4>{req.initiator.name}'s Group</h4>
                                        <span className="sharing-tag">{req.sharingType} Sharing</span>
                                    </div>
                                    <div className="mate-request-body">
                                        <p><strong>Room:</strong> {req.room?.roomNumber}</p>
                                        <p><strong>Current Mates:</strong></p>
                                        <div className="existing-mates">
                                            <span className="mate-mini-tag">{req.initiator.name}</span>
                                            {req.existingRoommates.map(m => (
                                                <span key={m._id} className="mate-mini-tag">{m.name}</span>
                                            ))}
                                        </div>
                                        <p style={{ marginTop: '1rem', color: '#64748b' }}>
                                            Looking for {req.sharingType - 1 - req.existingRoommates.length} more roommate(s).
                                        </p>
                                    </div>
                                    <button
                                        className="btn-apply"
                                        disabled={loading || myMateRequests.some(mr => mr._id === req._id)}
                                        onClick={() => handleApplyMate(req._id)}
                                    >
                                        {myMateRequests.some(mr => mr._id === req._id) ? 'Already Applied' : 'Apply to Join'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {activeTab === 'my-mate' && (
                <section className="my-mate-requests-section">
                    <div className="section-title">
                        <MessageCircle size={20} />
                        <h3>My Roommate Search Activity</h3>
                    </div>
                    {myMateRequests.length === 0 ? (
                        <div className="empty-state">
                            <p>You haven't posted or applied to any roommate requests yet.</p>
                        </div>
                    ) : (
                        <div className="mate-requests-grid">
                            {myMateRequests.map(req => {
                                const isInitiator = req.initiator._id === currentUser._id;
                                return (
                                    <div key={req._id} className={`mate-request-card ${isInitiator ? 'my-mate-request-card' : ''}`}>
                                        <div className="mate-request-header">
                                            <h4>{isInitiator ? 'My Group Request' : `${req.initiator.name}'s Group`}</h4>
                                            <span className={`mate-status ${req.status}`}>{req.status}</span>
                                        </div>
                                        <div className="mate-request-body">
                                            <p><strong>Room:</strong> {req.room?.roomNumber}</p>
                                            <p><strong>Team:</strong> {req.initiator.name}, {req.existingRoommates.map(m => m.name).join(', ')}</p>

                                            {isInitiator && req.status === 'open' && (
                                                <div className="applicants-list">
                                                    <p className="detail-label">Applicants</p>
                                                    {req.applicants.filter(a => a.status === 'pending').length === 0 ? (
                                                        <p className="helper-msg">No pending applicants yet.</p>
                                                    ) : (
                                                        req.applicants.filter(a => a.status === 'pending').map(app => (
                                                            <div key={app.student._id} className="applicant-item">
                                                                <div className="applicant-info">
                                                                    <p className="student-name">{app.student.name}</p>
                                                                    <p className="student-roll">{app.student.rollNo}</p>
                                                                </div>
                                                                <div className="applicant-actions">
                                                                    <button className="btn-icon accept" title="Accept" onClick={() => handleMateAppResponse(req._id, app.student._id, 'accepted')}>
                                                                        <UserCheck size={16} />
                                                                    </button>
                                                                    <button className="btn-icon reject" title="Reject" onClick={() => handleMateAppResponse(req._id, app.student._id, 'rejected')}>
                                                                        <UserX size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}

                                            {!isInitiator && (
                                                <div className="app-status">
                                                    <p>My Application: <span className={`status-pill ${req.applicants.find(a => a.student._id === currentUser._id)?.status}`}>
                                                        {req.applicants.find(a => a.student._id === currentUser._id)?.status}
                                                    </span></p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default RoomAllocation;
