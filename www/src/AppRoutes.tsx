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
import Settings from './Settings'; // Import Privacy component
import AIView from './AIView';
import AICompute from './AICompute';
import './App.css';

const AppRoutes: React.FC = () => {
    return (
        <div id="fullpage">
            <Navbar />
            <Routes>
                <Route path="/" element={<Feed />} /> {/* Home route for the feed */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/privacy" element={<Privacy />} /> {/* Privacy page route */}
                <Route path="/callback" element={<Callback />} />  
                <Route path="/profile" element={<Profile />} />  
                <Route path="/chat" element={<ChatPage />} />  
                <Route path="/settings" element={<Settings />} />  
                <Route path="/aiview" element={<AIView />} />  
                <Route path="/aicompute" element={<AICompute />} />  
            </Routes>
        </div>
    );
};

export default AppRoutes;
