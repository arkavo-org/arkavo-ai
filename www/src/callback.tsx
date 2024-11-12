// src/callback.tsx
import React, { useEffect } from 'react';
import { googleConfig } from './googleConfig';
import axios from 'axios';

function Callback() {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const codeVerifier = localStorage.getItem('code_verifier');

        console.log('Authorization Code:', code); // Log the authorization code
        console.log('Code Verifier:', codeVerifier); // Log the code verifier

        if (code && codeVerifier) {
            exchangeCodeForTokens(code, codeVerifier);
        } else {
            console.warn('Authorization code or code verifier is missing');
        }
    }, []);
    const exchangeCodeForTokens = async (code, codeVerifier) => {
        try {
            console.log('Starting token exchange with Google API...');

            const params = new URLSearchParams();
            params.append('client_id', googleConfig.clientId);
            params.append('client_secret', googleConfig.clientSecret);
            params.append('code', code);
            params.append('redirect_uri', googleConfig.redirectUri);
            params.append('grant_type', 'authorization_code');
            params.append('code_verifier', codeVerifier);

            const response = await axios.post('https://oauth2.googleapis.com/token', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            console.log('Token Exchange Response:', response.data); // Log the entire token response

            const { id_token, access_token } = response.data;
            console.log('ID Token:', id_token); // Log the ID token
            console.log('Access Token:', access_token); // Log the Access token

            const userProfile = decodeJwt(id_token);
            console.log('Decoded User Profile:', userProfile); // Log the decoded user profile data

            if (userProfile.picture) {
                console.log('Profile Picture URL:', userProfile.picture); // Log the specific picture URL
            } else {
                console.warn('Profile picture not found in user profile');
            }

            // Save the profile data to localStorage for Navbar access
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            console.log('User profile saved to localStorage');

            window.location.href = '/';  // Redirect to home page or any other page
        } catch (error) {
            console.error('Error during token exchange:', error.response ? error.response.data : error.message);
        }
    };


    const decodeJwt = (token) => {
        console.log('Decoding ID Token...');
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        console.log('Decoded JWT Payload:', jsonPayload); // Log the raw decoded JWT payload
        return JSON.parse(jsonPayload);
    };

    return <div>Loading...</div>;
}

export default Callback;
