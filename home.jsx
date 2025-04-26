import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './Home.css';

function Home() {
  return (
    <>
      <nav>
        <div className="logo">Philocaly</div>
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/login-admin">Admin</Link></li>
          <li><Link to="/user-login?mode=login">Login</Link></li>
          <li><Link to="/user-login?mode=signup" className="join-button">Join</Link></li>
        </ul>
      </nav>

      <div className="hero-section">
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3" alt="Nature Photography" />
        </div>
        <div className="hero-content">
          <h1>A world of great photo contests<br />and awards, in one place</h1>
          <Link to="/user-login" className="cta-button">Explore Philocaly &gt;</Link> {/* Use Link here */}
        </div>
      </div>

      <div className="features-section">
        <div className="feature-container">
          <div className="feature-item">
            <div className="feature-icon trophy">
              <img src="https://cdn-icons-png.flaticon.com/512/2628/2628911.png" alt="Trophy" />
            </div>
            <h2>Enter contests to get your work seen around the world, and win prizes</h2>
          </div>

          <div className="feature-item">
            <div className="feature-icon community">
              <img src="https://cdn-icons-png.flaticon.com/512/1057/1057089.png" alt="Community" />
            </div>
            <h2>Take part with a global community of photographers of all levels</h2>
          </div>

          <div className="feature-item">
            <div className="feature-icon feedback">
              <img src="https://cdn-icons-png.flaticon.com/512/1484/1484799.png" alt="Feedback" />
            </div>
            <h2>Get feedback from the world's leading photographers and the crowd</h2>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
