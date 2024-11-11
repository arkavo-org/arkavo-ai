// src/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Feed from './Feed';
import SignIn from './SignIn';
import Privacy from './Privacy'; // Import Privacy component

const AppRoutes: React.FC = () => {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Feed />} /> {/* Home route for the feed */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/privacy" element={<Privacy />} /> {/* Privacy page route */}
            </Routes>
        </>
    );
};

export default AppRoutes;
