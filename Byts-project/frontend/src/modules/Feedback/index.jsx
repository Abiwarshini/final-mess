import React, { useEffect, useState } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';
import { api } from '../../utils/api';
import './style.css';

const Feedback = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('student');
  const [feedbacks, setFeedbacks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, comments: '', isAnonymous: false, topic: 'Mess' });

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    const r = sessionStorage.getItem('userRole') || 'student';
    setCurrentUser(u);
    setUserRole(r);
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const data = await api.get('/feedbacks');
      setFeedbacks(data);
    } catch (err) {
      console.error('Failed to load feedbacks', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };

  const setRating = (r) => setForm((s) => ({ ...s, rating: r }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        rating: Number(form.rating),
        menuItem: form.menuItem || undefined
      };
      console.debug('Submitting feedback payload', payload);
      await api.post('/feedbacks', payload);
      alert('Thanks — feedback submitted');
      setForm({ rating: 5, comments: '', isAnonymous: false, topic: 'Mess', menuItem: '' });
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const avg = feedbacks.length ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1) : null;

  return (
    <div className="feedback-container">
      <div className="feedback-hero">
        <h2>Feedback</h2>
        <p className="muted">Share ratings & comments about the mess, facilities or meetings.</p>
        {avg && (
          <div className="avg-rating">{avg} <span>/ 5</span></div>
        )}
      </div>

      {userRole === 'student' && (
        <div className="feedback-form-card">
          <h3>Give Feedback</h3>
          <p style={{ marginTop: 0, marginBottom: 12, color: '#6b7280' }}>Your honest rating helps the committee improve.</p>
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label className="label">Topic</label>
              <select name="topic" value={form.topic} onChange={handleChange}>
                <option>Mess</option>
                <option>Cleaning</option>
                <option>Facilities</option>
                <option>Others</option>
              </select>

              {form.topic === 'Mess' && (
                <div style={{ marginTop: 10 }}>
                  <label className="label">Food item</label>
                  <select name="menuItem" value={form.menuItem || ''} onChange={handleChange}>
                    <option value="">-- select item --</option>
                    <option>Rice</option>
                    <option>Dal</option>
                    <option>Chapati</option>
                    <option>Sabzi</option>
                    <option>Curd</option>
                    <option>Fry</option>
                    <option>Other</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="label">Rating</label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`star-btn ${r <= form.rating ? 'active' : ''}`}
                    onMouseDown={() => setRating(r)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setRating(r)}
                    aria-label={`Rate ${r}`}
                  >
                    <Star size={18} />
                  </button>
                ))}
              </div>

              {/* explicit rating input to guarantee payload correctness */}
              <input name="rating" type="number" value={form.rating} readOnly style={{ display: 'none' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Comments (optional)</label>
              <textarea name="comments" value={form.comments} onChange={handleChange} placeholder="Anything we should know?" style={{ minHeight: 100 }} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" name="isAnonymous" checked={form.isAnonymous} onChange={handleChange} />
              Submit anonymously
            </label>

            <button className="btn-primary" type="submit" disabled={submitting} style={{ marginTop: 8 }}>
              <Send size={14} /> {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      )}

      <div className="feedback-list">
        <h3 style={{ color: 'var(--primary-color)', marginBottom: 12 }}>{userRole === 'student' ? 'Your feedback' : 'Hostel feedback'}</h3>

        {feedbacks.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={40} />
            <p>No feedback yet</p>
          </div>
        ) : (
          feedbacks.map((f) => (
            <div className="feedback-card" key={f._id}>
              <div className="card-header">
                <div className="avatar">{f.isAnonymous ? '?' : f.studentName?.[0] || 'U'}</div>
                <div>
                  <strong>{f.isAnonymous ? 'Anonymous' : f.studentName}</strong>
                  <p className="meta">{new Date(f.createdAt).toLocaleString()}</p>
                </div>
                <div className="rating-badge">{f.rating} ★</div>
              </div>

              {f.comments && <p className="desc">{f.comments}</p>}
              <div className="meta-row">Topic: <strong>{f.topic}</strong>{f.menuItem ? (<><span className="dot">•</span> Item: <strong>{f.menuItem}</strong></>) : null}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feedback;