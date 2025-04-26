import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './VotePage.css';

const VotePage = () => {
    const { contestId } = useParams();
    useEffect(() => {
        if (!contestId) {
          setVotingStatus('Invalid contest. Please check the link or try again.');
          console.error(' contestId is missing or invalid!');
        } else {
          console.log(' contestId:', contestId);
        }
      }, [contestId]);
      
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [votingStatus, setVotingStatus] = useState(null);
    const [voteCount, setVoteCount] = useState(0);
    const [isVoted, setIsVoted] = useState(false);
  
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');
  
    // Add this useEffect to check authentication status
    useEffect(() => {
      const token = localStorage.getItem('token');
if (!token) {
  setVotingStatus('Error: No token found. Please log in again.');
  return;
}

      const userEmail = localStorage.getItem('userEmail');
      console.log('Auth Check:', { token: !!token, userEmail: !!userEmail });
    }, []);
  // Fetch contest submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/get-contest-submissions/${contestId}`);
        console.log("contestId:", contestId);

        const data = await response.json();
        setSubmissions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [contestId]);


  const handleVote = async (submissionId) => {
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');
    
    if (!userEmail) {
        setVotingStatus('Error: User email not found. Please log in again.');
        return;
    }

    if (voteCount >= 3) {
        setVotingStatus(' You can only vote 3 times for this contest!');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5001/api/vote/${contestId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                submissionId: Number(submissionId),
                contestId: Number(contestId),
                userEmail // Use userEmail instead of email to match with token payload
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to register vote');
        }

        const data = await response.json();
        setVoteCount((prev) => prev + 1);
        setIsVoted(true);
        setVotingStatus('Vote recorded successfully!');
        
        // Update the UI to reflect the new vote count
        setSubmissions(prevSubmissions => 
            prevSubmissions.map(sub => 
                sub.id === submissionId 
                    ? { ...sub, voteCount: (sub.voteCount || 0) + 1 }
                    : sub
            )
        );
        
    } catch (error) {
        console.error('Error voting:', error);
        setVotingStatus(`Error: ${error.message}`);
    }
};

  
  return (
    <div className="vote-page">
      <h2>Vote for Submissions</h2>
      {loading ? (
        <p>Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <p>No submissions available for this contest.</p>
      ) : (
        <div className="submissions-grid">
  {submissions.map((submission) => (
    <div key={submission.id} className="submission-card">
      <img
        src={`http://localhost:5001/api/get-submission-image/${submission.id}`}
        alt={`Submission by ${submission.userName}`}
        className="submission-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'placeholder-image-url';
        }}
      />
      <h4>{submission.userName}</h4>
      <p>Votes: {submission.voteCount || 0}</p>
      <button
        className="vote-btn"
        onClick={() => handleVote(submission.id)}
        disabled={isVoted || voteCount >= 3}
      >
        {isVoted ? 'You have voted' : 'Vote'}
      </button>
    </div>
  ))}
</div>
      )}

      {votingStatus && <p className="voting-status">{votingStatus}</p>}
    </div>
  );
};

export default VotePage;
