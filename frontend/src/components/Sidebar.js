import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';
import logo from '../unilisting_rectangle.png';
import { API_BASE_URL } from '../config/api-config';

const AppSidebar = () => {
    const navRef = useRef(null);
    const menuBtnRef = useRef(null);
    const closeBtnRef = useRef(null);
    const overlayRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const navBar = navRef.current;
        const menuBtn = menuBtnRef.current;
        const closeBtn = closeBtnRef.current;
        const overlay = overlayRef.current;

        const content = document.querySelector(".content");

        const toggleSidebar = () => {
            if (navBar) {
                navBar.classList.toggle("open");
            }
        };

        const closeSidebar = () => {
            if (navBar) {
                navBar.classList.remove("open");
            }
        };

        if (menuBtn) {
            menuBtn.addEventListener("click", toggleSidebar);
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", closeSidebar);
        }

        if (overlay) {
            overlay.addEventListener("click", closeSidebar);
        }

        return () => {
            if (menuBtn) {
                menuBtn.removeEventListener("click", toggleSidebar);
            }
            if (closeBtn) {
                closeBtn.removeEventListener("click", closeSidebar);
            }
            if (overlay) {
                overlay.removeEventListener("click", closeSidebar);
            }
        };
    }, []);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            // Call the backend logout endpoint
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            // Redirect to login page
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <>
            <nav ref={navRef}>
                <div className="logo">
                    <i className="bx bx-menu menu-icon" ref={menuBtnRef}></i>
                    <span className="logo-name">
                        <img src={logo} alt="UniListing" className="logo-img" />
                    </span>
                </div>
                <div className="sidebar">
                    <div className="sidebar-header">
                        <span className="logo-name">
                            <img src={logo} alt="UniListing" className="sidebar-logo-img" />
                        </span>
                        <i className="bx bx-x close-icon" ref={closeBtnRef}></i>
                    </div>
                    <div className="sidebar-content">
                        <ul className="lists">
                            <li className="list">
                                <Link to="/welcome" className="nav-link">
                                    <i className="bx bx-home-alt icon"></i>
                                    <span className="link">Dashboard</span>
                                </Link>
                            </li>
                            <li className="list">
                                <Link to="/view-apartments" className="nav-link">
                                    <i className="bx bx-building icon"></i>
                                    <span className="link">View Apartments</span>
                                </Link>
                            </li>
                            <li className="list">
                                <Link to="/view-marketplace" className="nav-link">
                                    <i className="bx bx-store icon"></i>
                                    <span className="link">View Marketplace</span>
                                </Link>
                            </li>
                            <li className="list">
                                <Link to="/add-apartments" className="nav-link">
                                    <i className="bx bx-plus-circle icon"></i>
                                    <span className="link">Add New Apartment</span>
                                </Link>
                            </li>
                            <li className="list">
                                <Link to="/add-item" className="nav-link">
                                    <i className="bx bx-plus-circle icon"></i>
                                    <span className="link">Add New Item</span>
                                </Link>
                            </li>
                            <li className="list">
                                <Link to="/saved-posts" className="nav-link">
                                    <i className="bx bx-bookmark icon"></i>
                                    <span className="link">Saved Posts</span>
                                </Link>
                            </li>

                            <li className="list">
                                <Link to="/messages" className="nav-link">
                                    <i className="bx bx-message icon"></i>
                                    <span className="link">My Messages</span>
                                </Link>
                            </li>
                        </ul>
                        <div className="bottom-content">
                            <li className="list">
                                <Link to="/profile" className="nav-link">
                                    <i className="bx bx-cog icon"></i>
                                    <span className="link">My Profile</span>
                                </Link>
                            </li>
                            <li className="list">
                                <a href="#" className="nav-link" onClick={handleLogout}>
                                    <i className="bx bx-log-out icon"></i>
                                    <span className="link">Logout</span>
                                </a>
                            </li>
                        </div>
                    </div>
                </div>
            </nav>
            <section className="overlay" ref={overlayRef}></section>
        </>
    );
};

export default AppSidebar;