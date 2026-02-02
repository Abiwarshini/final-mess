import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './style.css';
import { api } from '../../utils/api';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userData = await api.post('/auth/login', { email, password, role });

            // Store current user session
            localStorage.setItem('currentUser', JSON.stringify(userData));
            onLogin(userData);
            navigate('/mess-committee');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">HM</div>
                    <h1>Welcome Back</h1>
                    <p>Please select your role to continue</p>
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

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder={role === 'student' ? "student@college.edu" : "staff@college.edu"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-options">
                        <label className="checkbox-container">
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                            Keep me logged in
                        </label>
                        <button type="button" className="forgot-password-btn">Forgot password?</button>
                    </div>

                    <button type="submit" className="login-btn">
                        Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>

                    <div className="auth-footer">
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </div>
                </form>
            </div>

            <div className="login-banner">
                <div className="banner-content">
                    <h2>Hostel Mess Management</h2>
                    <p>Streamline your mess operations, committee meetings, and student feedback in one unified platform.</p>
                </div>
                <div className="banner-circle c1"></div>
                <div className="banner-circle c2"></div>
            </div>
        </div>
    );
};

export default Login;
