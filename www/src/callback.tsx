import React, { useEffect } from 'react';
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
            const provider = state === codeVerifier ? 'github' : 'google';
            exchangeCodeForTokens(code, codeVerifier, provider);
        } else {
            console.warn('Authorization code or code verifier is missing');
        }
    }, []);

    const exchangeCodeForTokens = async (code: string, codeVerifier: string, provider: 'google' | 'github') => {
        try {
            console.log(`Starting token exchange with ${provider}...`);
            console.log('Sending code:', code);
            console.log('Sending code_verifier:', codeVerifier);
    
            const response = await axios.post(`${import.meta.env.VITE_AUTH_SERVER_URL}/auth/${provider}/exchange`, {
                code,
                code_verifier: codeVerifier
            }, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
            });
    
            if (response.status === 200) {
                console.log('Token successfully stored in HttpOnly cookie');
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error during token exchange:', error.response ? error.response.data : error.message);
        }
    };    

    return <div>Loading...</div>;
}

export default Callback;
