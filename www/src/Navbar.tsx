// src/Navbar.tsx
import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Navbar: React.FC = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userProfile, setUserProfile] = useState<{ name: string; picture: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Scroll event to show/hide navbar based on scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNavbar(currentScrollY < lastScrollY || currentScrollY === 0);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Load profile information from local storage on component mount
  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
  }, []);

  // Toggle dropdown menu visibility
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Navigate to the sign-in page
  const handleSignIn = () => {
    navigate('/signin');
  };

  // Navigate to the profile page and close the dropdown
  const handleViewProfile = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  // Handle logout, clear user profile, and close dropdown
  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    setUserProfile(null);
    setShowDropdown(false);
  };

  // Navigate to the chat page
  const handleDMClick = () => {
    navigate('/chat');
  };

  return (
    <nav className={`navbar ${showNavbar ? 'show' : 'hide'}`}>
      <div className="navbar-logo">
        <a href="/" className="home-link">Arkavo</a>
      </div>
      <div className="navbar-links">
        {userProfile ? (
          <div className="profile-container">
            <FontAwesomeIcon icon={faBell} className="icon notification-icon" title="Notifications" />
            <FontAwesomeIcon 
              icon={faEnvelope} 
              className="icon dm-icon" 
              title="Direct Messages" 
              onClick={handleDMClick} 
            />
            <img
              src={userProfile.picture}
              alt="Profile"
              className="profile-picture"
              onClick={toggleDropdown}
            />
            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={handleViewProfile}>View Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={handleSignIn}>Sign In</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
