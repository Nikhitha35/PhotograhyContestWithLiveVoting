import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to get contestId from the URL
import './ContestSubmissionPage.css';

const fetchContestDetails = async (contestId) => {
  try {
    const response = await fetch(`http://localhost:5001/api/get-contests/${contestId}`); // Fetch contest details by ID
    const data = await response.json();
    return data; 
  } catch (error) {
    console.error('Error fetching contest details:', error);
    return null;
  }
};

const fetchSubmissionCount = async (contestId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5001/api/get-submission-count?contestId=${contestId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return {
      count: data.totalSubmissionCount,
      hasSubmitted: data.hasSubmitted
    };
  } catch (error) {
    console.error('Error fetching submission count:', error);
    return { count: 0, hasSubmitted: false };
  }
};

const calculateTimeLeft = (endDateTime) => {
  const now = new Date();
  const end = new Date(endDateTime);
  const diff = end - now;

  if (isNaN(diff)) return "Invalid date";
  if (diff <= 0) return "Contest ended";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${hours}h ${minutes}m left`;
};

const ContestSubmissionPage = () => {
  const { id: contestId } = useParams(); // Get contestId from the URL
  const [contestDetails, setContestDetails] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [maxSubmissionsReached, setMaxSubmissionsReached] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      const details = await fetchContestDetails(contestId); // Fetch contest details by ID
      if (details) {
        setContestDetails(details);
        const submissionData = await fetchSubmissionCount(contestId);
        setSubmissionCount(submissionData.count);
        setAlreadySubmitted(submissionData.hasSubmitted);
        setMaxSubmissionsReached(submissionData.count >= details.maxSubmissions);
      } else {
        setError('Failed to load contest details.');
      }
      setLoading(false);
    };

    fetchDetails();
  }, [contestId]); // Dependency on contestId to refetch if it changes

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "image/jpeg" || file.type === "image/png") {
        if (file.size > 5 * 1024 * 1024) {
          alert("File size exceeds 5MB. Please upload a smaller file.");
          setSelectedImage(null);
          setImagePreview(null);
        } else {
          setSelectedImage(file);
          setImagePreview(URL.createObjectURL(file));
        }
      } else {
        alert("Only JPEG and PNG files are allowed.");
        setSelectedImage(null);
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      alert("Please select an image.");
      return;
    }

    if (alreadySubmitted) {
      alert("You have already submitted a photo for this contest.");
      return;
    }

    if (maxSubmissionsReached) {
      alert("The contest has reached the maximum number of submissions and is now closed.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", selectedImage);
    formData.append("contestId", contestId); // Use dynamic contestId from URL
    
    const token = localStorage.getItem('token');
    
    try {
      setIsSubmitting(true);
      setSubmissionStatus('Submitting...');
      const response = await fetch('http://localhost:5001/api/upload-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
    
      const data = await response.json();
    
      if (response.ok) {
        setAlreadySubmitted(true);
        setSubmissionStatus('Photo submitted successfully!');
      } else {
        setSubmissionStatus(`Failed to submit the photo: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      setSubmissionStatus('An error occurred while uploading the photo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setSubmissionStatus(null);
    setAlreadySubmitted(false);
    setMaxSubmissionsReached(false);
  };

  return (
    <div>
      <header className="header">
        <div className="logo">Philocaly</div>
        <nav className="nav">
          <a href="#">Contests</a>
        </nav>
      </header>

      <div className="container">
        <div className="left">
          <div className="tabs">
            <div className="active">OPEN</div>
          </div>

          <div className="section-title">Brief</div>
          <div className="guidelines">
            {loading ? "Loading guidelines..." : contestDetails?.guidelines || 'No guidelines available'}
          </div>
        </div>

        <div className="right">
          <b>🕒</b> {loading ? "Loading time left..." : calculateTimeLeft(contestDetails?.endDateTime)}
          
          {imagePreview && <img src={imagePreview} alt="Selected" className="image-preview" />}
          
          <input 
            type="file" 
            onChange={handleImageChange} 
            className="file-input" 
            accept="image/jpeg, image/png"
            multiple={false}
            disabled={maxSubmissionsReached}
          />
          
          <button 
            className="enter-btn" 
            onClick={handleSubmit} 
            disabled={isSubmitting || alreadySubmitted || maxSubmissionsReached}
          >
            {isSubmitting ? 'Submitting...' : alreadySubmitted ? 'Already Submitted' : 'Enter a photo'}
          </button>

          {alreadySubmitted && (
            <div>
              <p>You have already submitted a photo for this contest.</p>
            </div>
          )}

          {submissionStatus && <div className="submission-status">{submissionStatus}</div>}

          <button onClick={resetForm} className="reset-btn">Reset</button>
        </div>
      </div>
    </div>
  );
};

export default ContestSubmissionPage;
