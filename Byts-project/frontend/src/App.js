import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './modules/Auth/Login';
import Dashboard from './modules/Dashboard';
import {
  MessCommiteeMeeting,
  TokenAllocation,
  Poll,
  Volunteers,
  WorkTransparency,
  Feedback,
  Complaint,
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
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('currentUser');

    if (storedAuth === 'true' && storedUser) {
      setIsAuthenticated(true);
      const parsedUser = JSON.parse(storedUser);
      setUserRole(parsedUser.role);
    }
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUserRole(user.role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('student');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
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
                <Route path="/poll" element={<Poll />} />
                <Route path="/volunteers" element={<Volunteers />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/complaint" element={<Complaint />} />
                <Route path="/menu" element={
                  <MenuProvider>
                    <WeeklyOverview />
                  </MenuProvider>
                } />
                <Route path="/menu/:dayId" element={
                  <MenuProvider>
                    <DayView />
                  </MenuProvider>
                } />
                <Route path="/work-transparency" element={<WorkTransparency />} />
                <Route path="/students" element={<StudentList />} />
                <Route path="/special-permission" element={<SpecialPermission />} />
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
