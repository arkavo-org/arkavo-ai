// src/SignIn.tsx
import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import './SignIn.css';

const SignIn: React.FC = () => {
    const { keycloak, initialized } = useKeycloak();
    const [profilePicture, setProfilePicture] = useState<string | null>(null);

    // Automatically trigger login if user is not authenticated
    useEffect(() => {
        if (initialized && !keycloak.authenticated) {
            keycloak.login();
        }
    }, [initialized, keycloak]);

    // Fetch user's profile picture after login
    useEffect(() => {
        if (keycloak.authenticated) {
            keycloak.loadUserProfile().then(profile => {
                setProfilePicture(profile.attributes?.picture?.[0] || null);
            }).catch(error => console.error('Failed to load user profile', error));
        }
    }, [keycloak]);

    return (
        <div className="signin-container">
            <h2>Sign In</h2>
            {profilePicture && <img src={profilePicture} alt="Profile" />}
            {keycloak.authenticated && (
                <button onClick={() => keycloak.logout()} className="signout-button">
                    Sign Out
                </button>
            )}
        </div>
    );
};

export default SignIn;
