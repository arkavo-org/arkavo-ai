// src/SignIn.tsx
import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignIn.css';

const SignIn: React.FC = () => {
    const { keycloak, initialized } = useKeycloak();
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (initialized && !keycloak.authenticated) {
            keycloak.login({
                redirectUri: `${window.location.origin}/signin`
            });
        } else if (keycloak.authenticated) {
            // Fetch user profile after login
            keycloak.loadUserProfile().then(profile => {
                const userProfile = {
                    name: profile.firstName,
                    picture: profile.attributes?.picture?.[0] || null
                };
                setProfilePicture(userProfile.picture);

                // Cache profile in localStorage for Navbar use
                localStorage.setItem('userProfile', JSON.stringify(userProfile));

                // Redirect to callback (or default page)
                const callbackUrl = new URLSearchParams(window.location.search).get('callback');
                navigate(callbackUrl || '/');
            }).catch(error => console.error('Failed to load user profile', error));
        }
    }, [initialized, keycloak, navigate]);

    return (
        <div className="signin-container">
            <h2>Signing In...</h2>
            {profilePicture && <img src={profilePicture} alt="Profile" />}
        </div>
    );
};

export default SignIn;
