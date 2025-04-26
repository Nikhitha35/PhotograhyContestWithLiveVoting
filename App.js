import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './home.jsx';
import LoginAdmin from './LoginAdmin';
import UserLogin from './UserLogin';
import AdminDashboard from './AdminDashboard';
import ContestsPage from './ContestsPage';
import ContestSubmissionPage from './ContestSubmissionPage';
import VotingPage from './VotingPage';
import VotePage from './VotePage';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login-admin" element={<LoginAdmin />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/contests" element={<ContestsPage />} />
          <Route path="/submit/:id" element={<ContestSubmissionPage />} />
          <Route path="/voting" element={<VotingPage />} /> 
          <Route path="/vote/:contestId" element={<VotePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
