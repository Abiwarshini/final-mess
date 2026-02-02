import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './modules/Auth/Login';
import {
  MessCommiteeMeeting,
  TokenAllocation,
  Poll,
  Volunteers,
  Feedback,
  Complaint,
  StudentList
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

  const [currentUser, setCurrentUser] = useState(null);

  // Check for existing session
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('currentUser');

    if (storedAuth === 'true' && storedUser) {
      setIsAuthenticated(true);
      const parsedUser = JSON.parse(storedUser);
      setUserRole(parsedUser.role);
      setCurrentUser(parsedUser);
    }
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUserRole(user.role);
    setCurrentUser(user);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('student');
    setCurrentUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
  };

  return (
    <BrowserRouter>
      <MenuProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/mess-committee" replace /> : <Login onLogin={handleLogin} />
          } />

          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Navigate to="/mess-committee" replace />} />
                  <Route path="/mess-committee" element={<MessCommiteeMeeting />} />
                  <Route path="/token-allocation" element={<TokenAllocation />} />
                  <Route path="/poll" element={<Poll />} />
                  <Route path="/volunteers" element={<Volunteers />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/complaint" element={<Complaint />} />
                  <Route path="/menu" element={<WeeklyOverview />} />
                  <Route path="/menu/:dayId" element={<DayView />} />
                  <Route path="/debug" element={<DebugPage />} />
                  <Route path="/students" element={<StudentList />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </MenuProvider>
    </BrowserRouter>
  );
}

export default App;
