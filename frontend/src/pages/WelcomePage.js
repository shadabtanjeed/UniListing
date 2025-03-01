import React from 'react';
import { useLocation } from 'react-router-dom';

const WelcomePage = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const username = params.get('username');

    return (
        <div className="welcome-container">
            <h1>Welcome {username}</h1>
        </div>
    );
};

export default WelcomePage;