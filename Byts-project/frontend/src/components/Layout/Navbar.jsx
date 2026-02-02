import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  LogOut,
  Calendar,
  UtensilsCrossed,
  MessageCircle,
  DoorOpen,
  Clock,
  Zap,
  Building,        // Added
  User,            // Added
  LayoutDashboard  // Added
} from 'lucide-react';
import './style.css';

const Navbar = ({ userRole, onLogout }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate(); // Added hook definition

  const displayRole = userRole
    ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
    : 'User';

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  return (
    <header className="top-navbar">
      {/* Top Header */}
      <div className="navbar-top">
        <div className="logo-container" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <h2 className="logo-text">HOSTEL</h2>
        </div>

        <nav className="top-nav-menu">
          {/* EVENTS Dropdown */}
          <div className="dropdown-container">
            <button
              className={`dropdown-toggle ${openDropdown === 'events' ? 'active' : ''}`}
              onClick={() => toggleDropdown('events')}
            >
              <Calendar size={18} />
              <span>EVENTS</span>
              <ChevronDown size={16} className="chevron" />
            </button>
            {openDropdown === 'events' && (
              <div className="dropdown-menu">
                <NavLink to="/poll" className="dropdown-item" onClick={closeDropdown}>
                  <Zap size={16} />
                  <span>Events & Announcements</span>
                </NavLink>
                {userRole === 'caretaker' && (
                  <NavLink to="/token-allocation" className="dropdown-item caretaker-only" onClick={closeDropdown}>
                    <Zap size={16} />
                    <span>Token Generation</span>
                    <span className="badge">Caretaker</span>
                  </NavLink>
                )}
                <NavLink to="/volunteers" className="dropdown-item" onClick={closeDropdown}>
                  <Zap size={16} />
                  <span>Volunteering</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* FOOD Dropdown */}
          <div className="dropdown-container">
            <button
              className={`dropdown-toggle ${openDropdown === 'food' ? 'active' : ''}`}
              onClick={() => toggleDropdown('food')}
            >
              <UtensilsCrossed size={18} />
              <span>FOOD</span>
              <ChevronDown size={16} className="chevron" />
            </button>
            {openDropdown === 'food' && (
              <div className="dropdown-menu">
                <NavLink to="/menu-processing" className="dropdown-item" onClick={closeDropdown}>
                  <Zap size={16} />
                  <span>Stock Check</span>
                </NavLink>
                <NavLink to="/mess-committee" className="dropdown-item" onClick={closeDropdown}>
                  <Zap size={16} />
                  <span>Mess Committee</span>
                </NavLink>
                <NavLink to="/feedback" className="dropdown-item" onClick={closeDropdown}>
                  <Zap size={16} />
                  <span>Food Preference</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* QUERIES Dropdown */}
          <div className="dropdown-container">
            <button
              className={`dropdown-toggle ${openDropdown === 'queries' ? 'active' : ''}`}
              onClick={() => toggleDropdown('queries')}
            >
              <MessageCircle size={18} />
              <span>QUERIES</span>
              <ChevronDown size={16} className="chevron" />
            </button>
            {openDropdown === 'queries' && (
              <div className="dropdown-menu">
                <NavLink to="/feedback" className="dropdown-item" onClick={closeDropdown}>
                  <Zap size={16} />
                  <span>Feedback</span>
                </NavLink>
                <NavLink to="/complaint" className="dropdown-item" onClick={closeDropdown}>
                  <Zap size={16} />
                  <span>Complaint</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Direct Links */}
          <NavLink to="/room-allocation" className="top-nav-item" onClick={closeDropdown}>
            <DoorOpen size={18} />
            <span>ROOM ALLOCATION</span>
          </NavLink>
          <NavLink to="/leaves" className="top-nav-item" onClick={closeDropdown}>
            <Clock size={18} />
            <span>LEAVES</span>
          </NavLink>

          {userRole === 'warden' && (
            <NavLink to="/students" className="top-nav-item" onClick={closeDropdown}>
              <Zap size={18} />
              <span>Students</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* User Dropdown Section */}
      <div className="nav-right">
        <div className="dropdown-container">
          <div
            className="user-profile"
            onClick={() => toggleDropdown('profile')}
            style={{ cursor: 'pointer' }}
          >
            <div className="avatar">
              <User size={18} color="white" />
            </div>
            <div className="user-info">
              <p className="user-name">{displayRole}</p>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>

          {openDropdown === 'profile' && (
            <div className="dropdown-menu profile-menu" style={{ right: 0, left: 'auto', minWidth: '180px' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #eee', marginBottom: '5px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Signed in as</p>
                <p style={{ margin: 0, fontWeight: '700', color: 'var(--primary-color)' }}>{displayRole}</p>
              </div>

              <NavLink to="/dashboard" className="dropdown-item" onClick={closeDropdown}>
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </NavLink>

              <div className="dropdown-item" onClick={onLogout} style={{ color: '#EF4444', cursor: 'pointer' }}>
                <LogOut size={16} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hostel Footer */}
      <div className="navbar-footer">
        <span className="hostel-badge">🏠</span>
        <span className="hostel-name">Your Hostel Name Here</span>
      </div>
    </header>
  );
};

export default Navbar;
