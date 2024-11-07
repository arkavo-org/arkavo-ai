// src/Navbar.tsx
import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar: React.FC = () => {
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setShowNavbar(currentScrollY < lastScrollY || currentScrollY === 0);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <nav className={`navbar ${showNavbar ? 'show' : 'hide'}`}>
            <div className="navbar-logo">Arkavo</div>
            <div className="navbar-links">
                <a href="/login">Log In</a>
            </div>
        </nav>
    );
};

export default Navbar;
