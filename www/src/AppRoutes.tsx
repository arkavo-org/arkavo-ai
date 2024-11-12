// src/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Feed from './Feed';
import Callback from './callback'; // Ensure this is imported correctly
import SignIn from './SignIn';
import Privacy from './Privacy'; // Import Privacy component
import Profile from './Profile'; // Import Privacy component
import ChatPage from './ChatPage'; // Import Privacy component

const AppRoutes: React.FC = () => {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Feed />} /> {/* Home route for the feed */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/privacy" element={<Privacy />} /> {/* Privacy page route */}
                <Route path="/callback" element={<Callback />} />  {/* Ensure this route exists */}
                <Route path="/profile" element={<Profile />} />  {/* Ensure this route exists */}
                <Route path="/chat" element={<ChatPage />} />  {/* Ensure this route exists */}
            </Routes>
        </>
    );
};

export default AppRoutes;
