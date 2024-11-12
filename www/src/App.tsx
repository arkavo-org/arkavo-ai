import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';

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
