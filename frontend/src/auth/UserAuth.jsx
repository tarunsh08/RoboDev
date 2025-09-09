import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/user.context';

const UserAuth = ({ children }) => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading && !user) {
            // Redirect to login but save the current location they were trying to go to
            navigate('/login', { state: { from: location }, replace: true });
        }
    }, [user, isLoading, navigate, location]);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#121212',
                color: 'white'
            }}>
                <div className="spinner">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null; // Will be redirected by the useEffect
    }

    return <>{children}</>;
};

export default UserAuth;
