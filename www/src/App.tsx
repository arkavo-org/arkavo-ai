import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Keycloak from 'keycloak-js';
import { ReactKeycloakProvider } from '@react-keycloak/web';

// Configure Keycloak instance
const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_SERVER_URL,  // e.g., "https://keycloak-server/auth"
  realm: import.meta.env.VITE_KEYCLOAK_REALM,     // e.g., "your-realm"
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID  // e.g., "arkavo"
});

// Create a callback function for Keycloak events (optional)
const onKeycloakEvent = (event: any, error: any) => {
  console.log('Keycloak event:', event);
  if (error) {
    console.error('Keycloak error:', error);
  }
};

// Render the app with KeycloakProvider
createRoot(document.getElementById('root')!).render(
<ReactKeycloakProvider authClient={keycloak} onEvent={onKeycloakEvent}>
    <Router>
    <AppRoutes />
    </Router>
</ReactKeycloakProvider>
);
