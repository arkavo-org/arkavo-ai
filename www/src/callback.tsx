// src/Callback.tsx
import React, { useEffect } from 'react';
import { userManager } from './authConfig';

const Callback: React.FC = () => {
    useEffect(() => {
        userManager.signinRedirectCallback().then(() => {
            window.location.replace('/');
        }).catch((error) => {
            console.error('Error in callback:', error);
        });
    }, []);

    return <p>Loading...</p>;
};

export default Callback;
