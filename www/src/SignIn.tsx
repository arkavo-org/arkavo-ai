// src/SignIn.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { googleConfig } from './googleConfig';
import { generateCodeVerifier, generateCodeChallenge } from './pkceUtils';
import './SignIn.css';

const SignIn: React.FC = () => {
    const [accessToken, setAccessToken] = useState('');
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const location = useLocation();

    // Initiates Google Sign-In flow with PKCE
    const handleGoogleLogin = async () => {
        const verifier = generateCodeVerifier();
        localStorage.setItem('code_verifier', verifier); // Store codeVerifier in localStorage
        console.log('Code Verifier Set:', verifier); // Debugging log

        const challenge = await generateCodeChallenge(verifier);
        const authUrl = `${googleConfig.authEndpoint}?` +
            `client_id=${googleConfig.clientId}` +
            `&response_type=code` +
            `&scope=${googleConfig.scopes.join(' ')}` +
            `&redirect_uri=${encodeURIComponent(googleConfig.redirectUri)}` +
            `&code_challenge=${challenge}` +
            `&code_challenge_method=S256`;

        window.location.href = authUrl; // Redirect to Google OAuth authorization page
    };

    const handleAppleLogin = () => {
        // Add Apple login logic here if required
    };

    // Exchanges authorization code for access token
    const exchangeCodeForToken = async (code: string) => {
        const verifier = localStorage.getItem('code_verifier'); // Retrieve codeVerifier from localStorage
        if (!verifier) {
            console.error('Code verifier missing');
            return;
        }

        const params = new URLSearchParams();
        params.append('client_id', googleConfig.clientId);
        params.append('code', code);
        params.append('redirect_uri', googleConfig.redirectUri);
        params.append('grant_type', 'authorization_code');
        params.append('code_verifier', verifier); // Use the code verifier from localStorage

        const response = await fetch(googleConfig.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('OAuth token exchange failed:', data.error);
            return;
        }

        setAccessToken(data.access_token);
        fetchUserProfile(data.access_token);
    };

    // Fetches user's profile picture using the access token
    const fetchUserProfile = async (token: string) => {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const profileData = await response.json();
        setProfilePicture(profileData.picture);
    };

    // Extracts code from URL and exchanges it for an access token
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');

        if (code) {
            exchangeCodeForToken(code);
        }
    }, [location]);

    return (
        <div className="signin-container">
            <h2>Sign In</h2>
            <button onClick={handleGoogleLogin} className="signin-button google">Sign in with Google</button>
            <button onClick={handleAppleLogin} className="signin-button apple">Sign in with Apple</button>
            {profilePicture && <img src={profilePicture} alt="Profile" />}
        </div>
    );
};

export default SignIn;
