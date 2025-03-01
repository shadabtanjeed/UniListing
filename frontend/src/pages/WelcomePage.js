import React, { useEffect, useState } from 'react';

const WelcomePage = () => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await fetch('http://localhost:5000/auth/session', {
                    credentials: 'include'
                });
                const data = await response.json();
                if (response.ok) {
                    setUsername(data.username);
                } else {
                    window.location.href = '/';
                }
            } catch (err) {
                window.location.href = '/';
            }
        };

        fetchUsername();
    }, []);

    return (
        <div className="welcome-container">
            <h1>Welcome {username}</h1>
        </div>
    );
};

export default WelcomePage;