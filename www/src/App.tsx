// src/App.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { userManager } from './authConfig';

const App: React.FC = () => {
    return (
        <Router>
            <div style={{ width: "100vw" }}>
                <AppRoutes />
            </div>
        </Router>
    );
};

export default App;
