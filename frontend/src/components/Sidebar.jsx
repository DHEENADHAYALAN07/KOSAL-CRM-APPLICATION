import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    const displayRole =
        role === "SALES_EMPLOYEE"
            ? "Sales Employee"
            : "Administrator";

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        navigate("/login", {
            replace: true
        });
    };

    const getInitial = () => {

        if (!email) {
            return "U";
        }

        return email
            .charAt(0)
            .toUpperCase();
    };

    return (

        <aside className="crm-sidebar">

            {/* =================================================
                LOGO
            ================================================= */}

            <div className="sidebar-logo">

                <div className="sidebar-logo-icon">
                    RE
                </div>

                <div>

                    <h2>
                        EstateCRM
                    </h2>

                    <span>
                        Real Estate Management
                    </span>

                </div>

            </div>


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav className="sidebar-nav">

                <div className="sidebar-section-title">
                    MAIN
                </div>


                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive
                                ? "active"
                                : ""
                        }`
                    }
                >

                    <span className="sidebar-link-icon">
                        ▦
                    </span>

                    <span>
                        Dashboard
                    </span>

                </NavLink>


                <NavLink
                    to="/leads"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive
                                ? "active"
                                : ""
                        }`
                    }
                >

                    <span className="sidebar-link-icon">
                        👥
                    </span>

                    <span>
                        Leads
                    </span>

                </NavLink>


                <NavLink
                    to="/properties"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive
                                ? "active"
                                : ""
                        }`
                    }
                >

                    <span className="sidebar-link-icon">
                        🏢
                    </span>

                    <span>
                        Properties
                    </span>

                </NavLink>


                <NavLink
                    to="/bookings"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive
                                ? "active"
                                : ""
                        }`
                    }
                >

                    <span className="sidebar-link-icon">
                        📋
                    </span>

                    <span>
                        Bookings
                    </span>

                </NavLink>

            </nav>


            {/* =================================================
                BOTTOM USER SECTION
            ================================================= */}

            <div className="sidebar-bottom">

                <div className="sidebar-user">

                    <div className="sidebar-avatar">
                        {getInitial()}
                    </div>

                    <div className="sidebar-user-info">

                        <strong>
                            {role === "ADMIN"
                                ? "Administrator"
                                : "Sales Employee"}
                        </strong>

                        <span>
                            {email || "User"}
                        </span>

                    </div>

                </div>


                <div className="sidebar-role">

                    <span className="role-dot"></span>

                    {displayRole}

                </div>


                <button
                    className="sidebar-logout"
                    onClick={handleLogout}
                >

                    <span>
                        ↪
                    </span>

                    Logout

                </button>

            </div>

        </aside>
    );
}

export default Sidebar;