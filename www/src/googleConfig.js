// src/googleConfig.js
export const googleConfig = {
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    redirectUri: 'YOUR_REDIRECT_URI',
    scopes: ['openid', 'profile', 'email'],
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token'
};
