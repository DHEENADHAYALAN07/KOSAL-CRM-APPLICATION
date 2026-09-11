import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import Layout from "../components/Layout";

import "../styles/Lead.css";

const LEAD_STATUSES = [
    "NEW",
    "CONTACTED",
    "SITE_VISIT",
    "INTERESTED",
    "NEGOTIATION",
    "BOOKED",
    "LOST"
];

function Lead() {
    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const isAdmin = role === "ADMIN";

    const [leads, setLeads] = useState([]);
    const [salesEmployees, setSalesEmployees] =
        useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("");
    const [employeeFilter, setEmployeeFilter] =
        useState("");

    const [showForm, setShowForm] = useState(false);
    const [showView, setShowView] = useState(false);

    const [editingLead, setEditingLead] =
        useState(null);

    const [viewingLead, setViewingLead] =
        useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        propertyType: "",
        status: "NEW",
        assignedTo: "",
        notes: "",
        followUpDate: ""
    });

    useEffect(() => {
        fetchLeads();
    }, [
        search,
        statusFilter,
        employeeFilter,
        isAdmin
    ]);

    useEffect(() => {
        if (isAdmin) {
            fetchSalesEmployees();
        }
    }, [isAdmin]);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (search.trim()) {
                params.search = search.trim();
            }

            if (statusFilter) {
                params.status = statusFilter;
            }

            if (isAdmin && employeeFilter) {
                params.assignedToId =
                    employeeFilter;
            }

            const response =
                await api.get("/leads", {
                    params
                });

            setLeads(response.data || []);
        } catch (err) {
            handleApiError(
                err,
                "Unable to load leads."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchSalesEmployees = async () => {
        try {
            const response =
                await api.get(
                    "/users/sales-employees"
                );

            setSalesEmployees(
                response.data || []
            );
        } catch (err) {
            handleApiError(
                err,
                "Unable to load sales employees."
            );
        }
    };

    const handleApiError = (
        err,
        fallbackMessage
    ) => {
        console.error(err);

        if (err.response?.status === 401) {
            localStorage.clear();

            navigate("/login", {
                replace: true
            });

            return;
        }

        if (err.response?.status === 403) {
            setError(
                "You do not have permission to perform this action."
            );

            return;
        }

        const responseData =
            err.response?.data;

        let message =
            responseData?.message ||
            fallbackMessage;

        if (
            responseData?.errors &&
            typeof responseData.errors ===
                "object"
        ) {
            const firstError =
                Object.values(
                    responseData.errors
                )[0];

            if (firstError) {
                message = firstError;
            }
        }

        setError(message);
    };

    const openCreateForm = () => {
        setEditingLead(null);

        setForm({
            name: "",
            email: "",
            phone: "",
            propertyType: "",
            status: "NEW",
            assignedTo: "",
            notes: "",
            followUpDate: ""
        });

        setError("");
        setSuccess("");

        setShowForm(true);
    };

    const openEditForm = (lead) => {
        setEditingLead(lead);

        setForm({
            name: lead.name || "",
            email: lead.email || "",
            phone: lead.phone || "",
            propertyType:
                lead.propertyType || "",
            status:
                lead.status || "NEW",
            assignedTo:
                lead.assignedTo?.id
                    ? String(
                        lead.assignedTo.id
                    )
                    : "",
            notes: lead.notes || "",
            followUpDate:
                lead.followUpDate || ""
        });

        setError("");
        setSuccess("");

        setShowForm(true);
    };

    const openViewModal = (lead) => {
        setViewingLead(lead);
        setShowView(true);
        setError("");
    };

    const closeForm = () => {
        if (saving) {
            return;
        }

        setShowForm(false);
        setEditingLead(null);
    };

    const closeViewModal = () => {
        setShowView(false);
        setViewingLead(null);
    };

    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (
            form.name.trim().length < 2
        ) {
            setError(
                "Name must contain at least 2 characters."
            );

            return false;
        }

        if (!form.email.trim()) {
            setError(
                "Email is required."
            );

            return false;
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                form.email.trim()
            )
        ) {
            setError(
                "Please enter a valid email address."
            );

            return false;
        }

        if (
            !/^[6-9][0-9]{9}$/.test(
                form.phone.trim()
            )
        ) {
            setError(
                "Phone number must be a valid 10-digit Indian mobile number."
            );

            return false;
        }

        if (!form.propertyType) {
            setError(
                "Please select a property type."
            );

            return false;
        }

        if (
            form.followUpDate &&
            form.followUpDate <
                new Date()
                    .toISOString()
                    .split("T")[0]
        ) {
            setError(
                "Follow-up date cannot be in the past."
            );

            return false;
        }

        if (
            isAdmin &&
            !form.assignedTo
        ) {
            setError(
                "Please assign the lead to a sales employee."
            );

            return false;
        }

        return true;
    };

    const saveLead = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                propertyType:
                    form.propertyType,
                status:
                    form.status || "NEW",
                notes:
                    form.notes.trim(),
                followUpDate:
                    form.followUpDate || null
            };

            /*
             * Admin can assign a sales employee.
             *
             * Sales employee assignment is handled
             * by the backend using the authenticated
             * user.
             */
            if (
                isAdmin &&
                form.assignedTo
            ) {
                payload.assignedTo = {
                    id: Number(
                        form.assignedTo
                    )
                };
            }

            if (editingLead) {
                await api.put(
                    `/leads/${editingLead.id}`,
                    payload
                );

                setSuccess(
                    "Lead updated successfully."
                );
            } else {
                await api.post(
                    "/leads",
                    payload
                );

                setSuccess(
                    "Lead created successfully."
                );
            }

            closeForm();

            await fetchLeads();
        } catch (err) {
            handleApiError(
                err,
                "Unable to save lead."
            );
        } finally {
            setSaving(false);
        }
    };

    const deleteLead = async (lead) => {
        if (!isAdmin) {
            setError(
                "Only administrators can delete leads."
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Delete lead "${lead.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/leads/${lead.id}`
            );

            setSuccess(
                "Lead deleted successfully."
            );

            await fetchLeads();
        } catch (err) {
            handleApiError(
                err,
                "Unable to delete lead."
            );
        }
    };

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("");
        setEmployeeFilter("");
    };

    const formatStatus = (status) => {
        if (!status) {
            return "New";
        }

        return status
            .split("_")
            .map(
                (word) =>
                    word.charAt(0) +
                    word
                        .slice(1)
                        .toLowerCase()
            )
            .join(" ");
    };

    const getStatusClass = (status) => {
        return (
            status || "NEW"
        ).toLowerCase();
    };

    const getInitials = (name) => {
        if (!name) {
            return "U";
        }

        return name
            .trim()
            .split(" ")
            .slice(0, 2)
            .map(
                (part) =>
                    part
                        .charAt(0)
                        .toUpperCase()
            )
            .join("");
    };

    const totalLeads =
        leads.length;

    const activeLeads =
        leads.filter(
            (lead) =>
                lead.status !==
                "LOST"
        ).length;

    const bookedLeads =
        leads.filter(
            (lead) =>
                lead.status ===
                "BOOKED"
        ).length;

    const followUps =
        leads.filter(
            (lead) =>
                lead.followUpDate
        ).length;

    return (
        <Layout>
            <div className="leads-page">

                {/* Header */}
                <div className="leads-header">

                    <div>
                        <h1>
                            Leads
                        </h1>

                        <p>
                            Manage customer leads,
                            follow-ups and sales
                            assignments
                        </p>
                    </div>

                    <div className="leads-header-actions">

                        <button
                            className="leads-refresh-btn"
                            onClick={
                                fetchLeads
                            }
                        >
                            ↻ Refresh
                        </button>

                        <button
                            className="leads-primary-btn"
                            onClick={
                                openCreateForm
                            }
                        >
                            + Add Lead
                        </button>

                    </div>

                </div>

                {/* Role banner */}
                {!isAdmin && (
                    <div className="sales-info-banner">

                        <div className="sales-info-icon">
                            i
                        </div>

                        <div>
                            <strong>
                                Sales Employee View
                            </strong>

                            <p>
                                You can only view
                                and manage leads
                                assigned to you.
                            </p>
                        </div>

                    </div>
                )}

                {/* Alerts */}
                {error && (
                    <div className="leads-alert error">

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

                {success && (
                    <div className="leads-alert success">

                        <span>
                            ✓
                        </span>

                        <p>
                            {success}
                        </p>

                        <button
                            onClick={() =>
                                setSuccess("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {/* Summary */}
                <div className="lead-summary-grid">

                    <LeadSummary
                        icon="👥"
                        label="Total Leads"
                        value={
                            totalLeads
                        }
                    />

                    <LeadSummary
                        icon="⚡"
                        label="Active Leads"
                        value={
                            activeLeads
                        }
                    />

                    <LeadSummary
                        icon="📅"
                        label="Follow-ups"
                        value={
                            followUps
                        }
                    />

                    <LeadSummary
                        icon="✓"
                        label="Booked"
                        value={
                            bookedLeads
                        }
                    />

                </div>

                {/* Filters */}
                <div className="leads-filter-card">

                    <div className="lead-search-box">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            All stages
                        </option>

                        {LEAD_STATUSES.map(
                            (status) => (
                                <option
                                    key={
                                        status
                                    }
                                    value={
                                        status
                                    }
                                >
                                    {
                                        formatStatus(
                                            status
                                        )
                                    }
                                </option>
                            )
                        )}

                    </select>

                    {isAdmin && (
                        <select
                            value={
                                employeeFilter
                            }
                            onChange={(event) =>
                                setEmployeeFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                All employees
                            </option>

                            {salesEmployees.map(
                                (employee) => (
                                    <option
                                        key={
                                            employee.id
                                        }
                                        value={
                                            employee.id
                                        }
                                    >
                                        {
                                            employee.name
                                        }
                                    </option>
                                )
                            )}

                        </select>
                    )}

                    {(search ||
                        statusFilter ||
                        employeeFilter) && (
                        <button
                            className="clear-filter-btn"
                            onClick={
                                clearFilters
                            }
                        >
                            Clear
                        </button>
                    )}

                </div>

                {/* Table */}
                <div className="leads-table-card">

                    <div className="leads-table-header">

                        <div>
                            <h2>
                                Lead List
                            </h2>

                            <p>
                                {loading
                                    ? "Loading leads..."
                                    : `${leads.length} lead${leads.length === 1
                                        ? ""
                                        : "s"} found`}
                            </p>
                        </div>

                    </div>

                    {loading ? (
                        <div className="leads-loading">

                            <div className="leads-spinner"></div>

                            <p>
                                Loading leads...
                            </p>

                        </div>
                    ) : leads.length ===
                        0 ? (
                        <div className="leads-empty">

                            <div className="leads-empty-icon">
                                👥
                            </div>

                            <h3>
                                No leads found
                            </h3>

                            <p>
                                {search ||
                                statusFilter ||
                                employeeFilter
                                    ? "Try changing your search or filters."
                                    : "Create your first lead to start managing your sales pipeline."}
                            </p>

                            {search ||
                            statusFilter ||
                            employeeFilter ? (
                                <button
                                    className="leads-secondary-btn"
                                    onClick={
                                        clearFilters
                                    }
                                >
                                    Clear Filters
                                </button>
                            ) : (
                                <button
                                    className="leads-primary-btn"
                                    onClick={
                                        openCreateForm
                                    }
                                >
                                    + Add Lead
                                </button>
                            )}

                        </div>
                    ) : (
                        <div className="leads-table-wrapper">

                            <table className="leads-table">

                                <thead>
                                    <tr>

                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Contact
                                        </th>

                                        <th>
                                            Property
                                        </th>

                                        <th>
                                            Stage
                                        </th>

                                        {isAdmin && (
                                            <th>
                                                Assigned To
                                            </th>
                                        )}

                                        <th>
                                            Follow-up
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {leads.map(
                                        (lead) => (
                                            <tr
                                                key={
                                                    lead.id
                                                }
                                            >

                                                <td>
                                                    <div className="lead-customer-cell">

                                                        <div className="lead-avatar">
                                                            {getInitials(
                                                                lead.name
                                                            )}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    lead.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                Lead #
                                                                {
                                                                    lead.id
                                                                }
                                                            </span>
                                                        </div>

                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="lead-contact-cell">

                                                        <span>
                                                            {
                                                                lead.email
                                                            }
                                                        </span>

                                                        <span>
                                                            {
                                                                lead.phone
                                                            }
                                                        </span>

                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="lead-property-type">
                                                        {
                                                            lead.propertyType
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`lead-status ${getStatusClass(
                                                            lead.status
                                                        )}`}
                                                    >
                                                        <span></span>

                                                        {
                                                            formatStatus(
                                                                lead.status
                                                            )
                                                        }
                                                    </span>
                                                </td>

                                                {isAdmin && (
                                                    <td>
                                                        {lead.assignedTo ? (
                                                            <div className="lead-assigned-cell">

                                                                <div className="assigned-avatar">
                                                                    {getInitials(
                                                                        lead
                                                                            .assignedTo
                                                                            .name
                                                                    )}
                                                                </div>

                                                                <span>
                                                                    {
                                                                        lead
                                                                            .assignedTo
                                                                            .name
                                                                    }
                                                                </span>

                                                            </div>
                                                        ) : (
                                                            <span className="unassigned">
                                                                Unassigned
                                                            </span>
                                                        )}
                                                    </td>
                                                )}

                                                <td>
                                                    {lead.followUpDate ? (
                                                        <div className="follow-up-date">
                                                            <span>
                                                                📅
                                                            </span>

                                                            {
                                                                lead.followUpDate
                                                            }
                                                        </div>
                                                    ) : (
                                                        <span className="no-follow-up">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="lead-actions">

                                                        <button
                                                            className="lead-action view"
                                                            title="View lead"
                                                            onClick={() =>
                                                                openViewModal(
                                                                    lead
                                                                )
                                                            }
                                                        >
                                                            👁
                                                        </button>

                                                        <button
                                                            className="lead-action edit"
                                                            title="Edit lead"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    lead
                                                                )
                                                            }
                                                        >
                                                            ✎
                                                        </button>

                                                        {isAdmin && (
                                                            <button
                                                                className="lead-action delete"
                                                                title="Delete lead"
                                                                onClick={() =>
                                                                    deleteLead(
                                                                        lead
                                                                    )
                                                                }
                                                            >
                                                                🗑
                                                            </button>
                                                        )}

                                                    </div>
                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

            </div>

            {/* Add / Edit Modal */}
            {showForm && (
                <div
                    className="lead-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeForm();
                        }
                    }}
                >

                    <div className="lead-modal">

                        <div className="lead-modal-header">

                            <div>
                                <h2>
                                    {editingLead
                                        ? "Edit Lead"
                                        : "Add New Lead"}
                                </h2>

                                <p>
                                    {editingLead
                                        ? "Update customer and follow-up information."
                                        : "Enter customer details to create a new lead."}
                                </p>
                            </div>

                            <button
                                className="lead-modal-close"
                                onClick={
                                    closeForm
                                }
                                disabled={
                                    saving
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            className="lead-form"
                            onSubmit={
                                saveLead
                            }
                        >

                            <div className="lead-form-section">

                                <h3>
                                    Customer Information
                                </h3>

                                <div className="lead-form-grid">

                                    <FormField
                                        label="Full Name"
                                        required
                                    >
                                        <input
                                            type="text"
                                            name="name"
                                            value={
                                                form.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. Rahul Kumar"
                                            maxLength={
                                                100
                                            }
                                            required
                                        />
                                    </FormField>

                                    <FormField
                                        label="Email"
                                        required
                                    >
                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                form.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="customer@example.com"
                                            required
                                        />
                                    </FormField>

                                    <FormField
                                        label="Phone"
                                        required
                                    >
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={
                                                form.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="9876543210"
                                            maxLength={
                                                10
                                            }
                                            required
                                        />
                                    </FormField>

                                    <FormField
                                        label="Property Type"
                                        required
                                    >
                                        <select
                                            name="propertyType"
                                            value={
                                                form.propertyType
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        >
                                            <option value="">
                                                Select property type
                                            </option>

                                            <option value="Apartment">
                                                Apartment
                                            </option>

                                            <option value="Villa">
                                                Villa
                                            </option>

                                            <option value="Plot">
                                                Plot
                                            </option>

                                            <option value="Commercial">
                                                Commercial
                                            </option>

                                            <option value="Independent House">
                                                Independent House
                                            </option>
                                        </select>
                                    </FormField>

                                </div>

                            </div>

                            <div className="lead-form-section">

                                <h3>
                                    Sales Information
                                </h3>

                                <div className="lead-form-grid">

                                    <FormField
                                        label="Lead Stage"
                                        required
                                    >
                                        <select
                                            name="status"
                                            value={
                                                form.status
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        >
                                            {LEAD_STATUSES.map(
                                                (
                                                    status
                                                ) => (
                                                    <option
                                                        key={
                                                            status
                                                        }
                                                        value={
                                                            status
                                                        }
                                                    >
                                                        {
                                                            formatStatus(
                                                                status
                                                            )
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </FormField>

                                    {isAdmin && (
                                        <FormField
                                            label="Assign To"
                                            required
                                        >
                                            <select
                                                name="assignedTo"
                                                value={
                                                    form.assignedTo
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select sales employee
                                                </option>

                                                {salesEmployees.map(
                                                    (
                                                        employee
                                                    ) => (
                                                        <option
                                                            key={
                                                                employee.id
                                                            }
                                                            value={
                                                                employee.id
                                                            }
                                                        >
                                                            {
                                                                employee.name
                                                            }
                                                        </option>
                                                    )
                                                )}

                                            </select>
                                        </FormField>
                                    )}

                                    <FormField
                                        label="Follow-up Date"
                                    >
                                        <input
                                            type="date"
                                            name="followUpDate"
                                            value={
                                                form.followUpDate
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split(
                                                        "T"
                                                    )[0]
                                            }
                                        />
                                    </FormField>

                                </div>

                            </div>

                            <div className="lead-form-section">

                                <h3>
                                    Notes
                                </h3>

                                <FormField
                                    label="Notes"
                                >
                                    <textarea
                                        name="notes"
                                        value={
                                            form.notes
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Add useful notes about the customer, requirements or next steps..."
                                        maxLength={
                                            1000
                                        }
                                        rows={4}
                                    />

                                    <small>
                                        {
                                            form.notes
                                                .length
                                        }
                                        /1000
                                    </small>
                                </FormField>

                            </div>

                            {!isAdmin && (
                                <div className="sales-assignment-note">

                                    <span>
                                        ✓
                                    </span>

                                    <p>
                                        This lead will
                                        automatically
                                        be assigned to
                                        your account.
                                    </p>

                                </div>
                            )}

                            <div className="lead-modal-footer">

                                <button
                                    type="button"
                                    className="leads-secondary-btn"
                                    onClick={
                                        closeForm
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="leads-primary-btn"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingLead
                                            ? "Update Lead"
                                            : "Create Lead"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* View Modal */}
            {showView &&
                viewingLead && (
                    <div
                        className="lead-modal-overlay"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeViewModal();
                            }
                        }}
                    >

                        <div className="lead-view-modal">

                            <div className="lead-modal-header">

                                <div className="lead-view-title">

                                    <div className="lead-large-avatar">
                                        {getInitials(
                                            viewingLead.name
                                        )}
                                    </div>

                                    <div>
                                        <h2>
                                            {
                                                viewingLead.name
                                            }
                                        </h2>

                                        <p>
                                            Lead #
                                            {
                                                viewingLead.id
                                            }
                                        </p>
                                    </div>

                                </div>

                                <button
                                    className="lead-modal-close"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            <div className="lead-view-body">

                                <div className="lead-view-status-row">

                                    <span
                                        className={`lead-status ${getStatusClass(
                                            viewingLead.status
                                        )}`}
                                    >
                                        <span></span>

                                        {
                                            formatStatus(
                                                viewingLead.status
                                            )
                                        }
                                    </span>

                                    {viewingLead.assignedTo && (
                                        <span className="lead-view-assigned">
                                            Assigned to{" "}
                                            <strong>
                                                {
                                                    viewingLead
                                                        .assignedTo
                                                        .name
                                                }
                                            </strong>
                                        </span>
                                    )}

                                </div>

                                <div className="lead-detail-grid">

                                    <LeadDetail
                                        label="Email"
                                        value={
                                            viewingLead.email
                                        }
                                    />

                                    <LeadDetail
                                        label="Phone"
                                        value={
                                            viewingLead.phone
                                        }
                                    />

                                    <LeadDetail
                                        label="Property Type"
                                        value={
                                            viewingLead.propertyType
                                        }
                                    />

                                    <LeadDetail
                                        label="Follow-up Date"
                                        value={
                                            viewingLead.followUpDate ||
                                            "Not scheduled"
                                        }
                                    />

                                </div>

                                <div className="lead-notes-box">

                                    <h3>
                                        Notes
                                    </h3>

                                    <p>
                                        {
                                            viewingLead.notes ||
                                            "No notes added for this lead."
                                        }
                                    </p>

                                </div>

                            </div>

                            <div className="lead-modal-footer">

                                <button
                                    className="leads-secondary-btn"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    Close
                                </button>

                                <button
                                    className="leads-primary-btn"
                                    onClick={() => {
                                        closeViewModal();
                                        openEditForm(
                                            viewingLead
                                        );
                                    }}
                                >
                                    ✎ Edit Lead
                                </button>

                            </div>

                        </div>

                    </div>
                )}

        </Layout>
    );
}

function LeadSummary({
    icon,
    label,
    value
}) {
    return (
        <div className="lead-summary-card">

            <div className="lead-summary-icon">
                {icon}
            </div>

            <div>
                <span>
                    {label}
                </span>

                <strong>
                    {value}
                </strong>
            </div>

        </div>
    );
}

function FormField({
    label,
    required,
    children
}) {
    return (
        <div className="lead-form-field">

            <label>
                {label}

                {required && (
                    <span>
                        *
                    </span>
                )}
            </label>

            {children}

        </div>
    );
}

function LeadDetail({
    label,
    value
}) {
    return (
        <div className="lead-detail-item">

            <span>
                {label}
            </span>

            <strong>
                {value || "—"}
            </strong>

        </div>
    );
}

export default Lead;