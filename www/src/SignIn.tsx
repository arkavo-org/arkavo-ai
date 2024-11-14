// src/SignIn.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { googleConfig, githubConfig } from './env';
import { generateCodeVerifier, generateCodeChallenge } from './pkceUtils';
import './SignIn.css';

const SignIn: React.FC = () => {
    const [accessToken, setAccessToken] = useState('');
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const location = useLocation();

    // Initiates Google Sign-In flow with PKCE
    const handleGoogleLogin = async () => {
        const verifier = generateCodeVerifier();
        localStorage.setItem('code_verifier', verifier);

        const challenge = await generateCodeChallenge(verifier);
        const authUrl = `${googleConfig.authEndpoint}?` +
            `client_id=${googleConfig.clientId}` +
            `&response_type=code` +
            `&scope=${googleConfig.scopes.join(' ')}` +
            `&redirect_uri=${encodeURIComponent(googleConfig.redirectUri)}` +
            `&code_challenge=${challenge}` +
            `&code_challenge_method=S256`;

        window.location.href = authUrl;
    };

    // Initiates GitHub Sign-In flow with PKCE
    const handleGithubLogin = async () => {
        const verifier = generateCodeVerifier();
        localStorage.setItem('code_verifier', verifier);

        const challenge = await generateCodeChallenge(verifier);
        const authUrl = `${githubConfig.authEndpoint}?` +
            `client_id=${githubConfig.clientId}` +
            `&scope=${githubConfig.scopes.join(' ')}` +
            `&redirect_uri=${encodeURIComponent(githubConfig.redirectUri)}` +
            `&state=${verifier}` + // GitHub requires a state parameter
            `&code_challenge=${challenge}` +
            `&code_challenge_method=S256`;

        window.location.href = authUrl;
    };

    const handleAppleLogin = () => {
        // Add Apple login logic here if required
    };

    // Exchanges authorization code for access token for Google or GitHub
    const exchangeCodeForToken = async (code: string, provider: 'google' | 'github') => {
        const verifier = localStorage.getItem('code_verifier');
        if (!verifier) {
            console.error('Code verifier missing');
            return;
        }

        const params = new URLSearchParams();
        params.append('client_id', provider === 'github' ? githubConfig.clientId : googleConfig.clientId);
        params.append('code', code);
        params.append('redirect_uri', provider === 'github' ? githubConfig.redirectUri : googleConfig.redirectUri);
        params.append('grant_type', 'authorization_code');
        params.append('code_verifier', verifier);

        const tokenEndpoint = provider === 'github' ? githubConfig.tokenEndpoint : googleConfig.tokenEndpoint;

        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...(provider === 'github' && { Accept: 'application/json' }) // GitHub requires specific Accept header
            },
            body: params
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('OAuth token exchange failed:', data.error);
            return;
        }

        setAccessToken(data.access_token);
        fetchUserProfile(data.access_token, provider);
    };

    // Fetches user's profile picture for Google or GitHub
    const fetchUserProfile = async (token: string, provider: 'google' | 'github') => {
        const profileUrl = provider === 'github' 
            ? 'https://api.github.com/user' 
            : 'https://www.googleapis.com/oauth2/v3/userinfo';

        const response = await fetch(profileUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const profileData = await response.json();
        setProfilePicture(provider === 'github' ? profileData.avatar_url : profileData.picture);
    };

    // Extracts code from URL and exchanges it for an access token
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code && state) {
            // Determine if it is a GitHub or Google login based on the state or some other identifier
            const provider = state === localStorage.getItem('code_verifier') ? 'github' : 'google';
            exchangeCodeForToken(code, provider);
        }
    }, [location]);

    return (
        <div className="signin-container">
            <h2>Sign In</h2>
            <button onClick={handleGoogleLogin} className="signin-button google">Sign in with Google</button>
            <button onClick={handleGithubLogin} className="signin-button github">Sign in with GitHub</button>
            <button onClick={handleAppleLogin} className="signin-button apple">Sign in with Apple</button>
            {profilePicture && <img src={profilePicture} alt="Profile" />}
        </div>
    );
};

export default SignIn;
