import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';
import logo from '../unilisting_rectangle.png'; // Import the logo

const AppSidebar = () => {
    const navRef = useRef(null);
    const menuBtnRef = useRef(null);
    const closeBtnRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        // Using refs instead of querying the DOM directly
        const navBar = navRef.current;
        const menuBtn = menuBtnRef.current;
        const closeBtn = closeBtnRef.current;
        const overlay = overlayRef.current;

        // Get the content element that should be dimmed
        const content = document.querySelector(".content");
        const topbar = document.querySelector(".logo");

        const toggleSidebar = () => {
            if (navBar) {
                navBar.classList.toggle("open");
            }

            // set top bar visibility to hidden when sidebar is open
            topbar.style.visibility = "none";
        };

        const closeSidebar = () => {
            if (navBar) {
                navBar.classList.remove("open");
            }

            // set top bar visibility to visible when sidebar is closed
            topbar.style.visibility = "visible";
        };

        // Add event listeners
        if (menuBtn) {
            menuBtn.addEventListener("click", toggleSidebar);
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", closeSidebar);
        }

        if (overlay) {
            overlay.addEventListener("click", closeSidebar);
        }

        // Clean up event listeners
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
                                <Link to="/" className="nav-link">
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
                                <Link to="/add-apartment" className="nav-link">
                                    <i className="bx bx-plus-circle icon"></i>
                                    <span className="link">Add New Apartment</span>
                                </Link>
                            </li>
                            <li className="list">
                                <Link to="/add-post" className="nav-link">
                                    <i className="bx bx-plus-circle icon"></i>
                                    <span className="link">Add New Post</span>
                                </Link>
                            </li>
                            <li className="list">
                                <Link to="/saved-items" className="nav-link">
                                    <i className="bx bx-bookmark icon"></i>
                                    <span className="link">Saved Items</span>
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
                                <Link to="/logout" className="nav-link">
                                    <i className="bx bx-log-out icon"></i>
                                    <span className="link">Logout</span>
                                </Link>
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