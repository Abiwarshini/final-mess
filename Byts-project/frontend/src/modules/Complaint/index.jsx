import React, { useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { api } from "../../utils/api";
import "./style.css";

const Complaint = () => {
  const [userRole, setUserRole] = useState("student");
  const [currentUser, setCurrentUser] = useState(null);
  const [complaints, setComplaints] = useState([]);

  const [formData, setFormData] = useState({
    category: "Food",
    description: "",
    isAnonymous: false,
  });

  const [replyText, setReplyText] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);

  const categories = ["Food", "Cleanliness", "Maintenance", "Discipline", "Others"];

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "student";
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

    setUserRole(role);
    setCurrentUser(user);
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await api.get("/complaints");
      setComplaints(data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description) return;

    try {
      await api.post("/complaints", formData);
      alert("Complaint submitted");
      setFormData({ category: "Food", description: "", isAnonymous: false });
      fetchComplaints();
    } catch (err) {
      alert("Failed to submit complaint");
    }
  };

  const handleReplySubmit = async (id) => {
    if (!replyText[id]) return;

    try {
      await api.post(`/complaints/${id}/reply`, { text: replyText[id] });
      setReplyText({ ...replyText, [id]: "" });
      setActiveReplyId(null);
      fetchComplaints();
    } catch (err) {
      alert("Reply failed");
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="complaint-container">
      <div className="complaint-hero">
        <h2 className="complaint-title">
          {userRole === 'student' ? 'Report Issues' : 'All Complaints'}
        </h2>
        {userRole === "student" && (
          <span className="badge-hostel">Hostel: {currentUser?.hostel}</span>
        )}
        {(userRole === 'warden' || userRole === 'caretaker') && (
          <span className="badge-hostel">Hostel: {currentUser?.hostel} - Staff View</span>
        )}
      </div>

      {userRole === "student" && (
        <div className="complaint-form-card">
          <h3 style={{ marginTop: 0, marginBottom: '4px', color: 'var(--primary-color)', fontSize: '18px', fontWeight: '700' }}>Report an Issue</h3>
          <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: '#6b7280' }}>Tell us about any problems in the hostel. Your feedback helps us improve.</p>
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4b5563' }}>Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4b5563' }}>Describe the Issue</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please provide details about the issue..."
                required
                style={{ minHeight: '120px' }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0', fontWeight: '500', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
              />
              Submit Anonymously (Caretaker can still respond to you)
            </label>

            <button className="btn-primary" type="submit" style={{ marginTop: '8px' }}>
              <Send size={16} /> Submit Complaint
            </button>
          </form>
        </div>
      )}

      <div className="complaints-list">
        <h3 style={{ color: 'var(--primary-color)', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
          {userRole === 'student' ? 'Your Complaints' : 'Hostel Complaints'}
        </h3>

        {complaints.length === 0 ? (
          <div className="empty-state">
            <p>No complaints found</p>
          </div>
        ) : (
          complaints.map((c) => (
            <div className="complaint-card" key={c.id}>
              <div className="card-header">
                <div className="avatar">
                  {c.isAnonymous ? "?" : c.studentName?.[0] || "U"}
                </div>
                <div>
                  <strong>{c.isAnonymous ? "Anonymous" : c.studentName}</strong>
                  <p className="meta">{formatDate(c.createdAt)} • {c.category}</p>
                </div>
                <span className={`status ${c.status === "Resolved" ? "ok" : "pending"}`}>
                  {c.status}
                </span>
              </div>

              <p className="desc">{c.description}</p>

              {c.replies?.length > 0 && (
                <div className="replies">
                  {c.replies.map((r) => (
                    <div key={r.id} className="reply-item">
                      <div className="reply-meta">
                        {r.responderName} ({r.responderRole})
                        <span className="reply-date">{formatDate(r.date)}</span>
                      </div>
                      <p className="reply-text">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {(userRole === "warden" || userRole === "caretaker") && (
                <div className="reply-box">
                  {activeReplyId === c.id ? (
                    <>
                      <input
                        className="reply-input"
                        placeholder="Write reply..."
                        value={replyText[c.id] || ""}
                        onChange={(e) =>
                          setReplyText({ ...replyText, [c.id]: e.target.value })
                        }
                      />
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => handleReplySubmit(c.id)}
                      >
                        Reply
                      </button>
                      <button
                        className="btn-outline btn-sm"
                        onClick={() => setActiveReplyId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="reply-toggle" onClick={() => setActiveReplyId(c.id)}>
                      <MessageSquare size={16} /> Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Complaint;
