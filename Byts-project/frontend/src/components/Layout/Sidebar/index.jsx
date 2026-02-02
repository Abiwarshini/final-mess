import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    UtensilsCrossed,
    MessageCircle,
    DoorOpen,
    Clock,
    Zap,
    Users,
    Settings,
    ChevronDown,
    Building
} from 'lucide-react';
import './style.css';

const Sidebar = ({ userRole }) => {
    const [expandedMenu, setExpandedMenu] = useState(null);

    const toggleMenu = (menu) => {
        setExpandedMenu(expandedMenu === menu ? null : menu);
    };

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon-box">
                    <Building size={24} color="white" />
                </div>
                <h1 className="logo-title">Circle</h1>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <div className="nav-group">
                    <div className={`nav-item ${expandedMenu === 'events' ? 'open' : ''}`} onClick={() => toggleMenu('events')}>
                        <Calendar size={20} />
                        <span>Events</span>
                        <ChevronDown size={16} className="chevron" />
                    </div>
                    {expandedMenu === 'events' && (
                        <div className="sub-menu">
                            <NavLink to="/poll" className="sub-item">Events</NavLink>
                            <NavLink to="/volunteers" className="sub-item">Volunteers</NavLink>
                        </div>
                    )}
                </div>

                <div className="nav-group">
                    <div className={`nav-item ${expandedMenu === 'food' ? 'open' : ''}`} onClick={() => toggleMenu('food')}>
                        <UtensilsCrossed size={20} />
                        <span>Food</span>
                        <ChevronDown size={16} className="chevron" />
                    </div>
                    {expandedMenu === 'food' && (
                        <div className="sub-menu">
                            <NavLink to="/mess-committee" className="sub-item">Mess Committee</NavLink>
                            <NavLink to="/menu-processing" className="sub-item">Menu</NavLink>
                        </div>
                    )}
                </div>

                <NavLink to="/room-allocation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <DoorOpen size={20} />
                    <span>Rooms</span>
                </NavLink>

                <NavLink to="/leaves" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Clock size={20} />
                    <span>Leaves</span>
                </NavLink>

                <NavLink to="/feedback" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <MessageCircle size={20} />
                    <span>Feedback</span>
                </NavLink>

                <NavLink to="/students" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Users size={20} />
                    <span>Students</span>
                </NavLink>

                <div className="nav-divider"></div>

                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>

            </nav>
        </aside>
    );
};

export default Sidebar;
