import React, { useState, useEffect } from 'react';
import './style.css';
import { api } from '../../utils/api';

const MessCommiteeMeeting = () => {
  const [userRole, setUserRole] = useState('student');
  const [currentUser, setCurrentUser] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [rsvpResponse, setRsvpResponse] = useState({}); // Map of meetingId -> { attending: bool, submitted: bool }

  // Form State
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    venue: '',
    members: 'All Committee Members'
  });

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (role) setUserRole(role);
    setCurrentUser(user);
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const data = await api.get('/meetings');
      setMeetings(data);
    } catch (error) {
      console.error("Failed to fetch meetings", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      venue: '',
      members: 'All Committee Members'
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.venue) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/meetings/${currentId}`, formData);
        alert("Meeting updated successfully");
      } else {
        await api.post('/meetings', formData);
        alert("Meeting scheduled successfully");
      }
      fetchMeetings();
      resetForm();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (meeting) => {
    setFormData({
      date: meeting.date,
      time: meeting.time,
      venue: meeting.venue,
      members: meeting.members
    });
    setIsEditing(true);
    setCurrentId(meeting._id); // MongoDB uses _id
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this meeting?')) {
      try {
        await api.delete(`/meetings/${id}`);
        fetchMeetings();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleRsvpSubmit = async (meetingId, attending) => {
    try {
      await api.post(`/meetings/${meetingId}/rsvp`, {
        studentId: currentUser?.id || 'unknown',
        studentName: currentUser?.name || 'Anonymous Student',
        attending
      });
      setRsvpResponse({
        ...rsvpResponse,
        [meetingId]: { attending, submitted: true }
      });
      fetchMeetings();
    } catch (error) {
      console.error('RSVP Error:', error);
      alert('Failed to submit RSVP: ' + (error.response?.data?.message || error.message));
    }
  };

  // Helper to format date for display
  const getMonthDay = (dateString) => {
    if (!dateString) return { month: 'JAN', day: '01' };
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  return (
    <div className="mess-committee-meeting-container">
      <h2>
        Mess Committee Meeting
        {userRole === 'student' && <span style={{ fontSize: '14px', fontWeight: '400', color: '#a0aec0', marginLeft: '10px' }}>(View Only)</span>}
      </h2>

      {/* Staff Only (Warden/Caretaker): Schedule Meeting Form */}
      {(userRole === 'warden' || userRole === 'caretaker') && (
        <div className="schedule-meeting-section" style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>{isEditing ? 'Reschedule Meeting' : 'Schedule New Meeting'}</h3>

          <form onSubmit={handleSchedule} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Venue</label>
              <input
                type="text"
                name="venue"
                placeholder="e.g. Conference Hall"
                value={formData.venue}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Members to Attend</label>
              <select
                name="members"
                value={formData.members}
                onChange={handleInputChange}
                style={inputStyle}
              >
                <option>All Committee Members</option>
                <option>Student Representatives Only</option>
                <option>Wardens Only</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
              <button type="submit" style={btnStyle}>
                {isEditing ? 'Update Meeting' : 'Schedule Meeting'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} style={{ ...btnStyle, background: '#718096' }}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Dynamic View: Upcoming Meetings */}
      <div className="upcoming-meetings">
        <h3 style={{ color: '#2b3674' }}>Upcoming Meetings</h3>

        {meetings.length === 0 ? (
          <p style={{ color: '#a0aec0', fontStyle: 'italic' }}>No meetings scheduled yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {meetings.map(meeting => {
              const { month, day } = getMonthDay(meeting.date);
              const meetingId = meeting._id || meeting.id;
              return (
                <div key={meetingId} className="meeting-card" style={cardStyle}>
                  <div style={dateBoxStyle}>
                    <span style={{ fontSize: '12px', opacity: 0.8 }}>{month}</span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{day}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>Mess Committee Meeting</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#718096' }}>
                      Venue: <strong>{meeting.venue}</strong> • Time: <strong>{meeting.time}</strong>
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#718096' }}>
                      Attendees: {meeting.members}
                    </p>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--secondary-color)', fontWeight: '500' }}>
                      Status: {meeting.status}
                    </div>

                    {/* Staff: Show attendance count */}
                    {(userRole === 'warden' || userRole === 'caretaker') && (
                      <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f0f9ff', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#0369a1' }}>
                        📊 Attending: <strong>{meeting.attendingCount || 0}</strong> students
                      </div>
                    )}

                    {/* Student: RSVP Form */}
                    {userRole === 'student' && !rsvpResponse[meetingId]?.submitted && (
                      <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#92400e' }}>Will you attend this meeting?</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleRsvpSubmit(meetingId, true)}
                            style={{ padding: '6px 14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                          >
                            Yes, I'll Attend
                          </button>
                          <button 
                            onClick={() => handleRsvpSubmit(meetingId, false)}
                            style={{ padding: '6px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                          >
                            No, Can't Attend
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Student: RSVP Confirmation */}
                    {userRole === 'student' && rsvpResponse[meetingId]?.submitted && (
                      <div style={{ marginTop: '12px', padding: '10px 12px', background: rsvpResponse[meetingId]?.attending ? '#dcfce7' : '#fee2e2', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: rsvpResponse[meetingId]?.attending ? '#15803d' : '#b91c1c' }}>
                        ✓ {rsvpResponse[meetingId]?.attending ? 'You will attend this meeting' : 'You cannot attend this meeting'}
                      </div>
                    )}
                  </div>

                  {/* Staff (Warden/Caretaker) Actions */}
                  {(userRole === 'warden' || userRole === 'caretaker') && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(meeting)} style={actionBtnStyle}>Edit</button>
                      <button onClick={() => handleCancel(meetingId)} style={{ ...actionBtnStyle, color: '#e53e3e', borderColor: '#e53e3e' }}>Cancel</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--text-muted)',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid var(--text-muted)',
  outline: 'none',
  boxSizing: 'border-box'
};

const btnStyle = {
  gridColumn: '1 / -1',
  background: 'var(--secondary-color)',
  color: 'white',
  padding: '12px 20px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: '600',
  cursor: 'pointer',
  width: 'fit-content'
};

const cardStyle = {
  display: 'flex',
  gap: '15px',
  background: 'white',
  padding: '15px',
  borderRadius: '12px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  border: '1px solid #f1f5f9',
  alignItems: 'center'
};

const dateBoxStyle = {
  background: 'var(--secondary-color)',
  color: 'white',
  padding: '10px',
  borderRadius: '10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: '50px'
};

const actionBtnStyle = {
  background: 'none',
  border: '1px solid var(--secondary-color)',
  color: 'var(--secondary-color)',
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600'
};

export default MessCommiteeMeeting;
