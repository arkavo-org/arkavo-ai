import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faSearch, faCalendar } from '@fortawesome/free-solid-svg-icons';
import logo from './assets/arkavo.svg';
import axios from 'axios';

const Navbar: React.FC = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userProfile, setUserProfile] = useState<{ name: string; picture: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const authServerUrl = import.meta.env.VITE_AUTH_SERVER_URL;
  console.log(import.meta.env.VITE_AUTH_SERVER_URL);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNavbar(currentScrollY < lastScrollY || currentScrollY === 0);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    } else if (code) {
      // Fetch user profile from the backend if not available in localStorage and we have a code
      axios.get(`${authServerUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })
      
        .then(response => {
          setUserProfile(response.data);
          localStorage.setItem('userProfile', JSON.stringify(response.data)); // Cache in localStorage
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
        });
    }
  }, [authServerUrl]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.profile-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSignIn = () => {
    navigate('/signin');
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
    localStorage.removeItem('userProfile');
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
    <nav className={`navbar ${showNavbar ? 'show' : 'hide'}`}>
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
          <div className="profile-container">
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
              <div className="dropdown-menu show">
                <button onClick={handleViewProfile}>View Profile</button>
                <button onClick={handleSettings}>Settings</button>
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
