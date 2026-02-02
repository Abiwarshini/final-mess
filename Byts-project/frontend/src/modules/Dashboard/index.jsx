import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar,
  UtensilsCrossed,
  MessageCircle,
  DoorOpen,
  Clock,
  Users,
  Bell,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import './style.css';

const Dashboard = ({ userRole }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickStats = [
    { label: 'Total Beds', value: '500' },
    { label: 'Occupancy Rate', value: '85%' },
    { label: 'Active Events', value: '12' }
  ];

  const mainFeatures = [
    {
      title: 'Events & Announcements',
      description: 'Stay updated with all hostel events and important announcements',
      icon: Calendar,
      path: '/poll',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
      color: '#3b82f6'
    },
    {
      title: 'Mess Committee',
      description: 'View mess schedules, menus, and committee meetings',
      icon: UtensilsCrossed,
      path: '/mess-committee',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
      color: '#ef4444'
    },
    {
      title: 'Room Allocation',
      description: 'Manage room assignments and view availability',
      icon: DoorOpen,
      path: '/room-allocation',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop',
      color: '#10b981'
    }
  ];

  const quickLinks = [
    { title: 'Volunteers', icon: Users, path: '/volunteers', color: '#8b5cf6' },
    { title: 'Feedback', icon: MessageCircle, path: '/feedback', color: '#f59e0b' },
    { title: 'Complaints', icon: Bell, path: '/complaint', color: '#ec4899' },
    { title: 'Leaves', icon: Clock, path: '/leaves', color: '#06b6d4' }
  ];

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              HOSTEL  amazing hostel for the free spirited student
            </h1>
            <p className="hero-description">
              Experience comfortable living with modern amenities. Your home away from home with 24/7 support and vibrant community.
            </p>

            <div className="hero-stats">
              {quickStats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop"
              alt="Hostel Room"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Features Section */}
      <div className="features-section">
        <div className="section-header">
          <h2 className="section-title">Hostel Services</h2>
          <button className="view-all-btn">
            View all <ArrowRight size={16} />
          </button>
        </div>

        <div className="features-grid">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <NavLink
                key={index}
                to={feature.path}
                className="feature-card"
              >
                <div className="feature-image">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.background = feature.color;
                    }}
                  />
                  <div className="feature-overlay">
                    <Icon size={32} color="white" />
                  </div>
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <div className="feature-footer">
                    <span className="feature-link">Learn more →</span>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Quick Actions - Improved Design */}
      <div className="quick-actions-section">
        <div className="quick-actions-grid">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={index}
                to={link.path}
                className="action-card"
              >
                <div className="action-icon" style={{ background: `${link.color}15`, color: link.color }}>
                  <Icon size={20} />
                </div>
                <span className="action-title">{link.title}</span>
                <ArrowRight size={18} className="action-arrow" style={{ color: link.color }} />
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Announcements & Updates */}
      <div className="announcements-section">
        <h2 className="section-title">Latest Updates</h2>
        <div className="announcements-grid">
          <div className="announcement-card primary">
            <div className="announcement-header">
              <div className="announcement-badge">Important</div>
              <span className="announcement-date">Today</span>
            </div>
            <h3>Mess Fee Payment Reminder</h3>
            <p>Payment deadline is on 15th of every month. Please ensure timely payment to avoid late fees.</p>
          </div>

          <div className="announcement-card success">
            <div className="announcement-header">
              <div className="announcement-badge">Event</div>
              <span className="announcement-date">March 20</span>
            </div>
            <h3>Annual Hostel Fest 2024</h3>
            <p>Join us for the biggest celebration of the year! Register now to participate in various competitions and activities.</p>
          </div>

          <div className="announcement-card warning">
            <div className="announcement-header">
              <div className="announcement-badge">Notice</div>
              <span className="announcement-date">This Sunday</span>
            </div>
            <h3>Scheduled Maintenance</h3>
            <p>Water supply will be temporarily unavailable from 8 AM to 2 PM. Please plan accordingly.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>HOSTEL</h3>
            <p>Your home away from home. Experience comfortable living with modern amenities and vibrant community.</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><NavLink to="/mess-committee">Mess Committee</NavLink></li>
              <li><NavLink to="/poll">Events</NavLink></li>
              <li><NavLink to="/room-allocation">Room Allocation</NavLink></li>
              <li><NavLink to="/volunteers">Volunteers</NavLink></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><NavLink to="/feedback">Feedback</NavLink></li>
              <li><NavLink to="/complaint">Complaints</NavLink></li>
              <li><NavLink to="/leaves">Leave Requests</NavLink></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p>Hostel Office<br />
              Mon - Fri: 9:00 AM - 6:00 PM<br />
              Email: hostel@university.edu<br />
              Phone: +1 234 567 8900</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Hostel Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
