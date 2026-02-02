import React from 'react';
import Navbar from './Navbar';
import './style.css';

const Layout = ({ children, userRole, onLogout }) => {
  return (
    <div className="app-layout">
      <Navbar userRole={userRole} onLogout={onLogout} />

      <main className="main-content">
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
