import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './modules/Auth/Login';
import Dashboard from './modules/Dashboard';
import {
  MessCommiteeMeeting,
  TokenAllocation,
  RoomAllocation,
  Poll,
  Volunteers,
  WorkTransparency,
  Feedback,
  Complaint,
  StudentList
  MenuProcessing,
  StudentList,
  SpecialPermission,
  Events
} from './modules';
import Signup from './modules/Auth/Signup';
import { DayView } from './modules/menu/DayView';
import { WeeklyOverview } from './modules/menu/WeeklyOverview';
import { MenuProvider } from './modules/menu/MenuContext';
import { DebugPage } from './modules/menu/DebugPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('student'); // 'student', 'caretaker', 'warden'

  // Check for existing session
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('isAuthenticated');
    const storedUser = sessionStorage.getItem('currentUser');

    if (storedAuth === 'true' && storedUser) {
      setIsAuthenticated(true);
      const parsedUser = JSON.parse(storedUser);
      setUserRole(parsedUser.role);
    }
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUserRole(user.role);
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userRole', user.role);
    // currentUser is already set in Login.jsx to sessionStorage, but syncing state here
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('student');
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('currentUser');
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
        } />

        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout userRole={userRole} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Dashboard userRole={userRole} />} />
                <Route path="/mess-committee" element={<MessCommiteeMeeting />} />
                <Route path="/token-allocation" element={<TokenAllocation />} />
                <Route path="/room-allocation" element={<RoomAllocation />} />
                <Route path="/poll" element={<Poll />} />
                <Route path="/volunteers" element={<Volunteers />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/complaint" element={<Complaint />} />
                <Route path="/menu-processing" element={<MenuProcessing />} />
                <Route path="/work-transparency" element={<WorkTransparency />} />
                <Route path="/students" element={<StudentList />} />
                <Route path="/leaves" element={<SpecialPermission />} />
                <Route path="/events" element={<Events />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
