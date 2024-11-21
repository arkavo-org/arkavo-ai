// src/SignIn.tsx
import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';

const SignIn: React.FC = () => {
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate();

    useEffect(() => {
        if (initialized && !keycloak.authenticated) {
            keycloak.login({
                scope: 'openid profile email',
                redirectUri: `${window.location.origin}/signin`
            });
        } else if (keycloak.authenticated) {
            // Fetch user profile after login
            keycloak.loadUserProfile().then(profile => {

                // Cache profile in localStorage for future use
                localStorage.setItem('userProfile', JSON.stringify(profile));

                // Redirect to callback (or default page)
                const callbackUrl = new URLSearchParams(window.location.search).get('callback');
                navigate(callbackUrl || '/');
            }).catch(error => console.error('Failed to load user profile', error));
        }
    }, [initialized, keycloak, navigate]);

    return (
        <div className="signin-container">
            <h2>Signing In...</h2>
        </div>
    );
};

export default SignIn;
