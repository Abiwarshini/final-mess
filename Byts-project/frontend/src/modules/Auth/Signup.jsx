import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../utils/api';

const Signup = () => {
    const [role, setRole] = useState('student');
    const navigate = useNavigate();

    // Common State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        contact: '',
        hostelName: '',
        // Student Specific
        rollNo: '',
        parentName: '',
        parentContact: '',
        roomNo: '',
        // Warden Specific
        dept: '',
        wardenType: 'assistant', // assistant or deputy
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        // Prepare User Object for API
        const userData = {
            ...formData,
            role,
            hostel: formData.hostelName,
            room: formData.roomNo,
            year: role === 'student' ? '1' : '' // Default
        };

        try {
            await api.post('/auth/register', userData);
            alert("Account created successfully! Please login.");
            navigate('/login');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="login-page"> {/* Reusing login page layout */}
            <div className="login-container signup-container"> {/* Added signup-container for potential overrides */}
                <div className="login-header">
                    <div className="login-logo">HM</div>
                    <h1>Create Account</h1>
                    <p>Join the hostel management platform</p>
                </div>

                <div className="role-selector">
                    <button
                        type="button"
                        className={`role-btn ${role === 'student' ? 'active' : ''}`}
                        onClick={() => setRole('student')}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        className={`role-btn ${role === 'caretaker' ? 'active' : ''}`}
                        onClick={() => setRole('caretaker')}
                    >
                        Caretaker
                    </button>
                    <button
                        type="button"
                        className={`role-btn ${role === 'warden' ? 'active' : ''}`}
                        onClick={() => setRole('warden')}
                    >
                        Warden
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="login-form signup-scroll">
                    {/* Common Fields */}
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group half">
                            <label>Contact Number</label>
                            <input
                                type="tel"
                                name="contact"
                                placeholder="9876543210"
                                value={formData.contact}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Role Specific Fields */}
                    {role === 'student' && (
                        <>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Roll Number</label>
                                    <input type="text" name="rollNo" placeholder="21CSR001" onChange={handleChange} required />
                                </div>
                                <div className="form-group half">
                                    <label>Room Number</label>
                                    <input type="text" name="roomNo" placeholder="A-101" onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Hostel Name</label>
                                <input type="text" name="hostelName" placeholder="Kaveri Hostel" onChange={handleChange} required />
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Parent Name</label>
                                    <input type="text" name="parentName" placeholder="Guardian Name" onChange={handleChange} required />
                                </div>
                                <div className="form-group half">
                                    <label>Parent Contact</label>
                                    <input type="tel" name="parentContact" placeholder="Parent Phone" onChange={handleChange} required />
                                </div>
                            </div>
                        </>
                    )}

                    {role === 'caretaker' && (
                        <div className="form-group">
                            <label>Hostel Name</label>
                            <input type="text" name="hostelName" placeholder="Assigned Hostel" onChange={handleChange} required />
                        </div>
                    )}

                    {role === 'warden' && (
                        <>
                            <div className="form-group">
                                <label>Department</label>
                                <input type="text" name="dept" placeholder="CSE" onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Hostel Name</label>
                                    <input type="text" name="hostelName" placeholder="Assigned Hostel" onChange={handleChange} required />
                                </div>
                                <div className="form-group half">
                                    <label>Designation</label>
                                    <select name="wardenType" value={formData.wardenType} onChange={handleChange} className="form-select">
                                        <option value="assistant">Assistant Warden</option>
                                        <option value="deputy">Deputy Warden</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-row">
                        <div className="form-group half">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group half">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn">
                        Create Account
                    </button>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
