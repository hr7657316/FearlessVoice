import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/landing';
import AuthPage from './pages/auth';
import AdminAuthPage from './pages/admin-auth';
import Dashboard from './pages/dashboard';
import FeedPage from './pages/feed';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/admin-auth" element={<AdminAuthPage />} />
      <Route path="/dashboard/:page_id?/:view_key?" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
