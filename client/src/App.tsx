import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ChatRoom from './components/ChatRoom';
import JoinInvitation from './components/JoinInvitation';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/room/:roomId" 
              element={
                <PrivateRoute>
                  <ChatRoom />
                </PrivateRoute>
              } 
            />
            <Route path="/join/:token" element={<JoinInvitation />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 