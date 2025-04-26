import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ContestsPage.css';

const ContestsPage = () => {
  const [contests, setContests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5001/api/get-contests')
      .then(response => response.json())
      .then(data => setContests(data))
      .catch(error => console.error('Error fetching contests:', error));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/user-login');
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-title">Philocaly</div>
        <div className="navbar-links">
          <Link to="/contests">Contests</Link>
          <Link to="/voting">Rating</Link>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </nav>

      {/* Banner */}
      <div className="banner">
        <h1>Free photo contests on Philocaly</h1>
        <p>Enter now to win great prizes and get your work seen by the world.</p>
      </div>

      {/* Contest Grid */}
      <div className="contests-grid">
        {contests.map(contest => {
          const start = new Date(contest.startDateTime);
          const end = new Date(contest.endDateTime);
          const now = new Date();

          let computedStatus = '';
          if (now < start) computedStatus = 'Upcoming';
          else if (now > end) computedStatus = 'Closed';
          else computedStatus = 'Active';

          return (
            <div className="contest-card" key={contest.id}>
              <h2>{contest.title}</h2>
              <p><strong>Theme:</strong> {contest.theme}</p>
              <p><strong>Start:</strong> {start.toLocaleString()}</p>
              <p><strong>End:</strong> {end.toLocaleString()}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span style={{ color: computedStatus === 'Active' ? 'green' : computedStatus === 'Upcoming' ? 'orange' : 'red' }}>
                  {computedStatus}
                </span>
              </p>
              {computedStatus === 'Active' && (
                <Link to={`/submit/${contest.id}`}>
                  <button className="enter-btn">Enter Now</button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContestsPage;
