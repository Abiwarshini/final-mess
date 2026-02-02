import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { api } from '../../utils/api';
import './style.css';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [currentWardenHostel, setCurrentWardenHostel] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        if (user.hostel) {
            setCurrentWardenHostel(user.hostel);
        }
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const data = await api.get('/students');
            setStudents(data);
        } catch (error) {
            console.error("Failed to fetch students", error);
        }
    };

    // Filter students based on search
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="module-container">
            <h2>Student List for {currentWardenHostel}</h2>

            {/* Search Section */}
            <div className="filters-container" style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by Name or Roll Number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ ...filterStyle, width: '100%', paddingLeft: '40px' }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', color: 'var(--text-muted)', textAlign: 'left' }}>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Roll No</th>
                            <th style={thStyle}>Dept</th>
                            <th style={thStyle}>Year</th>
                            <th style={thStyle}>Room</th>
                            <th style={thStyle}>Parent Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <tr key={student._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '500' }}>{student.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{student.email}</div>
                                    </td>
                                    <td style={tdStyle}>{student.rollNo || '-'}</td>
                                    <td style={tdStyle}><span style={badgeStyle}>{student.dept || '-'}</span></td>
                                    <td style={tdStyle}>{student.year || '-'}</td>
                                    <td style={tdStyle}>{student.room || '-'}</td>
                                    <td style={tdStyle}>{student.parentContact || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Inline styles
const filterStyle = {
    padding: '12px 12px',
    borderRadius: '8px',
    border: '1px solid var(--text-muted)',
    fontSize: '14px',
    outline: 'none',
};

const thStyle = {
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const tdStyle = {
    padding: '16px',
    fontSize: '14px',
    color: 'var(--text-dark)'
};

const badgeStyle = {
    background: '#e2e8f0',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)'
};

export default StudentList;
