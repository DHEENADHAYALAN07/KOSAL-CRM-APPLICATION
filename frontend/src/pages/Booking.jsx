import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import Layout from "../components/Layout";

import "../styles/Booking.css";

function Booking() {

    const navigate = useNavigate();

    const [leads, setLeads] = useState([]);
    const [units, setUnits] = useState([]);
    const [bookings, setBookings] = useState([]);

    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [selectedLeadId, setSelectedLeadId] =
        useState("");

    const [selectedUnitId, setSelectedUnitId] =
        useState("");

    const [leadSearch, setLeadSearch] =
        useState("");

    const [unitSearch, setUnitSearch] =
        useState("");

    const [showConfirmModal, setShowConfirmModal] =
        useState(false);


    useEffect(() => {
        loadBookingData();
    }, []);


    const loadBookingData = async () => {

        setLoading(true);
        setError("");

        try {

            const [
                leadsResponse,
                unitsResponse,
                bookingsResponse
            ] = await Promise.all([
                api.get("/leads"),
                api.get("/units"),
                api.get("/bookings")
            ]);

            setLeads(leadsResponse.data || []);
            setUnits(unitsResponse.data || []);
            setBookings(bookingsResponse.data || []);

        } catch (err) {

            if (err.response?.status === 401) {
                handleUnauthorized();
                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to load booking data."
            );

        } finally {

            setLoading(false);

        }
    };


    const handleUnauthorized = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        navigate("/login", {
            replace: true
        });
    };


    const clearMessages = () => {
        setError("");
        setSuccess("");
    };


    /* =====================================================
       DATA
       ===================================================== */

    const availableUnits = useMemo(() => {

        return units.filter(
            (unit) =>
                unit.status === "AVAILABLE"
        );

    }, [units]);


    const filteredLeads = useMemo(() => {

        const search =
            leadSearch.trim().toLowerCase();

        if (!search) {
            return leads;
        }

        return leads.filter((lead) => {

            const name =
                String(lead.name || "")
                    .toLowerCase();

            const email =
                String(lead.email || "")
                    .toLowerCase();

            const phone =
                String(lead.phone || "")
                    .toLowerCase();

            return (
                name.includes(search) ||
                email.includes(search) ||
                phone.includes(search)
            );
        });

    }, [leads, leadSearch]);


    const filteredUnits = useMemo(() => {

        const search =
            unitSearch.trim().toLowerCase();

        if (!search) {
            return availableUnits;
        }

        return availableUnits.filter((unit) => {

            const unitNumber =
                String(unit.unitNumber || "")
                    .toLowerCase();

            const unitType =
                String(unit.unitType || "")
                    .toLowerCase();

            const building =
                String(
                    unit.building?.name || ""
                ).toLowerCase();

            const project =
                String(
                    unit.building?.project?.name || ""
                ).toLowerCase();

            return (
                unitNumber.includes(search) ||
                unitType.includes(search) ||
                building.includes(search) ||
                project.includes(search)
            );
        });

    }, [availableUnits, unitSearch]);


    const selectedLead = useMemo(() => {

        return leads.find(
            (lead) =>
                Number(lead.id) ===
                Number(selectedLeadId)
        );

    }, [leads, selectedLeadId]);


    const selectedUnit = useMemo(() => {

        return units.find(
            (unit) =>
                Number(unit.id) ===
                Number(selectedUnitId)
        );

    }, [units, selectedUnitId]);


    /* =====================================================
       COUNTS
       ===================================================== */

    const totalBookings = bookings.length;

    const activeBookings =
        bookings.filter(
            (booking) =>
                booking.status === "BOOKED"
        ).length;

    const cancelledBookings =
        bookings.filter(
            (booking) =>
                booking.status === "CANCELLED"
        ).length;

    const availableCount =
        availableUnits.length;


    /* =====================================================
       SELECTION
       ===================================================== */

    const handleLeadSelect = (leadId) => {

        clearMessages();

        setSelectedLeadId(
            leadId
        );
    };


    const handleUnitSelect = (unitId) => {

        clearMessages();

        setSelectedUnitId(
            unitId
        );
    };


    const resetSelection = () => {

        setSelectedLeadId("");
        setSelectedUnitId("");

        setLeadSearch("");
        setUnitSearch("");

        setShowConfirmModal(false);
    };


    /* =====================================================
       BOOKING
       ===================================================== */

    const openConfirmModal = () => {

        clearMessages();

        if (!selectedLeadId) {

            setError(
                "Please select a lead before continuing."
            );

            return;
        }

        if (!selectedUnitId) {

            setError(
                "Please select an available unit before continuing."
            );

            return;
        }

        if (!selectedUnit) {

            setError(
                "The selected unit could not be found."
            );

            return;
        }

        if (selectedUnit.status !== "AVAILABLE") {

            setError(
                "This unit is no longer available. Please refresh the page and select another unit."
            );

            return;
        }

        setShowConfirmModal(true);
    };


    const closeConfirmModal = () => {

        if (bookingLoading) {
            return;
        }

        setShowConfirmModal(false);
    };


    const confirmBooking = async () => {

        if (!selectedLeadId || !selectedUnitId) {
            return;
        }

        setBookingLoading(true);
        clearMessages();

        try {

            /*
             * BookingController accepts leadId and unitId
             * as request parameters.
             */

            await api.post(
                `/bookings?leadId=${Number(
                    selectedLeadId
                )}&unitId=${Number(
                    selectedUnitId
                )}`
            );

            setSuccess(
                `Booking confirmed for ${
                    selectedLead?.name || "the selected lead"
                }. Unit ${
                    selectedUnit?.unitNumber || ""
                } is now booked.`
            );

            setShowConfirmModal(false);

            resetSelection();

            await loadBookingData();

        } catch (err) {

            if (err.response?.status === 401) {
                handleUnauthorized();
                return;
            }

            /*
             * Backend remains the source of truth for
             * double-booking protection.
             */

            const backendMessage =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "";

            if (
                backendMessage
                    .toLowerCase()
                    .includes("already booked")
            ) {

                setError(
                    "This unit was just booked by another user. Please select another available unit."
                );

            } else {

                setError(
                    backendMessage ||
                    "Unable to complete the booking."
                );
            }

            setShowConfirmModal(false);

            await loadBookingData();

        } finally {

            setBookingLoading(false);

        }
    };


    /* =====================================================
       HELPERS
       ===================================================== */

    const formatPrice = (price) => {

        if (
            price === null ||
            price === undefined ||
            price === ""
        ) {
            return "—";
        }

        return `₹${Number(price).toLocaleString(
            "en-IN"
        )}`;
    };


    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "—";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return dateValue;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    const formatDateTime = (dateValue) => {

        if (!dateValue) {
            return "—";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return dateValue;
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };


    const getInitial = (name) => {

        if (!name) {
            return "L";
        }

        return name
            .charAt(0)
            .toUpperCase();
    };


    const getProjectName = (unit) => {

        return (
            unit?.building?.project?.name ||
            "Project"
        );
    };


    const getBuildingName = (unit) => {

        return (
            unit?.building?.name ||
            "Building"
        );
    };


    const getStatusClass = (status) => {

        if (status === "CANCELLED") {
            return "booking-status-cancelled";
        }

        return "booking-status-booked";
    };


    if (loading) {

        return (
            <Layout>

                <div className="booking-page">

                    <div className="booking-loading">

                        <div className="booking-spinner"></div>

                        <p>
                            Loading bookings...
                        </p>

                    </div>

                </div>

            </Layout>
        );
    }


    return (
        <Layout>

            <div className="booking-page">

                {/* =================================================
                   HEADER
                   ================================================= */}

                <div className="booking-header">

                    <div>

                        <div className="booking-eyebrow">
                            SALES OPERATIONS
                        </div>

                        <h1>
                            Bookings
                        </h1>

                        <p>
                            Connect leads with available
                            property units
                        </p>

                    </div>

                </div>


                {/* =================================================
                   ALERTS
                   ================================================= */}

                {success && (

                    <div className="booking-alert booking-alert-success">

                        <span className="booking-alert-icon">
                            ✓
                        </span>

                        <span>
                            {success}
                        </span>

                        <button
                            onClick={() =>
                                setSuccess("")
                            }
                        >
                            ×
                        </button>

                    </div>

                )}


                {error && (

                    <div className="booking-alert booking-alert-error">

                        <span className="booking-alert-icon">
                            !
                        </span>

                        <span>
                            {error}
                        </span>

                        <button
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* =================================================
                   SUMMARY
                   ================================================= */}

                <div className="booking-summary">

                    <div className="booking-summary-card">

                        <div className="booking-summary-icon booking-icon-blue">
                            📋
                        </div>

                        <div>

                            <span>
                                TOTAL BOOKINGS
                            </span>

                            <strong>
                                {totalBookings}
                            </strong>

                        </div>

                    </div>


                    <div className="booking-summary-card">

                        <div className="booking-summary-icon booking-icon-green">
                            ✓
                        </div>

                        <div>

                            <span>
                                ACTIVE BOOKINGS
                            </span>

                            <strong>
                                {activeBookings}
                            </strong>

                        </div>

                    </div>


                    <div className="booking-summary-card">

                        <div className="booking-summary-icon booking-icon-cyan">
                            ◇
                        </div>

                        <div>

                            <span>
                                AVAILABLE UNITS
                            </span>

                            <strong>
                                {availableCount}
                            </strong>

                        </div>

                    </div>


                    <div className="booking-summary-card">

                        <div className="booking-summary-icon booking-icon-orange">
                            ↺
                        </div>

                        <div>

                            <span>
                                CANCELLED
                            </span>

                            <strong>
                                {cancelledBookings}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                   CREATE BOOKING
                   ================================================= */}

                <div className="create-booking-card">

                    <div className="create-booking-header">

                        <div>

                            <div className="create-booking-step">
                                BOOKING WORKFLOW
                            </div>

                            <h2>
                                Create New Booking
                            </h2>

                            <p>
                                Select a lead and an available
                                unit to create a booking.
                            </p>

                        </div>

                        <div className="booking-secure-note">

                            <span>
                                ✓
                            </span>

                            <span>
                                Availability checked
                            </span>

                        </div>

                    </div>


                    <div className="booking-workflow">


                        {/* LEAD */}

                        <div className="booking-selection-card">

                            <div className="selection-card-heading">

                                <div className="selection-number">
                                    1
                                </div>

                                <div>

                                    <h3>
                                        Select Lead
                                    </h3>

                                    <span>
                                        Choose the customer
                                    </span>

                                </div>

                            </div>


                            <div className="selection-search">

                                <span>
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={leadSearch}
                                    onChange={(event) =>
                                        setLeadSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search lead by name, email or phone"
                                />

                            </div>


                            <div className="selection-list">

                                {filteredLeads.length ===
                                0 ? (

                                    <div className="selection-empty">

                                        <div>
                                            👥
                                        </div>

                                        <strong>
                                            No leads found
                                        </strong>

                                        <span>
                                            Try another search.
                                        </span>

                                    </div>

                                ) : (

                                    filteredLeads.map(
                                        (lead) => {

                                            const isSelected =
                                                Number(
                                                    selectedLeadId
                                                ) ===
                                                Number(
                                                    lead.id
                                                );

                                            return (

                                                <button
                                                    type="button"
                                                    key={
                                                        lead.id
                                                    }
                                                    className={`lead-option ${
                                                        isSelected
                                                            ? "selected"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        handleLeadSelect(
                                                            lead.id
                                                        )
                                                    }
                                                >

                                                    <div className="lead-option-avatar">
                                                        {getInitial(
                                                            lead.name
                                                        )}
                                                    </div>

                                                    <div className="lead-option-info">

                                                        <strong>
                                                            {
                                                                lead.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                lead.phone
                                                            }
                                                        </span>

                                                        <small>
                                                            {
                                                                lead.email
                                                            }
                                                        </small>

                                                    </div>

                                                    {isSelected && (

                                                        <div className="selection-check">
                                                            ✓
                                                        </div>

                                                    )}

                                                </button>

                                            );
                                        }
                                    )

                                )}

                            </div>

                        </div>


                        {/* CONNECTOR */}

                        <div className="workflow-connector">
                            →
                        </div>


                        {/* UNIT */}

                        <div className="booking-selection-card">

                            <div className="selection-card-heading">

                                <div className="selection-number">
                                    2
                                </div>

                                <div>

                                    <h3>
                                        Select Unit
                                    </h3>

                                    <span>
                                        Only available units
                                    </span>

                                </div>

                            </div>


                            <div className="selection-search">

                                <span>
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={unitSearch}
                                    onChange={(event) =>
                                        setUnitSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search unit, building or project"
                                />

                            </div>


                            <div className="selection-list">

                                {filteredUnits.length ===
                                0 ? (

                                    <div className="selection-empty">

                                        <div>
                                            ◇
                                        </div>

                                        <strong>
                                            No available units
                                        </strong>

                                        <span>
                                            There are currently no
                                            units available for booking.
                                        </span>

                                    </div>

                                ) : (

                                    filteredUnits.map(
                                        (unit) => {

                                            const isSelected =
                                                Number(
                                                    selectedUnitId
                                                ) ===
                                                Number(
                                                    unit.id
                                                );

                                            return (

                                                <button
                                                    type="button"
                                                    key={
                                                        unit.id
                                                    }
                                                    className={`unit-option ${
                                                        isSelected
                                                            ? "selected"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        handleUnitSelect(
                                                            unit.id
                                                        )
                                                    }
                                                >

                                                    <div className="unit-option-icon">
                                                        ◇
                                                    </div>

                                                    <div className="unit-option-info">

                                                        <div>

                                                            <strong>
                                                                Unit{" "}
                                                                {
                                                                    unit.unitNumber
                                                                }
                                                            </strong>

                                                            <span className="available-mini-badge">
                                                                Available
                                                            </span>

                                                        </div>

                                                        <span>
                                                            {
                                                                unit.unitType
                                                            }
                                                        </span>

                                                        <small>
                                                            {
                                                                getProjectName(
                                                                    unit
                                                                )
                                                            }{" "}
                                                            ·{" "}
                                                            {
                                                                getBuildingName(
                                                                    unit
                                                                )
                                                            }
                                                        </small>

                                                    </div>

                                                    <div className="unit-option-price">

                                                        <strong>
                                                            {
                                                                formatPrice(
                                                                    unit.price
                                                                )
                                                            }
                                                        </strong>

                                                        {isSelected && (

                                                            <div className="selection-check">
                                                                ✓
                                                            </div>

                                                        )}

                                                    </div>

                                                </button>

                                            );
                                        }
                                    )

                                )}

                            </div>

                        </div>

                    </div>


                    {/* BOOKING REVIEW */}

                    <div className="booking-review">

                        <div className="review-heading">

                            <div>

                                <span>
                                    STEP 3
                                </span>

                                <h3>
                                    Review Booking
                                </h3>

                            </div>

                        </div>


                        <div className="review-content">

                            <div className="review-person">

                                <div className="review-avatar">
                                    {getInitial(
                                        selectedLead?.name
                                    )}
                                </div>

                                <div>

                                    <span>
                                        CUSTOMER / LEAD
                                    </span>

                                    <strong>
                                        {selectedLead?.name ||
                                            "No lead selected"}
                                    </strong>

                                    <small>
                                        {selectedLead?.email ||
                                            "Select a lead to continue"}
                                    </small>

                                </div>

                            </div>


                            <div className="review-arrow">
                                →
                            </div>


                            <div className="review-unit">

                                <div className="review-unit-icon">
                                    ◇
                                </div>

                                <div>

                                    <span>
                                        PROPERTY UNIT
                                    </span>

                                    <strong>
                                        {selectedUnit
                                            ? `Unit ${selectedUnit.unitNumber}`
                                            : "No unit selected"}
                                    </strong>

                                    <small>
                                        {selectedUnit
                                            ? `${getProjectName(
                                                selectedUnit
                                            )} · ${getBuildingName(
                                                selectedUnit
                                            )}`
                                            : "Select an available unit to continue"}
                                    </small>

                                </div>

                            </div>


                            <div className="review-price">

                                <span>
                                    UNIT PRICE
                                </span>

                                <strong>
                                    {selectedUnit
                                        ? formatPrice(
                                            selectedUnit.price
                                        )
                                        : "—"}
                                </strong>

                            </div>

                        </div>


                        <div className="booking-action-row">

                            <button
                                type="button"
                                className="clear-booking-btn"
                                onClick={
                                    resetSelection
                                }
                                disabled={
                                    bookingLoading
                                }
                            >
                                Clear Selection
                            </button>

                            <button
                                type="button"
                                className="confirm-booking-btn"
                                onClick={
                                    openConfirmModal
                                }
                                disabled={
                                    !selectedLeadId ||
                                    !selectedUnitId ||
                                    bookingLoading
                                }
                            >
                                <span>
                                    ✓
                                </span>

                                Continue to Confirmation
                            </button>

                        </div>

                    </div>

                </div>


                {/* =================================================
                   BOOKING HISTORY
                   ================================================= */}

                <div className="booking-history-card">

                    <div className="booking-history-header">

                        <div>

                            <div className="booking-history-eyebrow">
                                RECORDS
                            </div>

                            <h2>
                                Booking History
                            </h2>

                            <p>
                                Recent property bookings
                            </p>

                        </div>

                        <button
                            className="refresh-bookings-btn"
                            onClick={
                                loadBookingData
                            }
                        >
                            ↻ Refresh
                        </button>

                    </div>


                    {bookings.length === 0 ? (

                        <div className="booking-history-empty">

                            <div className="history-empty-icon">
                                📋
                            </div>

                            <h3>
                                No bookings yet
                            </h3>

                            <p>
                                Confirmed bookings will appear
                                here.
                            </p>

                        </div>

                    ) : (

                        <div className="booking-history-table-wrapper">

                            <table className="booking-history-table">

                                <thead>

                                    <tr>

                                        <th>
                                            BOOKING
                                        </th>

                                        <th>
                                            LEAD / CUSTOMER
                                        </th>

                                        <th>
                                            PROPERTY
                                        </th>

                                        <th>
                                            UNIT
                                        </th>

                                        <th>
                                            PRICE
                                        </th>

                                        <th>
                                            DATE
                                        </th>

                                        <th>
                                            STATUS
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {[...bookings]
                                        .sort(
                                            (
                                                first,
                                                second
                                            ) => {

                                                const firstDate =
                                                    new Date(
                                                        first.bookingDate ||
                                                        0
                                                    ).getTime();

                                                const secondDate =
                                                    new Date(
                                                        second.bookingDate ||
                                                        0
                                                    ).getTime();

                                                return (
                                                    secondDate -
                                                    firstDate
                                                );
                                            }
                                        )
                                        .map(
                                            (booking) => {

                                                const lead =
                                                    booking.lead;

                                                const unit =
                                                    booking.unit;

                                                return (

                                                    <tr
                                                        key={
                                                            booking.id
                                                        }
                                                    >

                                                        <td>

                                                            <span className="booking-id">
                                                                #
                                                                {
                                                                    booking.id
                                                                }
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <div className="history-lead">

                                                                <div className="history-lead-avatar">
                                                                    {getInitial(
                                                                        lead?.name
                                                                    )}
                                                                </div>

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            lead?.name ||
                                                                            "Unknown Lead"
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            lead?.email ||
                                                                            "—"
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <div className="history-property">

                                                                <strong>
                                                                    {
                                                                        getProjectName(
                                                                            unit
                                                                        )
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        getBuildingName(
                                                                            unit
                                                                        )
                                                                    }
                                                                </span>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <span className="history-unit">
                                                                {
                                                                    unit?.unitNumber ||
                                                                    "—"
                                                                }
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <strong className="history-price">
                                                                {
                                                                    formatPrice(
                                                                        unit?.price
                                                                    )
                                                                }
                                                            </strong>

                                                        </td>


                                                        <td>

                                                            <div className="history-date">

                                                                <strong>
                                                                    {
                                                                        formatDate(
                                                                            booking.bookingDate
                                                                        )
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        formatDateTime(
                                                                            booking.bookingDate
                                                                        )
                                                                            .split(
                                                                                ","
                                                                            )[1] ||
                                                                            ""
                                                                    }
                                                                </span>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={`booking-status-badge ${getStatusClass(
                                                                    booking.status
                                                                )}`}
                                                            >

                                                                <span className="booking-status-dot">
                                                                </span>

                                                                {booking.status ===
                                                                "CANCELLED"
                                                                    ? "Cancelled"
                                                                    : "Booked"}

                                                            </span>

                                                        </td>

                                                    </tr>

                                                );
                                            }
                                        )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* =================================================
                   CONFIRM MODAL
                   ================================================= */}

                {showConfirmModal && (

                    <div
                        className="booking-modal-overlay"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeConfirmModal();
                            }

                        }}
                    >

                        <div className="booking-confirm-modal">

                            <div className="confirm-modal-header">

                                <div className="confirm-icon">
                                    ✓
                                </div>

                                <div>

                                    <span>
                                        FINAL STEP
                                    </span>

                                    <h2>
                                        Confirm Booking
                                    </h2>

                                    <p>
                                        Please review the details
                                        before confirming.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="confirm-close-btn"
                                    onClick={
                                        closeConfirmModal
                                    }
                                    disabled={
                                        bookingLoading
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="confirm-details">

                                <div className="confirm-detail-row">

                                    <span>
                                        Lead
                                    </span>

                                    <strong>
                                        {
                                            selectedLead?.name ||
                                            "—"
                                        }
                                    </strong>

                                </div>


                                <div className="confirm-detail-row">

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {
                                            selectedLead?.email ||
                                            "—"
                                        }
                                    </strong>

                                </div>


                                <div className="confirm-detail-row">

                                    <span>
                                        Property
                                    </span>

                                    <strong>
                                        {
                                            getProjectName(
                                                selectedUnit
                                            )
                                        }
                                    </strong>

                                </div>


                                <div className="confirm-detail-row">

                                    <span>
                                        Building
                                    </span>

                                    <strong>
                                        {
                                            getBuildingName(
                                                selectedUnit
                                            )
                                        }
                                    </strong>

                                </div>


                                <div className="confirm-detail-row">

                                    <span>
                                        Unit
                                    </span>

                                    <strong>
                                        {selectedUnit
                                            ? selectedUnit.unitNumber
                                            : "—"}
                                    </strong>

                                </div>


                                <div className="confirm-detail-row">

                                    <span>
                                        Type
                                    </span>

                                    <strong>
                                        {
                                            selectedUnit?.unitType ||
                                            "—"
                                        }
                                    </strong>

                                </div>


                                <div className="confirm-detail-row total-row">

                                    <span>
                                        Booking Price
                                    </span>

                                    <strong>
                                        {
                                            formatPrice(
                                                selectedUnit?.price
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div className="confirm-warning">

                                <span>
                                    !
                                </span>

                                <p>
                                    Once confirmed, this unit will
                                    be marked as <strong>BOOKED</strong>.
                                    Other users will no longer be
                                    able to book it.
                                </p>

                            </div>


                            <div className="confirm-modal-footer">

                                <button
                                    type="button"
                                    className="confirm-cancel-btn"
                                    onClick={
                                        closeConfirmModal
                                    }
                                    disabled={
                                        bookingLoading
                                    }
                                >
                                    Go Back
                                </button>

                                <button
                                    type="button"
                                    className="confirm-submit-btn"
                                    onClick={
                                        confirmBooking
                                    }
                                    disabled={
                                        bookingLoading
                                    }
                                >
                                    {bookingLoading
                                        ? "Confirming..."
                                        : "Confirm Booking"}
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </Layout>
    );
}

export default Booking;