import React, { useState, useEffect } from 'react';
import './style.css';
import { api } from '../../utils/api';

const WorkTransparency = () => {
  const [userRole, setUserRole] = useState('student');
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    date: '',
    hostelName: '',
    caption: '',
    workType: 'Washroom Cleaning'
  });

  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    if (role) setUserRole(role);
    setCurrentUser(user);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await api.get('/work-transparency');
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      hostelName: '',
      caption: '',
      workType: 'Washroom Cleaning'
    });
    setSelectedImage(null);
    setImagePreview(null);
    setIsEditing(false);
    setCurrentId(null);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.hostelName || !formData.caption) {
      alert("Please fill all fields");
      return;
    }

    if (!isEditing && !selectedImage) {
      alert("Please upload an image");
      return;
    }

    try {
      const formDataWithImage = new FormData();
      formDataWithImage.append('date', formData.date);
      formDataWithImage.append('hostelName', formData.hostelName);
      formDataWithImage.append('caption', formData.caption);
      formDataWithImage.append('workType', formData.workType);
      if (selectedImage) {
        formDataWithImage.append('image', selectedImage);
      }

      if (isEditing) {
        await api.put(`/work-transparency/${currentId}`, formDataWithImage);
        alert("Post updated successfully");
      } else {
        await api.post('/work-transparency', formDataWithImage);
        alert("Post published successfully");
      }
      fetchPosts();
      resetForm();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (post) => {
    setFormData({
      date: post.date,
      hostelName: post.hostelName,
      caption: post.caption,
      workType: post.workType
    });
    if (post.imageUrl) {
      setImagePreview(post.imageUrl);
    }
    setIsEditing(true);
    setCurrentId(post._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/work-transparency/${id}`);
        fetchPosts();
        alert("Post deleted successfully");
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // Helper to format date for display
  const getDateInfo = (dateString) => {
    if (!dateString) return { month: 'JAN', day: '01', dayName: 'Monday' };
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    const dayName = date.toLocaleString('default', { weekday: 'long' });
    return { month, day, dayName };
  };

  const workTypes = [
    'Washroom Cleaning',
    'Water Tank Cleaning',
    'Food Preparation',
    'Kitchen Hygiene',
    'Maintenance Work',
    'Pest Control',
    'General Cleaning'
  ];

  return (
    <div className="work-transparency-container">
      <h2>
        Work Transparency
        {userRole === 'student' && <span style={{ fontSize: '14px', fontWeight: '400', color: '#a0aec0', marginLeft: '10px' }}>(View Only)</span>}
      </h2>

      {/* Staff Only (Warden/Caretaker): Create Post Form */}
      {(userRole === 'warden' || userRole === 'caretaker') && (
        <div className="create-post-section" style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>{isEditing ? 'Edit Post' : 'Create New Post'}</h3>

          <form onSubmit={handlePublish} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
              <label style={labelStyle}>Work Type</label>
              <select
                name="workType"
                value={formData.workType}
                onChange={handleInputChange}
                style={inputStyle}
              >
                {workTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Hostel Name</label>
              <input
                type="text"
                name="hostelName"
                placeholder="e.g. Boys Hostel A"
                value={formData.hostelName}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Caption/Description</label>
              <textarea
                name="caption"
                placeholder="Describe the work completed..."
                value={formData.caption}
                onChange={handleInputChange}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '100px', fontFamily: 'inherit' }}
              />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', marginBottom: '10px' }}
                />
              </div>
            )}

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
              <button type="submit" style={btnStyle}>
                {isEditing ? 'Update Post' : 'Publish Post'}
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

      {/* Dynamic View: All Posts */}
      <div className="posts-feed">
        <h3 style={{ color: '#2b3674' }}>Hostel Work Updates</h3>

        {posts.length === 0 ? (
          <p style={{ color: '#a0aec0', fontStyle: 'italic' }}>No posts yet. Check back soon!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {posts.map((post) => {
              const { month, day, dayName } = getDateInfo(post.date);
              const postId = post._id || post.id;
              return (
                <div key={postId} className="post-card" style={postCardStyle}>
                  {/* Post Header with Date */}
                  <div style={postHeaderStyle}>
                    <div style={dateBoxStyle}>
                      <span style={{ fontSize: '11px', opacity: 0.8, fontWeight: '600' }}>{month}</span>
                      <span style={{ fontSize: '22px', fontWeight: 'bold', lineHeight: '1' }}>{day}</span>
                      <span style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{dayName.slice(0, 3)}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 3px 0', fontSize: '15px' }}>Hostel Work Update</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#718096' }}>
                        📍 <strong>{post.hostelName}</strong> • 🏷️ {post.workType}
                      </p>
                    </div>
                    {(userRole === 'warden' || userRole === 'caretaker') && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEdit(post)} style={actionBtnStyle}>Edit</button>
                        <button onClick={() => handleDelete(postId)} style={{ ...actionBtnStyle, color: '#e53e3e', borderColor: '#e53e3e' }}>Delete</button>
                      </div>
                    )}
                  </div>

                  {/* Post Image */}
                  {post.imageUrl && (
                    <div style={{ marginTop: '12px', borderRadius: '10px', overflow: 'hidden' }}>
                      <img
                        src={post.imageUrl}
                        alt={post.caption}
                        style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '400px', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  {/* Post Caption */}
                  <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#2d3748', lineHeight: '1.6' }}>
                      {post.caption}
                    </p>
                  </div>

                  {/* Post Footer - Engagement removed */}
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
  boxSizing: 'border-box',
  fontSize: '14px'
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

const postCardStyle = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  border: '1px solid #f1f5f9',
  overflow: 'hidden'
};

const postHeaderStyle = {
  display: 'flex',
  gap: '15px',
  padding: '15px',
  alignItems: 'flex-start'
};

const dateBoxStyle = {
  background: 'var(--secondary-color)',
  color: 'white',
  padding: '8px 10px',
  borderRadius: '10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: '55px'
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

export default WorkTransparency;
