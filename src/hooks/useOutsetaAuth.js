import { useState, useEffect } from 'react';

export const useOutsetaAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleMessage = (event) => {
            //Only accept messages from your Squarespace site
            const allowedOrigin = 'https://hudsonvalleyfilmcommission.org';

            if (event.origin !== allowedOrigin) {
                console.warn('Received message from unauthorized origin:', event.origin);
                return;
            }

            if (event.data.type === 'OUTSETA_AUTH') {
                setIsAuthenticated(event.data.authenticated);
                setUser(event.data.user || null);
                setLoading(false);

                // session storage for token
                if (event.data.token) {
                    sessionStorage.setItem('outseta_token', event.data.token);
                } else {
                    sessionStorage.removeItem('outseta_token');
                }
            }
        };

        window.addEventListener('message', handleMessage);

        // Request auth status
        if (window.parent !== window) {
            window.parent.postMessage(
                { type: 'REQUEST_AUTH_STATUS' },
                'https://hudsonvalleyfilmcommission.org'
            );
        } else {
            setLoading(false);
        }

        // Timeout fallback
        const timeout = setTimeout(() => {
            if (loading) {
                setLoading(false);
            }
        }, 3000);

        return () => {
            window.removeEventListener('message', handleMessage);
            clearTimeout(timeout);
        };
    }, [loading]);

    return { isAuthenticated, loading, user };
};