// src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faSearch, faCalendar } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import logo from './assets/arkavo.svg';
import { loginAndFetchProfile, logoutAndClearProfile, UserProfile } from './keycloakUtils';

const Navbar: React.FC = () => {
  const { keycloak, initialized } = useKeycloak();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load user profile from localStorage on component mount
  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
  }, []);

  // Fetch user profile when Keycloak is initialized
  useEffect(() => {
    if (initialized) {
      loginAndFetchProfile(keycloak).then((profile) => {
        if (profile) {
          setUserProfile(profile);
        }
      });
    }
  }, [initialized, keycloak]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleViewProfile = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  const handleSettings = () => {
    navigate('/settings');
    setShowDropdown(false);
  };

  const handleLogout = () => {
    logoutAndClearProfile(keycloak);
    setUserProfile(null);
    setShowDropdown(false);
  };

  const handleDMClick = () => {
    navigate('/chat');
  };

  const handleEventsClick = () => {
    navigate('/events');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src={logo} className="icon" alt="Arkavo logo" />
        <div className="navbar-logo">
          <a href="/" className="home-link">Arkavo</a>
        </div>
      </div>
      <form className="navbar-search" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="search-input"
        />
      </form>
      <div className="navbar-links">
        {userProfile ? (
          <div className="profile-elements">
            <FontAwesomeIcon
              icon={faCalendar}
              className="icon events-icon"
              title="Events"
              onClick={handleEventsClick}
            />
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
                <button onClick={handleSettings}>Settings</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => loginAndFetchProfile(keycloak)}>Sign In</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
