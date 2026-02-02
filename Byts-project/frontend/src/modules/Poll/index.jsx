import React, { useState, useEffect } from 'react';
import { Plus, Users, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './style.css';

const Poll = () => {
    const [userRole, setUserRole] = useState('student');
    const [currentUser, setCurrentUser] = useState(null);
    const [polls, setPolls] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showResponse, setShowResponse] = useState(null);
    const [showNonResponders, setShowNonResponders] = useState(null);
    const [nonRespondersData, setNonRespondersData] = useState(null);
    const [loadingNonResponders, setLoadingNonResponders] = useState(false);

    const [formData, setFormData] = useState({
        question: '',
        description: '',
        options: ['', '', ''],
        startDate: '',
        endDate: ''
    });

    const [responseData, setResponseData] = useState({
        selectedOption: ''
    });

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setUserRole(role);
        setCurrentUser(user);
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            const data = await api.get('/polls');
            console.log('Polls data received:', data);
            setPolls(data);
        } catch (error) {
            console.error('Fetch failed', error);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('option-')) {
            const index = parseInt(name.split('-')[1]);
            const newOptions = [...formData.options];
            newOptions[index] = value;
            setFormData({ ...formData, options: newOptions });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        if (!formData.question || formData.options.filter(o => o.trim()).length < 2) {
            alert('Question and at least 2 options are required');
            return;
        }

        try {
            const dataToSend = {
                ...formData,
                options: formData.options.filter(o => o.trim())
            };
            await api.post('/polls', dataToSend);
            alert('Poll created successfully');
            setFormData({ question: '', description: '', options: ['', '', ''], startDate: '', endDate: '' });
            setShowForm(false);
            fetchPolls();
        } catch (error) {
            alert('Failed to create poll: ' + error.message);
        }
    };

    const handleRespond = async (pollId) => {
        try {
            const response = await api.post(`/polls/${pollId}/respond`, {
                ...responseData,
                studentName: currentUser?.name || '',
                roomNo: currentUser?.roomNo || '',
                userType: userRole
            });
            console.log('Response submitted:', response);
            alert('Your response has been recorded!');
            setShowResponse(null);
            setResponseData({ selectedOption: '' });
            fetchPolls();
        } catch (error) {
            alert('Failed to submit response: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleFetchNonResponders = async (pollId) => {
        setLoadingNonResponders(true);
        try {
            const data = await api.get(`/polls/${pollId}/non-responders`);
            console.log('Non-responders data:', data);
            setNonRespondersData(data);
            setShowNonResponders(pollId);
        } catch (error) {
            alert('Failed to fetch non-responders: ' + error.message);
        } finally {
            setLoadingNonResponders(false);
        }
    };

    const handlePrintNonResponders = () => {
        if (!nonRespondersData) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        let yPosition = margin;

        // Title
        doc.setFontSize(20);
        doc.setTextColor(60, 141, 161);
        doc.setFont(undefined, 'bold');
        doc.text('Poll Non-Responders Report', pageWidth / 2, yPosition + 10, { align: 'center' });
        yPosition += 20;

        // Summary Box with Border
        doc.setDrawColor(60, 141, 161);
        doc.setLineWidth(2);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 35);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        const summaryData = [
            { label: 'Total Students:', value: nonRespondersData.totalStudents },
            { label: 'Responded:', value: nonRespondersData.respondents },
            { label: 'Not Responded:', value: nonRespondersData.nonResponderCount },
            { label: 'Response Rate:', value: `${((nonRespondersData.respondents / nonRespondersData.totalStudents) * 100).toFixed(2)}%` }
        ];

        let boxY = yPosition + 5;
        summaryData.forEach((item, idx) => {
            doc.setFont(undefined, 'bold');
            doc.setTextColor(60, 141, 161);
            doc.text(item.label, margin + 5, boxY);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(String(item.value), margin + 60, boxY);
            boxY += 7;
        });

        yPosition += 40;

        // Table with Borders
        const tableData = nonRespondersData.nonResponders.map((student, idx) => [
            idx + 1,
            student.name || '-',
            student.roomNo || '-',
            student.mobileNo || '-',
            student.email || '-'
        ]);

        if (doc.autoTable) {
            doc.autoTable({
                head: [['#', 'Student Name', 'Room No', 'Mobile No', 'Email']],
                body: tableData,
                startY: yPosition,
                margin: { left: margin, right: margin, top: margin, bottom: margin },
                theme: 'grid',
                lineColor: [60, 141, 161],
                lineWidth: 0.5,
                headStyles: {
                    fillColor: [60, 141, 161],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 10,
                    halign: 'center',
                    lineColor: [60, 141, 161],
                    lineWidth: 1
                },
                bodyStyles: {
                    fontSize: 9,
                    textColor: [0, 0, 0],
                    lineColor: [60, 141, 161],
                    lineWidth: 0.5
                },
                alternateRowStyles: {
                    fillColor: [240, 249, 251]
                },
                rowPageBreak: 'avoid',
                columnStyles: {
                    0: { halign: 'center', cellWidth: 12 },
                    1: { cellWidth: 38 },
                    2: { cellWidth: 23 },
                    3: { cellWidth: 38 },
                    4: { cellWidth: 48 }
                },
                didDrawPage: (data) => {
                    // Footer with page numbers
                    doc.setFontSize(8);
                    doc.setTextColor(153, 153, 153);
                    const pageCount = doc.getNumberOfPages();
                    doc.text(
                        `Page ${data.pageNumber} of ${pageCount}`,
                        pageWidth / 2,
                        pageHeight - 5,
                        { align: 'center' }
                    );
                }
            });
        }

        // Add generation timestamp at the end
        const totalPages = doc.getNumberOfPages();
        doc.setPage(totalPages);
        doc.setFontSize(8);
        doc.setTextColor(153, 153, 153);
        doc.text(
            `Generated on ${new Date().toLocaleString()}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );

        // Save PDF
        doc.save(`poll-non-responders-${new Date().getTime()}.pdf`);
    };

    const isResponded = (poll) => {
        const userId = currentUser?.id || currentUser?._id;
        return poll.responses?.some(r => r.studentId === userId?.toString());
    };

    const handleClosePoll = async (pollId) => {
        if (window.confirm('Close this poll?')) {
            try {
                await api.post(`/polls/${pollId}/close`);
                alert('Poll closed successfully');
                fetchPolls();
            } catch (error) {
                alert('Failed to close poll: ' + error.message);
            }
        }
    };

    return (
        <div className="polls-container">
            <div className="polls-hero">
                <h2 className="polls-title">Polls & Surveys</h2>
            </div>

            {/* Caretaker: Create Poll Form */}
            {(userRole === 'warden' || userRole === 'caretaker') && (
                <div className="create-section">
                    {!showForm ? (
                        <button className="btn-create" onClick={() => setShowForm(true)}>
                            <Plus size={18} /> Create Poll
                        </button>
                    ) : (
                        <div className="form-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '18px' }}>Create New Poll</h3>
                                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>×</button>
                            </div>
                            <form onSubmit={handleCreatePoll} className="form-grid">
                                <input
                                    type="text"
                                    name="question"
                                    value={formData.question}
                                    onChange={handleFormChange}
                                    placeholder="Poll Question"
                                    required
                                />
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Poll Description (Optional)"
                                    style={{ gridColumn: '1 / -1', minHeight: '80px' }}
                                />
                                <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--primary-color)' }}>Poll Options</label>
                                    {formData.options.map((option, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            name={`option-${idx}`}
                                            value={option}
                                            onChange={handleFormChange}
                                            placeholder={`Option ${idx + 1}`}
                                            style={{ display: 'block', marginBottom: '8px', width: '100%' }}
                                        />
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, options: [...formData.options, ''] })}
                                        style={{ fontSize: '14px', padding: '6px 12px', marginTop: '8px' }}
                                    >
                                        + Add Option
                                    </button>
                                </div>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleFormChange}
                                    placeholder="Start Date"
                                />
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleFormChange}
                                    placeholder="End Date"
                                />
                                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px' }}>
                                    <button type="submit" className="btn-primary">Create Poll</button>
                                    <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Non-Responders Modal */}
            {showNonResponders && nonRespondersData && (
                <div className="modal-overlay" onClick={() => setShowNonResponders(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Non-Responders Report</h3>
                            <button onClick={() => setShowNonResponders(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>×</button>
                        </div>

                        <div className="summary-box">
                            <div className="summary-stat">
                                <span className="stat-label">Total Students</span>
                                <span className="stat-value">{nonRespondersData.totalStudents}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">Responded</span>
                                <span className="stat-value" style={{ color: 'green' }}>{nonRespondersData.respondents}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">Not Responded</span>
                                <span className="stat-value" style={{ color: '#ef4444' }}>{nonRespondersData.nonResponderCount}</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-label">Response Rate</span>
                                <span className="stat-value">{((nonRespondersData.respondents / nonRespondersData.totalStudents) * 100).toFixed(2)}%</span>
                            </div>
                        </div>

                        {nonRespondersData.nonResponders.length > 0 ? (
                            <>
                                <table className="non-responders-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Student Name</th>
                                            <th>Room No</th>
                                            <th>Mobile No</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {nonRespondersData.nonResponders.map((student, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td>{student.name}</td>
                                                <td>{student.roomNo}</td>
                                                <td>{student.mobileNo || '-'}</td>
                                                <td>{student.email || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button className="btn-print" onClick={handlePrintNonResponders}>
                                    <Download size={18} /> Download PDF
                                </button>
                            </>
                        ) : (
                            <p style={{ textAlign: 'center', color: 'green', fontSize: '16px', fontWeight: '600' }}>
                                ✓ All students have responded!
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Polls List */}
            <div className="polls-list">
                {polls.length === 0 ? (
                    <div className="empty-state">
                        <Users size={40} />
                        <p>No polls available at the moment</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {polls.map(poll => (
                            <div key={poll._id} className="poll-card">
                                <div className="poll-header">
                                    <div>
                                        <h3 className="poll-title">{poll.question}</h3>
                                        <p className="poll-meta">Created by: {poll.createdBy} | Status: {poll.status}</p>
                                    </div>
                                    <div className="poll-badge">
                                        {poll.responseCount}/{poll.membersNeeded || 'N/A'}
                                    </div>
                                </div>

                                {poll.description && <p className="poll-desc">{poll.description}</p>}

                                {poll.startDate && (
                                    <p className="poll-dates">
                                        📅 {poll.startDate} to {poll.endDate}
                                    </p>
                                )}

                                {/* Student: Response Form */}
                                {(userRole === 'student' || userRole === 'volunteer') && poll.status === 'Open' && (
                                    <div style={{ marginTop: '12px' }}>
                                        {isResponded(poll) ? (
                                            <div className="responded-badge">
                                                <CheckCircle size={16} /> You've responded to this poll
                                            </div>
                                        ) : (
                                            <>
                                                {showResponse === poll._id ? (
                                                    <div className="response-form">
                                                        <p style={{ marginBottom: '12px', fontWeight: '600' }}>Select your answer:</p>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            {poll.options.map((option, idx) => (
                                                                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`poll-${poll._id}`}
                                                                        value={option}
                                                                        checked={responseData.selectedOption === option}
                                                                        onChange={(e) => setResponseData({ selectedOption: e.target.value })}
                                                                    />
                                                                    <span>{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                            <button
                                                                className="btn-primary btn-sm"
                                                                onClick={() => handleRespond(poll._id)}
                                                                disabled={!responseData.selectedOption}
                                                            >
                                                                Submit Response
                                                            </button>
                                                            <button
                                                                className="btn-outline btn-sm"
                                                                onClick={() => setShowResponse(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="btn-respond"
                                                        onClick={() => setShowResponse(poll._id)}
                                                    >
                                                        <AlertCircle size={16} /> Respond to Poll
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Caretaker: View Responses */}
                                {(userRole === 'warden' || userRole === 'caretaker') && (
                                    <div className="responses-section">
                                        <div style={{ marginTop: '16px', marginBottom: '12px' }}>
                                            <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)', fontWeight: '600' }}>
                                                Responses ({poll.responseCount}/Unknown)
                                            </h4>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {poll.options.map(option => {
                                                    const count = poll.responses.filter(r => r.selectedOption === option).length;
                                                    const percentage = poll.responseCount > 0 ? ((count / poll.responseCount) * 100).toFixed(1) : 0;
                                                    return (
                                                        <div key={option} style={{ 
                                                            flex: 1, 
                                                            minWidth: '150px',
                                                            padding: '12px',
                                                            background: '#f3f4f6',
                                                            borderRadius: '6px',
                                                            textAlign: 'center'
                                                        }}>
                                                            <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>{option}</p>
                                                            <p style={{ margin: '0', fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{count}</p>
                                                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{percentage}%</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <button
                                            className="btn-view-non-responders"
                                            onClick={() => handleFetchNonResponders(poll._id)}
                                            disabled={loadingNonResponders}
                                        >
                                            <Users size={16} /> View Non-Responders ({loadingNonResponders ? 'Loading...' : 'List'})
                                        </button>
                                        <button
                                            className="btn-close-poll"
                                            onClick={() => handleClosePoll(poll._id)}
                                            style={{ marginLeft: '8px' }}
                                        >
                                            Close Poll
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Poll;
