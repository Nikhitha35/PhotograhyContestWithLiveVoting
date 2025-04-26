import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './UserLogin.css';

const UserLogin = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Toggle password visibility
  const togglePassword = (id) => {
    const field = document.getElementById(id);
    field.type = field.type === "password" ? "text" : "password";
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isSignup ? 'http://localhost:5001/api/signup' : 'http://localhost:5001/api/login';
      const body = isSignup ? { name, email, password } : { email, password };
  
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error(' Failed to parse JSON:', jsonError);
        setMessage('Unexpected error format from server');
        return;
      }
  
      setMessage(data.message);
  
      if (response.ok && data.token) {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        console.log("Token stored in localStorage:", data.token); 
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.email); 
        console.log("Token saved:", data.token);
        console.log("Token and email saved:", { token: data.token, email: data.email });
  
  
        navigate('/contests');
      } else if (!response.ok) {
        console.error(`${isSignup ? 'Signup' : 'Login'} failed`, data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Something went wrong. Please try again.');
    }
  };
  

  return (
    <div className="user-login-container">
      <div className="container">
        <div className="icon-wrapper">
          <img src="https://img.icons8.com/ios-filled/50/000000/camera.png" alt="Icon" />
        </div>

        {/* Login Form */}
        <div id="login-form" className={isSignup ? 'hidden' : ''}>
          <h2>Sign in</h2>
          <input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="login-password"
            required
          />
          <label>
            <input type="checkbox" onClick={() => togglePassword('login-password')} /> Show Password
          </label>
          <div className="remember-show">
            <label><input type="checkbox" /> Remember me</label>
          </div>
          <button className="btn" onClick={handleSubmit}>signin</button>
          <span className="toggle-link" onClick={() => setIsSignup(true)}>Don't have an account? Sign up</span>
        </div>

        {/* Signup Form */}
        <div id="signup-form" className={isSignup ? '' : 'hidden'}>
          <h2>Sign Up</h2>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="signup-password"
            required
          />
          <label>
            <input type="checkbox" onClick={() => togglePassword('signup-password')} /> Show Password
          </label>
          <button className="btn" onClick={handleSubmit}>SIGN UP</button>
          <span className="toggle-link" onClick={() => setIsSignup(false)}>Already have an account? Login</span>
        </div>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UserLogin;
