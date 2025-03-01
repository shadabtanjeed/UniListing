import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const AppSidebar = () => {
    useEffect(() => {
        const navBar = document.querySelector("nav");
        const menuBtn = document.querySelector(".menu-icon");
        const closeBtn = document.querySelector(".close-icon");
        const overlay = document.querySelector(".overlay");
        const content = document.querySelector(".content"); // Targets main content

        const toggleSidebar = () => {
            if (navBar) {
                navBar.classList.toggle("open");
                if (content) {
                    content.classList.toggle("blurred"); // Apply opacity effect
                }
            }
        };

        const closeSidebar = () => {
            if (navBar) {
                navBar.classList.remove("open");
                if (content) {
                    content.classList.remove("blurred");
                }
            }
        };

        if (menuBtn) menuBtn.addEventListener("click", toggleSidebar);
        if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
        if (overlay) overlay.addEventListener("click", closeSidebar);

        return () => {
            if (menuBtn) menuBtn.removeEventListener("click", toggleSidebar);
            if (closeBtn) closeBtn.removeEventListener("click", closeSidebar);
            if (overlay) overlay.removeEventListener("click", closeSidebar);
        };
    }, []);

    return (
        <>
            <nav>
                <div className="logo">
                    <i className="bx bx-menu menu-icon"></i>
                    <span className="logo-name">UniListing</span>
                </div>
                <div className="sidebar">
                    <div className="sidebar-header">
                        <span className="logo-name">UniListing</span>
                        <i className="bx bx-x close-icon"></i>
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
            <section className="overlay"></section>
        </>
    );
};

export default AppSidebar;