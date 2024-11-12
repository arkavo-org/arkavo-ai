
// src/googleConfig.js
export const googleConfig = {
    clientId: '628937582864-rcccrc973thjt8kiln9p0pti6usqksm4.apps.googleusercontent.com',
    clientSecret: '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',
    redirectUri: 'http://arkavo.ai:5173/callback',
    //redirectUri: 'https://arkavo.ai',
    scopes: ['openid', 'profile', 'email'],
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token'
};