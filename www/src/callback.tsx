import React, { useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';

const Callback: React.FC = () => {
    const { keycloak } = useKeycloak();
    const navigate = useNavigate();

    useEffect(() => {
        if (keycloak.authenticated) {
            // Redirect to the intended destination after successful authentication
            const callbackUrl = new URLSearchParams(window.location.search).get('callback') || '/';
            navigate(callbackUrl);
        } else {
            console.error('User is not authenticated');
        }
    }, [keycloak.authenticated, navigate]);

    return <div>Processing login...</div>;
};

export default Callback;
