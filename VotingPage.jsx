import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VotingPage.css';
import moment from 'moment-timezone';

const VotingPage = () => {
  const [endedContests, setEndedContests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEndedContests = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/get-ended-contests');
        const data = await response.json();
        setEndedContests(data);
      } catch (error) {
        console.error('Error fetching ended contests:', error);
      }
    };

    fetchEndedContests();
  }, []);

  const handleVoteNow = (contestId) => {
    navigate(`/vote/${contestId}`);
  };

  return (
    <div className="voting-page">
      <nav className="voting-nav">
        <div className="nav-left">Philocaly</div>
        <div className="nav-right">
          <button onClick={() => navigate('/contests')}>Contests</button>
          <button onClick={() => navigate('/')}>Home</button>
        </div>
      </nav>

      <main className="contest-grid mt-20">
        <h2 className="section-title">Ended Contests</h2>
        {endedContests.length === 0 ? (
          <p>No ended contests available for voting.</p>
        ) : (
          endedContests.map((contest) => (
            <div key={contest.id} className="contest-card">
              <h3>{contest.title}</h3>
              <p><strong>Theme:</strong> {contest.theme}</p>
              <button onClick={() => handleVoteNow(contest.id)} className="vote-now-btn">
                Vote Now
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default VotingPage;
