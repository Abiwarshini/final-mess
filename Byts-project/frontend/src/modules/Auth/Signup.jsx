import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import './style.css';

const Signup = () => {
    const [role, setRole] = useState('student');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        contact: '',
        hostelName: '',
        rollNo: '',
        parentName: '',
        parentContact: '',
        roomNo: '',
        dept: '',
        wardenType: 'assistant',
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (touched[name]) {
            validateField(name, value);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        validateField(name, value);
    };

    const validateField = (name, value) => {
        let fieldError = '';

        switch (name) {
            case 'name':
                if (!value.trim()) fieldError = 'Full name is required';
                else if (value.trim().length < 2) fieldError = 'Name must be at least 2 characters';
                break;
            case 'email':
                if (!value.trim()) fieldError = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) fieldError = 'Invalid email format';
                break;
            case 'contact':
                if (!value.trim()) fieldError = 'Contact number is required';
                else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) fieldError = 'Contact must be 10 digits';
                break;
            case 'password':
                if (!value) fieldError = 'Password is required';
                else if (value.length < 6) fieldError = 'Password must be at least 6 characters';
                break;
            case 'confirmPassword':
                if (!value) fieldError = 'Please confirm your password';
                else if (value !== formData.password) fieldError = 'Passwords do not match';
                break;
            case 'rollNo':
                if (!value.trim()) fieldError = 'Roll number is required';
                break;
            case 'roomNo':
                if (!value.trim()) fieldError = 'Room number is required';
                break;
            case 'hostelName':
                if (!value.trim()) fieldError = 'Hostel name is required';
                break;
            case 'parentName':
                if (!value.trim()) fieldError = 'Parent/Guardian name is required';
                break;
            case 'parentContact':
                if (!value.trim()) fieldError = 'Parent contact is required';
                else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) fieldError = 'Contact must be 10 digits';
                break;
            case 'dept':
                if (!value.trim()) fieldError = 'Department is required';
                break;
            default:
                break;
        }

        setErrors(prev => ({
            ...prev,
            [name]: fieldError
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Common fields validation
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';
        else if (!/^\d{10}$/.test(formData.contact.replace(/\D/g, ''))) newErrors.contact = 'Contact must be 10 digits';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        // Role-specific validation
        if (role === 'student') {
            if (!formData.rollNo.trim()) newErrors.rollNo = 'Roll number is required';
            if (!formData.roomNo.trim()) newErrors.roomNo = 'Room number is required';
            if (!formData.hostelName.trim()) newErrors.hostelName = 'Hostel name is required';
            if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required';
            if (!formData.parentContact.trim()) newErrors.parentContact = 'Parent contact is required';
            else if (!/^\d{10}$/.test(formData.parentContact.replace(/\D/g, ''))) newErrors.parentContact = 'Contact must be 10 digits';
        } else if (role === 'caretaker') {
            if (!formData.hostelName.trim()) newErrors.hostelName = 'Hostel name is required';
        } else if (role === 'warden') {
            if (!formData.dept.trim()) newErrors.dept = 'Department is required';
            if (!formData.hostelName.trim()) newErrors.hostelName = 'Hostel name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const userData = {
            ...formData,
            role,
            hostel: formData.hostelName,
            room: formData.roomNo,
            year: role === 'student' ? '1' : ''
        };

        try {
            await api.post('/auth/register', userData);
            alert("Account created successfully! Please login.");
            navigate('/login');
        } catch (error) {
            alert(error.message);
        }
    };

    const getInputStyle = (fieldName) => {
        return {
            borderColor: errors[fieldName] ? '#ef4444' : undefined,
            borderWidth: errors[fieldName] ? '2px' : undefined,
            backgroundColor: errors[fieldName] ? '#fef2f2' : undefined
        };
    };

    return (
        <div className="login-page">
            <div className="login-container signup-container">
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
                            onBlur={handleBlur}
                            style={getInputStyle('name')}
                        />
                        {errors.name && touched.name && <span className="error-message">{errors.name}</span>}
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
                                onBlur={handleBlur}
                                style={getInputStyle('email')}
                            />
                            {errors.email && touched.email && <span className="error-message">{errors.email}</span>}
                        </div>
                        <div className="form-group half">
                            <label>Contact Number</label>
                            <input
                                type="tel"
                                name="contact"
                                placeholder="9876543210"
                                value={formData.contact}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={getInputStyle('contact')}
                            />
                            {errors.contact && touched.contact && <span className="error-message">{errors.contact}</span>}
                        </div>
                    </div>

                    {/* Role Specific Fields */}
                    {role === 'student' && (
                        <>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Roll Number</label>
                                    <input
                                        type="text"
                                        name="rollNo"
                                        placeholder="21CSR001"
                                        value={formData.rollNo}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        style={getInputStyle('rollNo')}
                                    />
                                    {errors.rollNo && touched.rollNo && <span className="error-message">{errors.rollNo}</span>}
                                </div>
                                <div className="form-group half">
                                    <label>Room Number</label>
                                    <input
                                        type="text"
                                        name="roomNo"
                                        placeholder="A-101"
                                        value={formData.roomNo}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        style={getInputStyle('roomNo')}
                                    />
                                    {errors.roomNo && touched.roomNo && <span className="error-message">{errors.roomNo}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Hostel Name</label>
                                <input
                                    type="text"
                                    name="hostelName"
                                    placeholder="Kaveri Hostel"
                                    value={formData.hostelName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    style={getInputStyle('hostelName')}
                                />
                                {errors.hostelName && touched.hostelName && <span className="error-message">{errors.hostelName}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Parent Name</label>
                                    <input
                                        type="text"
                                        name="parentName"
                                        placeholder="Guardian Name"
                                        value={formData.parentName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        style={getInputStyle('parentName')}
                                    />
                                    {errors.parentName && touched.parentName && <span className="error-message">{errors.parentName}</span>}
                                </div>
                                <div className="form-group half">
                                    <label>Parent Contact</label>
                                    <input
                                        type="tel"
                                        name="parentContact"
                                        placeholder="Parent Phone"
                                        value={formData.parentContact}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        style={getInputStyle('parentContact')}
                                    />
                                    {errors.parentContact && touched.parentContact && <span className="error-message">{errors.parentContact}</span>}
                                </div>
                            </div>
                        </>
                    )}

                    {role === 'caretaker' && (
                        <div className="form-group">
                            <label>Hostel Name</label>
                            <input
                                type="text"
                                name="hostelName"
                                placeholder="Assigned Hostel"
                                value={formData.hostelName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={getInputStyle('hostelName')}
                            />
                            {errors.hostelName && touched.hostelName && <span className="error-message">{errors.hostelName}</span>}
                        </div>
                    )}

                    {role === 'warden' && (
                        <>
                            <div className="form-group">
                                <label>Department</label>
                                <input
                                    type="text"
                                    name="dept"
                                    placeholder="CSE"
                                    value={formData.dept}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    style={getInputStyle('dept')}
                                />
                                {errors.dept && touched.dept && <span className="error-message">{errors.dept}</span>}
                            </div>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Hostel Name</label>
                                    <input
                                        type="text"
                                        name="hostelName"
                                        placeholder="Assigned Hostel"
                                        value={formData.hostelName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        style={getInputStyle('hostelName')}
                                    />
                                    {errors.hostelName && touched.hostelName && <span className="error-message">{errors.hostelName}</span>}
                                </div>
                                <div className="form-group half">
                                    <label>Designation</label>
                                    <select
                                        name="wardenType"
                                        value={formData.wardenType}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
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
                                onBlur={handleBlur}
                                style={getInputStyle('password')}
                            />
                            {errors.password && touched.password && <span className="error-message">{errors.password}</span>}
                        </div>
                        <div className="form-group half">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={getInputStyle('confirmPassword')}
                            />
                            {errors.confirmPassword && touched.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
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
