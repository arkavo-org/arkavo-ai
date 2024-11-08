// src/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Feed from './Feed'; // Import Feed component
import SignIn from './SignIn';

const AppRoutes: React.FC = () => {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Feed />} /> {/* Home route for the feed */}
                <Route path="/signin" element={<SignIn />} />
                {/* Add other routes here as needed */}
            </Routes>
        </>
    );
};

export default AppRoutes;
