import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Ticket,
  Vote,
  HandHeart,
  MessageSquare,
  AlertCircle,
  Utensils,
  LogOut
} from 'lucide-react';
import './style.css';

const Navbar = ({ userRole, onLogout }) => {

  const displayRole = userRole
    ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
    : 'User';

  return (
    <header className="top-navbar">
      <div className="nav-left">
        <div className="logo-container">
          <div className="logo-icon">HM</div>
          <h3 className="logo-text">Hostel Mess</h3>
        </div>

        <nav className="top-nav-menu">
          <NavLink to="/mess-committee" className="top-nav-item">Committee</NavLink>
          <NavLink to="/token-allocation" className="top-nav-item">Token</NavLink>
          <NavLink to="/poll" className="top-nav-item">Poll</NavLink>
          <NavLink to="/volunteers" className="top-nav-item">Volunteers</NavLink>
          <NavLink to="/feedback" className="top-nav-item">Feedback</NavLink>
          <NavLink to="/complaint" className="top-nav-item">Complaint</NavLink>
          <NavLink to="/menu-processing" className="top-nav-item">Menu</NavLink>
          <NavLink to="/work-transparency" className="top-nav-item">Work Transparency</NavLink>

          {userRole === 'warden' && (
            <NavLink to="/students" className="top-nav-item">Students</NavLink>
          )}
        </nav>
      </div>

      <div className="nav-right">
        <div className="user-profile">
          <div className="avatar">{displayRole.slice(0, 2).toUpperCase()}</div>
          <div>
            <p className="user-name">Current User</p>
            <p className="user-role">{displayRole}</p>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
