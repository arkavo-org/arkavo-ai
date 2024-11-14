
// src/googleConfig.js
export const googleConfig = {
    clientId: 'XY.apps.googleusercontent.com',
    clientSecret: 'GOCSPX-YZ',
    //redirectUri: 'https://arkavo.ai:3001/callback', Your live website callback
    redirectUri: 'http://localhost:5173/callback', // Your local testing callback
    scopes: ['openid', 'profile', 'email'],
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token'
};

export const githubConfig = {
    clientId: 'Ov23li7oKlkCbUN190tQ',
    clientSecret: '64dbff0cb0555b9513fc204cadd042a69beae4d3',
    //redirectUri: 'https://arkavo.ai:3001/callback', Your live website callback
    redirectUri: 'http://localhost:5173/callback', // Your local testing callback
    scopes: ['openid', 'profile', 'email'],
    authEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token'
};