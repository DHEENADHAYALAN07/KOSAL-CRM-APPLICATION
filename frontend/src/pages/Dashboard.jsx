import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import Layout from "../components/Layout";

import "../styles/Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await api.get("/dashboard");

            setDashboard(response.data);
        } catch (err) {
            console.error(err);

            if (err.response?.status === 401) {
                localStorage.clear();

                navigate("/login", {
                    replace: true
                });

                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to load dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (value) => {
        return Number(value || 0).toLocaleString(
            "en-IN"
        );
    };

    const leadPipeline = [
        {
            label: "New",
            key: "newLeads",
            className: "pipeline-new"
        },
        {
            label: "Contacted",
            key: "contactedLeads",
            className: "pipeline-contacted"
        },
        {
            label: "Site Visit",
            key: "siteVisitLeads",
            className: "pipeline-site"
        },
        {
            label: "Interested",
            key: "interestedLeads",
            className: "pipeline-interested"
        },
        {
            label: "Negotiation",
            key: "negotiationLeads",
            className: "pipeline-negotiation"
        },
        {
            label: "Booked",
            key: "bookedLeads",
            className: "pipeline-booked"
        },
        {
            label: "Lost",
            key: "lostLeads",
            className: "pipeline-lost"
        }
    ];

    const totalPipelineLeads =
        Number(
            dashboard?.totalLeads || 0
        );

    return (
        <Layout>

            <div className="dashboard-page">

                <div className="dashboard-header">

                    <div>
                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Overview of your real estate CRM
                        </p>
                    </div>

                    <button
                        className="dashboard-refresh-btn"
                        onClick={
                            fetchDashboard
                        }
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>

                </div>

                {error && (
                    <div className="dashboard-alert">

                        <span>
                            !
                        </span>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {loading ? (
                    <div className="dashboard-loading">

                        <div className="dashboard-spinner"></div>

                        <p>
                            Loading dashboard...
                        </p>

                    </div>
                ) : (
                    <>
                        {/* KPI CARDS */}

                        <div className="dashboard-kpi-grid">

                            <DashboardKpi
                                icon="👥"
                                label="Total Leads"
                                value={
                                    dashboard?.totalLeads
                                }
                                description="All registered leads"
                            />

                            <DashboardKpi
                                icon="✨"
                                label="New Leads"
                                value={
                                    dashboard?.newLeads
                                }
                                description="Fresh enquiries"
                            />

                            <DashboardKpi
                                icon="🏠"
                                label="Available Units"
                                value={
                                    dashboard?.availableUnits
                                }
                                description="Ready for booking"
                            />

                            <DashboardKpi
                                icon="📋"
                                label="Active Bookings"
                                value={
                                    dashboard?.activeBookings
                                }
                                description="Current bookings"
                            />

                        </div>

                        <div className="dashboard-content-grid">

                            {/* LEAD PIPELINE */}

                            <section className="dashboard-card">

                                <div className="dashboard-card-header">

                                    <div>
                                        <h2>
                                            Lead Pipeline
                                        </h2>

                                        <p>
                                            Current lead distribution
                                        </p>
                                    </div>

                                    <button
                                        className="dashboard-link-btn"
                                        onClick={() =>
                                            navigate(
                                                "/leads"
                                            )
                                        }
                                    >
                                        View Leads →
                                    </button>

                                </div>

                                <div className="pipeline-list">

                                    {leadPipeline.map(
                                        (stage) => {

                                            const count =
                                                Number(
                                                    dashboard?.[
                                                        stage.key
                                                    ] || 0
                                                );

                                            const percentage =
                                                totalPipelineLeads >
                                                0
                                                    ? Math.round(
                                                        (
                                                            count /
                                                            totalPipelineLeads
                                                        ) *
                                                        100
                                                    )
                                                    : 0;

                                            return (
                                                <div
                                                    className="pipeline-item"
                                                    key={
                                                        stage.key
                                                    }
                                                >

                                                    <div className="pipeline-top">

                                                        <div className="pipeline-label">

                                                            <span
                                                                className={`pipeline-dot ${stage.className}`}
                                                            ></span>

                                                            <span>
                                                                {
                                                                    stage.label
                                                                }
                                                            </span>

                                                        </div>

                                                        <strong>
                                                            {formatNumber(
                                                                count
                                                            )}
                                                        </strong>

                                                    </div>

                                                    <div className="pipeline-bar">

                                                        <div
                                                            className={`pipeline-progress ${stage.className}`}
                                                            style={{
                                                                width: `${percentage}%`
                                                            }}
                                                        ></div>

                                                    </div>

                                                    <span className="pipeline-percentage">
                                                        {
                                                            percentage
                                                        }
                                                        %
                                                    </span>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            </section>

                            {/* PROPERTY OVERVIEW */}

                            <section className="dashboard-card">

                                <div className="dashboard-card-header">

                                    <div>
                                        <h2>
                                            Property Overview
                                        </h2>

                                        <p>
                                            Unit availability
                                        </p>
                                    </div>

                                    <button
                                        className="dashboard-link-btn"
                                        onClick={() =>
                                            navigate(
                                                "/properties"
                                            )
                                        }
                                    >
                                        Properties →
                                    </button>

                                </div>

                                <div className="property-overview">

                                    <div className="property-circle">

                                        <div>
                                            <strong>
                                                {
                                                    formatNumber(
                                                        dashboard?.totalUnits
                                                    )
                                                }
                                            </strong>

                                            <span>
                                                Total Units
                                            </span>
                                        </div>

                                    </div>

                                    <div className="property-stats">

                                        <PropertyStat
                                            label="Available"
                                            value={
                                                dashboard?.availableUnits
                                            }
                                            className="available"
                                        />

                                        <PropertyStat
                                            label="Booked"
                                            value={
                                                dashboard?.bookedUnits
                                            }
                                            className="booked"
                                        />

                                    </div>

                                </div>

                                <div className="property-summary-row">

                                    <div>
                                        <span>
                                            Total Units
                                        </span>

                                        <strong>
                                            {
                                                formatNumber(
                                                    dashboard?.totalUnits
                                                )
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Available
                                        </span>

                                        <strong>
                                            {
                                                formatNumber(
                                                    dashboard?.availableUnits
                                                )
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Booked
                                        </span>

                                        <strong>
                                            {
                                                formatNumber(
                                                    dashboard?.bookedUnits
                                                )
                                            }
                                        </strong>
                                    </div>

                                </div>

                            </section>

                        </div>

                        {/* BOOKING SUMMARY */}

                        <section className="dashboard-card booking-summary-card">

                            <div className="dashboard-card-header">

                                <div>
                                    <h2>
                                        Booking Summary
                                    </h2>

                                    <p>
                                        Current booking activity
                                    </p>
                                </div>

                                <button
                                    className="dashboard-link-btn"
                                    onClick={() =>
                                        navigate(
                                            "/bookings"
                                        )
                                    }
                                >
                                    View Bookings →
                                </button>

                            </div>

                            <div className="booking-summary-grid">

                                <BookingSummary
                                    label="Total Bookings"
                                    value={
                                        dashboard?.totalBookings
                                    }
                                    icon="📋"
                                />

                                <BookingSummary
                                    label="Active Bookings"
                                    value={
                                        dashboard?.activeBookings
                                    }
                                    icon="✓"
                                />

                                <BookingSummary
                                    label="Cancelled"
                                    value={
                                        dashboard?.cancelledBookings
                                    }
                                    icon="↩"
                                />

                            </div>

                        </section>

                        {/* QUICK ACTIONS */}

                        <section className="dashboard-card quick-actions-card">

                            <div className="dashboard-card-header">

                                <div>
                                    <h2>
                                        Quick Actions
                                    </h2>

                                    <p>
                                        Common CRM operations
                                    </p>
                                </div>

                            </div>

                            <div className="quick-actions">

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/leads"
                                        )
                                    }
                                >
                                    <span>
                                        👥
                                    </span>

                                    <div>
                                        <strong>
                                            Manage Leads
                                        </strong>

                                        <small>
                                            Create and update leads
                                        </small>
                                    </div>

                                    <b>
                                        →
                                    </b>
                                </button>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/properties"
                                        )
                                    }
                                >
                                    <span>
                                        🏢
                                    </span>

                                    <div>
                                        <strong>
                                            Manage Properties
                                        </strong>

                                        <small>
                                            Projects, buildings and units
                                        </small>
                                    </div>

                                    <b>
                                        →
                                    </b>
                                </button>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/bookings"
                                        )
                                    }
                                >
                                    <span>
                                        📋
                                    </span>

                                    <div>
                                        <strong>
                                            Create Booking
                                        </strong>

                                        <small>
                                            Book an available unit
                                        </small>
                                    </div>

                                    <b>
                                        →
                                    </b>
                                </button>

                            </div>

                        </section>

                    </>
                )}

            </div>

        </Layout>
    );
}

function DashboardKpi({
    icon,
    label,
    value,
    description
}) {
    return (
        <div className="dashboard-kpi-card">

            <div className="dashboard-kpi-icon">
                {icon}
            </div>

            <div className="dashboard-kpi-content">

                <span>
                    {label}
                </span>

                <strong>
                    {Number(
                        value || 0
                    ).toLocaleString(
                        "en-IN"
                    )}
                </strong>

                <small>
                    {description}
                </small>

            </div>

        </div>
    );
}

function PropertyStat({
    label,
    value,
    className
}) {
    return (
        <div className="property-stat">

            <div
                className={`property-stat-dot ${className}`}
            ></div>

            <span>
                {label}
            </span>

            <strong>
                {Number(
                    value || 0
                ).toLocaleString(
                    "en-IN"
                )}
            </strong>

        </div>
    );
}

function BookingSummary({
    label,
    value,
    icon
}) {
    return (
        <div className="booking-summary-item">

            <div className="booking-summary-icon">
                {icon}
            </div>

            <div>
                <span>
                    {label}
                </span>

                <strong>
                    {Number(
                        value || 0
                    ).toLocaleString(
                        "en-IN"
                    )}
                </strong>
            </div>

        </div>
    );
}

export default Dashboard;