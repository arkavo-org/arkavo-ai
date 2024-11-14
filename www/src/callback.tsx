// src/Callback.tsx
import React, { useEffect } from 'react';
import { googleConfig, githubConfig } from '/home/julian/.secrets/env';
import axios from 'axios';

function Callback() {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const codeVerifier = localStorage.getItem('code_verifier');

        console.log('Authorization Code:', code);
        console.log('State:', state);
        console.log('Code Verifier:', codeVerifier);

        if (code && codeVerifier) {
            // Determine provider based on the state or some identifier
            const provider = state === codeVerifier ? 'github' : 'google';
            exchangeCodeForTokens(code, codeVerifier, provider);
        } else {
            console.warn('Authorization code or code verifier is missing');
        }
    }, []);

    const exchangeCodeForTokens = async (code: string, codeVerifier: string, provider: 'google' | 'github') => {
        try {
            if (provider === 'google') {
                console.log('Starting token exchange with Google API...');
                
                const params = new URLSearchParams();
                params.append('client_id', googleConfig.clientId);
                params.append('client_secret', googleConfig.clientSecret);
                params.append('code', code);
                params.append('redirect_uri', googleConfig.redirectUri);
                params.append('grant_type', 'authorization_code');
                params.append('code_verifier', codeVerifier);

                const response = await axios.post(googleConfig.tokenEndpoint, params, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });

                const { id_token, access_token } = response.data;
                const userProfile = decodeJwt(id_token);
                localStorage.setItem('userProfile', JSON.stringify(userProfile));
                if (userProfile.picture) {
                    console.log('Profile Picture URL:', userProfile.picture); // Log the specific picture URL
                }
                console.log('Google User profile saved to localStorage');

            } else if (provider === 'github') {
                console.log('Starting token exchange with GitHub API...');
                
                const params = new URLSearchParams();
                params.append('client_id', githubConfig.clientId);
                params.append('client_secret', githubConfig.clientSecret);
                params.append('code', code);
                params.append('redirect_uri', githubConfig.redirectUri);
                params.append('code_verifier', codeVerifier);

                const response = await axios.post(githubConfig.tokenEndpoint, params, {
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/json' // GitHub requires this header
                    },
                });

                const { access_token } = response.data;
                
                // Fetch GitHub user profile using the access token
                const profileResponse = await axios.get('https://api.github.com/user', {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });
                
                const userProfile = profileResponse.data;
                localStorage.setItem('userProfile', JSON.stringify(userProfile));
                console.log('GitHub User profile saved to localStorage');
            }

            window.location.href = '/';  // Redirect to home page
        } catch (error) {
            console.error('Error during token exchange:', error.response ? error.response.data : error.message);
        }
    };

    const decodeJwt = (token: string) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    };

    return <div>Loading...</div>;
}

export default Callback;
