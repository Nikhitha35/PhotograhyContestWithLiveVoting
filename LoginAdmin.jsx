import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './LoginAdmin.css';

const LoginAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  // Initialize useNavigate hook
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/login-admin', {
        email,
        password
      });
      console.log(res.data); // Log the response to check if the data is as expected
      setMessage(res.data.message);
  
      // Navigate to the AdminDashboard after successful login
      navigate('/admin-dashboard');
    } catch (err) {
      console.error(err); // Log any error that might occur
      setMessage(err.response?.data?.message || 'Error');
    }
  };
  

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="logo">philocaly</div>
        <div className="login-box">
          <h2>Sign in</h2>
          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />

            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />

            <button type="submit" className="signin-btn">Sign in</button>
            {message && <p style={{ marginTop: '10px' }}>{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
