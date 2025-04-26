import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import io from 'socket.io-client';  
import moment from 'moment-timezone';
import ImageModal from './components/ImageModal';  

const AdminDashboard = () => {
  const [view, setView] = useState('home');
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    maxSubmissions: '',
    guidelines: '',
  });
  const [contests, setContests] = useState([]);
  const [submissionsView, setSubmissionsView] = useState('list');
  const [endedContests, setEndedContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // WebSocket connection
  const socket = io('http://localhost:5001');  

  const handleLogout = () => {
    navigate('/');  // Redirect to home/login page
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert start and end times to IST
    const startDateTime = moment(`${formData.startDate}T${formData.startTime}`).tz('Asia/Kolkata').toISOString();
    const endDateTime = moment(`${formData.endDate}T${formData.endTime}`).tz('Asia/Kolkata').toISOString();

    const newContest = {
      ...formData,
      startDateTime,
      endDateTime,
      status: 'Upcoming', 
    };

    try {
      const response = await fetch('http://localhost:5001/api/create-contest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContest),
      });

      if (response.ok) {
        alert('Contest created successfully!');
        fetchContests(); // Refresh the contests list
        setFormData({
          title: '',
          theme: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          maxSubmissions: '',
          guidelines: '',
        });
      } else {
        alert('Error creating contest.');
      }
    } catch (error) {
      console.error('Error submitting contest:', error);
      alert('Error submitting contest.');
    }
  };

  const handleDeleteContest = async (index) => {
    const contestId = contests[index].id;
    try {
      const response = await fetch(`http://localhost:5001/api/delete-contest/${contestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Contest deleted successfully!');
        fetchContests();
      } else {
        alert('Error deleting contest.');
      }
    } catch (error) {
      console.error('Error deleting contest:', error);
      alert('Error deleting contest.');
    }
  };

  const fetchContests = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/get-contests');
      const data = await response.json();
      setContests(data);
    } catch (error) {
      console.error('Error fetching contests:', error);
      alert('Error fetching contests.');
    }
  };

  // Format the date as desired in IST
  const formatDate = (date) => {
    return moment(date).tz('Asia/Kolkata').format('ddd, MMM D, YYYY [at] hh:mm A');
  };

  // Update the contest status (for internal use)
  const updateContestStatus = () => {
    setContests((prevContests) =>
      prevContests.map((contest) => ({
        ...contest,
        status: calculateStatus(contest.startDateTime, contest.endDateTime),
      }))
    );
  };

  const calculateStatus = (start, end) => {
    const now = moment().tz('Asia/Kolkata');
    if (now.isBefore(start)) {
      return 'Upcoming';
    } else if (now.isBetween(start, end, null, '[)')) {
      return 'Active';
    } else {
      return 'Ended';
    }
  };

useEffect(() => {
  socket.on('statusUpdate', async (updatedContest) => {
    // Update contest status in the local state
    setContests((prevContests) =>
      prevContests.map((contest) =>
        contest.id === updatedContest.contestId
          ? { ...contest, status: updatedContest.newStatus }
          : contest
      )
    );

    // Now send the updated status to the backend to update the database
    try {
      const response = await fetch(`http://localhost:5001/api/update-contest-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contestId: updatedContest.contestId,
          newStatus: updatedContest.newStatus,
        }),
      });

      if (response.ok) {
        console.log(`Status updated in database for contest ${updatedContest.contestId}`);
      } else {
        console.error('Failed to update status in database');
      }
    } catch (error) {
      console.error('Error sending status update to database:', error);
    }
  });

  // Cleanup on unmount
  return () => {
    socket.off('statusUpdate');
  };
}, []);


  // Fetch contests when the component mounts
  useEffect(() => {
    fetchContests(); // Load contests from the backend
    fetchEndedContests(); // Load ended contests

    const interval = setInterval(updateContestStatus, 60000); // Update statuses every minute
    return () => clearInterval(interval); // Clean up the interval on unmount
  }, []);

  // Add console logs to debug the API response
  const fetchEndedContests = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching ended contests...');
      const response = await fetch('http://localhost:5001/api/get-ended-contests');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 Received data:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array');
      }
      
      // Log each contest's details
      data.forEach(contest => {
        console.log(` Contest ${contest.id}:`, {
          title: contest.title,
          status: contest.status,
          startDateTime: contest.startDateTime,
          endDateTime: contest.endDateTime
        });
      });
      
      setEndedContests(data);
      console.log(' Successfully set ended contests:', data.length);
    } catch (error) {
      console.error('Error fetching ended contests:', error);
      setError(`Failed to load ended contests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add a debug button to manually refresh ended contests
  const debugRefreshEndedContests = () => {
    console.log('Manual refresh of ended contests');
    fetchEndedContests();
  };

  // Add useEffect to refetch ended contests when switching to submissions view
  useEffect(() => {
    if (view === 'submissions') {
      fetchEndedContests();
    }
  }, [view]);

  const fetchSubmissions = async (contestId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching submissions for contest:', contestId);
      const response = await fetch(`http://localhost:5001/api/get-submissions/${contestId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received submissions data:', data);
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Received non-array data:', data);
        setSubmissions([]);
        setError('Invalid data format received from server');
        return;
      }
      
      setSubmissions(data);
      setSubmissionsView('photos');
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]); // Set empty array on error
      setError('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (submission) => {
    setSelectedImage({
      url: `http://localhost:5001${submission.photoUrl}`,
      userName: submission.userName
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="admin-container">
      <nav className="admin-navbar">
        <h1 className="admin-title">Philocaly</h1>
        <button onClick={handleLogout} className="admin-logout">Logout</button>
      </nav>

      <div className="admin-main">
        <aside className="admin-sidebar">
          <ul>
            <li>
              <button onClick={() => setView('create')} className="admin-link">Create Contest</button>
            </li>
            <li>
              <button onClick={() => setView('active')} className="admin-link">Active Contests</button>
            </li>
            <li>
  <button onClick={() => {
    setView('submissions');
    fetchEndedContests();
  }} className="admin-link">Submissions</button>
</li>

          </ul>
        </aside>

        <main className="admin-content">
          {view === 'create' && (
            <form onSubmit={handleSubmit} className="admin-form">
              <h2>Create New Contest</h2>
              <input name="title" type="text" placeholder="Contest Title" value={formData.title} onChange={handleChange} required />
              <input name="theme" type="text" placeholder="Theme" value={formData.theme} onChange={handleChange} required />
              <div className="admin-date-time">
                <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                <input name="startTime" type="time" value={formData.startTime} onChange={handleChange} required />
              </div>
              <div className="admin-date-time">
                <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
                <input name="endTime" type="time" value={formData.endTime} onChange={handleChange} required />
              </div>
              <input name="maxSubmissions" type="number" placeholder="Max Submissions" value={formData.maxSubmissions} onChange={handleChange} required />
              <textarea name="guidelines" placeholder="Guidelines" value={formData.guidelines} onChange={handleChange} rows="4" required />
              <button type="submit" className="admin-submit">Create</button>
            </form>
          )}

          {view === 'active' && (
            <div>
              <h2>Active Contests</h2>
              {contests.length > 0 ? (
                <div className="contest-grid">
                  {contests.map((contest, index) => (
                    <div key={contest.id} className="contest-box">
                      <h3>{contest.title}</h3>
                      <p><strong>Theme:</strong> {contest.theme}</p>
                      <p><strong>Start Time:</strong> {contest.startDateTime ? formatDate(new Date(contest.startDateTime)) : 'N/A'}</p>
                      <p><strong>End Time:</strong> {contest.endDateTime ? formatDate(new Date(contest.endDateTime)) : 'N/A'}</p>
                      <p><strong>Status:</strong> {contest.status}</p>
                      <button onClick={() => handleDeleteContest(index)} className="admin-delete">Delete</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No contests available.</p>
              )}
            </div>
          )}
          {view === 'submissions' && (
            <div className="submissions-section">
              <div className="admin-nav-links">
                <button onClick={() => setView('home')} className={view === 'home' ? 'active' : ''}>
                  Home
                </button>
                <button onClick={() => setView('submissions')} className={view === 'submissions' ? 'active' : ''}>
                  Submissions
                </button>
                <button onClick={debugRefreshEndedContests} className="debug-refresh-btn">
                  Refresh Ended Contests
                </button>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                  <button onClick={() => setError(null)} className="dismiss-error">×</button>
                </div>
              )}

              {loading ? (
                <div className="loading-spinner">Loading...</div>
              ) : submissionsView === 'list' ? (
                <div className="ended-contests-grid">
                  {endedContests.length === 0 ? (
                    <div className="empty-state">
                      <p>No ended contests available.</p>
                      <p>Debug Info: {JSON.stringify(endedContests)}</p>
                    </div>
                  ) : (
                    endedContests.map((contest) => (
                      <div key={contest.id} className="ended-contest-card">
                        <h3>{contest.title}</h3>
                        <p><strong>Theme:</strong> {contest.theme}</p>
                        <p><strong>Start Date:</strong> {formatDate(contest.startDateTime)}</p>
                        <p><strong>End Date:</strong> {formatDate(contest.endDateTime)}</p>
                        <button 
                          className="view-submissions-btn"
                          onClick={() => {
                            setSelectedContest(contest);
                            fetchSubmissions(contest.id);
                          }}
                        >
                          View Submissions
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="submissions-view">
                  <button className="back-btn" onClick={() => setSubmissionsView('list')}>
                    ← Back to Contests
                  </button>
                  <h2>Submissions for {selectedContest?.title}</h2>
                  <div className="submissions-grid">
                    {submissions.length === 0 ? (
                      <div className="empty-state">
                        <p>No submissions available for this contest.</p>
                      </div>
                    ) : (
                      submissions.map((submission) => (
                        <div key={submission.id} className="submission-card">
                          <img 
                            src={`http://localhost:5001${submission.photoUrl}`} 
                            alt={`Submission by ${submission.userName}`}
                            onClick={() => handleImageClick(submission)}
                            className="clickable-image"
                          />
                          <div className="submission-info">
                            <p><strong>Submitted by:</strong> {submission.userName}</p>
                            <p><strong>Date:</strong> {formatDate(submission.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      <ImageModal 
        isOpen={modalOpen}
        onClose={handleCloseModal}
        imageUrl={selectedImage?.url}
        userName={selectedImage?.userName}
      />
    </div>
  );
};

export default AdminDashboard;
