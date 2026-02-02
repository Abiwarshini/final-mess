import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar,
  UtensilsCrossed,
  MessageCircle,
  DoorOpen,
  Clock,
  Zap,
  Users,
  Bell
} from 'lucide-react';
import './style.css';

const Dashboard = ({ userRole }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickAccessLinks = [
    {
      title: 'Events & Announcements',
      icon: Calendar,
      path: '/poll',
      color: '#3498DB',
      bgColor: '#EBF5FB'
    },
    {
      title: 'Mess Committee',
      icon: UtensilsCrossed,
      path: '/mess-committee',
      color: '#E74C3C',
      bgColor: '#FADBD8'
    },
    {
      title: 'Token Allocation',
      icon: Zap,
      path: '/token-allocation',
      color: '#F39C12',
      bgColor: '#FEF5E7',
      restrictTo: 'caretaker'
    },
    {
      title: 'Volunteers',
      icon: Users,
      path: '/volunteers',
      color: '#27AE60',
      bgColor: '#D5F4E6'
    },
    {
      title: 'Feedback',
      icon: MessageCircle,
      path: '/feedback',
      color: '#9B59B6',
      bgColor: '#EBDEF0'
    },
    {
      title: 'Complaints',
      icon: Bell,
      path: '/complaint',
      color: '#E67E22',
      bgColor: '#FEF0E7'
    },
    {
      title: 'Room Allocation',
      icon: DoorOpen,
      path: '/room-allocation',
      color: '#16A085',
      bgColor: '#D1F2EB'
    },
    {
      title: 'Leaves',
      icon: Clock,
      path: '/leaves',
      color: '#8E44AD',
      bgColor: '#F4ECF7'
    }
  ];

  const filteredLinks = quickAccessLinks.filter(link => {
    if (link.restrictTo && link.restrictTo !== userRole) {
      return false;
    }
    return true;
  });

  const stats = [
    { label: 'Active Events', value: '5', icon: Calendar, color: '#3498DB' },
    { label: 'Committee Members', value: '8', icon: Users, color: '#27AE60' },
    { label: 'Pending Requests', value: '3', icon: Clock, color: '#E74C3C' },
    { label: 'Volunteers', value: '12', icon: Users, color: '#F39C12' }
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">{getGreeting()}! 👋</h1>
          <p className="welcome-subtitle">Welcome to Hostel Management System</p>
        </div>
        <div className="hostel-info">
          <div className="info-card">
            <span className="info-icon">🏢</span>
            <div className="info-text">
              <p className="info-label">Your Hostel</p>
              <p className="info-value">Central Hostel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-section">
        <h2 className="section-title">Quick Overview</h2>
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                  <Icon size={24} />
                </div>
                <div className="stat-content">
                  <p className="stat-value">{stat.value}</p>
                  <p className="stat-label">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access */}
      <div className="quick-access-section">
        <h2 className="section-title">Quick Access</h2>
        <div className="quick-access-grid">
          {filteredLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={index}
                to={link.path}
                className="quick-access-card"
                style={{
                  '--card-color': link.color,
                  '--card-bg': link.bgColor
                }}
              >
                <div className="card-icon">
                  <Icon size={28} />
                </div>
                <h3 className="card-title">{link.title}</h3>
                <span className="card-arrow">→</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <div className="info-box">
          <div className="info-icon-large">📢</div>
          <div className="info-content">
            <h3>Announcements</h3>
            <p>Check back soon for important hostel announcements and updates</p>
          </div>
        </div>
        <div className="info-box">
          <div className="info-icon-large">📅</div>
          <div className="info-content">
            <h3>Upcoming Events</h3>
            <p>Stay tuned for interesting events and activities in your hostel</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
