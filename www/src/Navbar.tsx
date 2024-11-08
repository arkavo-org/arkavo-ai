// src/Navbar.tsx
import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom'; // Assuming React Router is used

const Navbar: React.FC = () => {
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setShowNavbar(currentScrollY < lastScrollY || currentScrollY === 0);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const handleSignIn = () => {
        navigate('/signin'); // Navigate to the SignIn component
    };

    return (
        <nav className={`navbar ${showNavbar ? 'show' : 'hide'}`}>
            <div className="navbar-logo">Arkavo</div>
            <div className="navbar-links">
                {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="profile-picture" />
                ) : (
                    <button onClick={handleSignIn}>Sign In</button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
