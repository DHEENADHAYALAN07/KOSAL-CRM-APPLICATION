import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import Layout from "../components/Layout";

import "../styles/Properties.css";

function Properties() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [units, setUnits] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [selectedProject, setSelectedProject] =
        useState("");

    const [showProjectModal, setShowProjectModal] =
        useState(false);
    const [showBuildingModal, setShowBuildingModal] =
        useState(false);
    const [showUnitModal, setShowUnitModal] =
        useState(false);

    const [editingProject, setEditingProject] =
        useState(null);
    const [editingBuilding, setEditingBuilding] =
        useState(null);
    const [editingUnit, setEditingUnit] =
        useState(null);

    const [projectForm, setProjectForm] = useState({
        name: "",
        location: ""
    });

    const [buildingForm, setBuildingForm] = useState({
        name: "",
        projectId: ""
    });

    const [unitForm, setUnitForm] = useState({
        unitNumber: "",
        unitType: "",
        price: "",
        buildingId: ""
    });

    const [expandedProjects, setExpandedProjects] =
        useState({});

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                projectsResponse,
                buildingsResponse,
                unitsResponse
            ] = await Promise.all([
                api.get("/projects"),
                api.get("/buildings"),
                api.get("/units")
            ]);

            setProjects(
                projectsResponse.data || []
            );

            setBuildings(
                buildingsResponse.data || []
            );

            setUnits(
                unitsResponse.data || []
            );
        } catch (err) {
            handleApiError(
                err,
                "Unable to load properties."
            );
        } finally {
            setLoading(false);
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

        const message =
            err.response?.data?.message ||
            fallbackMessage;

        setError(message);
    };

    const clearMessages = () => {
        setError("");
        setSuccess("");
    };

    const projectBuildings = (projectId) => {
        return buildings.filter(
            (building) =>
                Number(
                    building.project?.id
                ) === Number(projectId)
        );
    };

    const buildingUnits = (buildingId) => {
        return units.filter(
            (unit) =>
                Number(
                    unit.building?.id
                ) === Number(buildingId)
        );
    };

    const availableUnits = units.filter(
        (unit) =>
            unit.status === "AVAILABLE"
    );

    const bookedUnits = units.filter(
        (unit) =>
            unit.status === "BOOKED"
    );

    const filteredProjects = useMemo(() => {
        const value =
            search.trim().toLowerCase();

        if (!value) {
            return projects;
        }

        return projects.filter(
            (project) => {

                const projectMatch =
                    project.name
                        ?.toLowerCase()
                        .includes(value) ||
                    project.location
                        ?.toLowerCase()
                        .includes(value);

                const buildingMatch =
                    projectBuildings(
                        project.id
                    ).some(
                        (building) =>
                            building.name
                                ?.toLowerCase()
                                .includes(value)
                    );

                const unitMatch =
                    projectBuildings(
                        project.id
                    ).some(
                        (building) =>
                            buildingUnits(
                                building.id
                            ).some(
                                (unit) =>
                                    unit.unitNumber
                                        ?.toLowerCase()
                                        .includes(value) ||
                                    unit.unitType
                                        ?.toLowerCase()
                                        .includes(value)
                            )
                    );

                return (
                    projectMatch ||
                    buildingMatch ||
                    unitMatch
                );
            }
        );
    }, [
        projects,
        buildings,
        units,
        search
    ]);

    const openCreateProject = () => {
        clearMessages();

        setEditingProject(null);

        setProjectForm({
            name: "",
            location: ""
        });

        setShowProjectModal(true);
    };

    const openEditProject = (project) => {
        clearMessages();

        setEditingProject(project);

        setProjectForm({
            name: project.name || "",
            location:
                project.location || ""
        });

        setShowProjectModal(true);
    };

    const openCreateBuilding = (
        projectId
    ) => {
        clearMessages();

        setEditingBuilding(null);

        setBuildingForm({
            name: "",
            projectId: String(
                projectId
            )
        });

        setShowBuildingModal(true);
    };

    const openEditBuilding = (
        building
    ) => {
        clearMessages();

        setEditingBuilding(building);

        setBuildingForm({
            name: building.name || "",
            projectId:
                building.project?.id
                    ? String(
                        building.project.id
                    )
                    : ""
        });

        setShowBuildingModal(true);
    };

    const openCreateUnit = (
        buildingId
    ) => {
        clearMessages();

        setEditingUnit(null);

        setUnitForm({
            unitNumber: "",
            unitType: "",
            price: "",
            buildingId: String(
                buildingId
            )
        });

        setShowUnitModal(true);
    };

    const openEditUnit = (unit) => {
        clearMessages();

        setEditingUnit(unit);

        setUnitForm({
            unitNumber:
                unit.unitNumber || "",
            unitType:
                unit.unitType || "",
            price:
                unit.price || "",
            buildingId:
                unit.building?.id
                    ? String(
                        unit.building.id
                    )
                    : ""
        });

        setShowUnitModal(true);
    };

    const saveProject = async (
        event
    ) => {
        event.preventDefault();

        if (
            !projectForm.name.trim() ||
            !projectForm.location.trim()
        ) {
            setError(
                "Project name and location are required."
            );

            return;
        }

        try {
            setSaving(true);
            clearMessages();

            const payload = {
                name:
                    projectForm.name.trim(),
                location:
                    projectForm.location.trim()
            };

            if (editingProject) {
                await api.put(
                    `/projects/${editingProject.id}`,
                    payload
                );

                setSuccess(
                    "Project updated successfully."
                );
            } else {
                await api.post(
                    "/projects",
                    payload
                );

                setSuccess(
                    "Project created successfully."
                );
            }

            setShowProjectModal(false);
            await fetchAll();
        } catch (err) {
            handleApiError(
                err,
                "Unable to save project."
            );
        } finally {
            setSaving(false);
        }
    };

    const deleteProject = async (
        project
    ) => {
        const projectBuildingCount =
            projectBuildings(
                project.id
            ).length;

        if (projectBuildingCount > 0) {
            setError(
                "Cannot delete a project that contains buildings. Delete its buildings first."
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Delete project "${project.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            clearMessages();

            await api.delete(
                `/projects/${project.id}`
            );

            setSuccess(
                "Project deleted successfully."
            );

            await fetchAll();
        } catch (err) {
            handleApiError(
                err,
                "Unable to delete project."
            );
        }
    };

    const saveBuilding = async (
        event
    ) => {
        event.preventDefault();

        if (
            !buildingForm.name.trim()
        ) {
            setError(
                "Building name is required."
            );

            return;
        }

        if (!buildingForm.projectId) {
            setError(
                "Please select a project."
            );

            return;
        }

        try {
            setSaving(true);
            clearMessages();

            const payload = {
                name:
                    buildingForm.name.trim()
            };

            if (editingBuilding) {
                await api.put(
                    `/buildings/${editingBuilding.id}/project/${buildingForm.projectId}`,
                    payload
                );

                setSuccess(
                    "Building updated successfully."
                );
            } else {
                await api.post(
                    `/buildings/project/${buildingForm.projectId}`,
                    payload
                );

                setSuccess(
                    "Building created successfully."
                );
            }

            setShowBuildingModal(false);
            await fetchAll();
        } catch (err) {
            handleApiError(
                err,
                "Unable to save building."
            );
        } finally {
            setSaving(false);
        }
    };

    const deleteBuilding = async (
        building
    ) => {
        const buildingUnitCount =
            buildingUnits(
                building.id
            ).length;

        if (buildingUnitCount > 0) {
            setError(
                "Cannot delete a building that contains units. Delete its units first."
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Delete building "${building.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            clearMessages();

            await api.delete(
                `/buildings/${building.id}`
            );

            setSuccess(
                "Building deleted successfully."
            );

            await fetchAll();
        } catch (err) {
            handleApiError(
                err,
                "Unable to delete building."
            );
        }
    };

    const saveUnit = async (
        event
    ) => {
        event.preventDefault();

        if (
            !unitForm.unitNumber.trim()
        ) {
            setError(
                "Unit number is required."
            );

            return;
        }

        if (!unitForm.unitType) {
            setError(
                "Unit type is required."
            );

            return;
        }

        if (
            !unitForm.price ||
            Number(unitForm.price) <= 0
        ) {
            setError(
                "Unit price must be greater than zero."
            );

            return;
        }

        if (!unitForm.buildingId) {
            setError(
                "Please select a building."
            );

            return;
        }

        try {
            setSaving(true);
            clearMessages();

            const payload = {
                unitNumber:
                    unitForm.unitNumber.trim(),
                unitType:
                    unitForm.unitType,
                price:
                    Number(
                        unitForm.price
                    )
            };

            if (editingUnit) {
                await api.put(
                    `/units/${editingUnit.id}`,
                    payload
                );

                setSuccess(
                    "Unit updated successfully."
                );
            } else {
                await api.post(
                    `/units/building/${unitForm.buildingId}`,
                    payload
                );

                setSuccess(
                    "Unit created successfully."
                );
            }

            setShowUnitModal(false);
            await fetchAll();
        } catch (err) {
            handleApiError(
                err,
                "Unable to save unit."
            );
        } finally {
            setSaving(false);
        }
    };

    const deleteUnit = async (unit) => {
        if (unit.status === "BOOKED") {
            setError(
                "Booked units cannot be deleted."
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Delete unit "${unit.unitNumber}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            clearMessages();

            await api.delete(
                `/units/${unit.id}`
            );

            setSuccess(
                "Unit deleted successfully."
            );

            await fetchAll();
        } catch (err) {
            handleApiError(
                err,
                "Unable to delete unit."
            );
        }
    };

    const toggleProject = (
        projectId
    ) => {
        setExpandedProjects(
            (previous) => ({
                ...previous,
                [projectId]:
                    !previous[
                        projectId
                    ]
            })
        );
    };

    const expandAll = () => {
        const state = {};

        projects.forEach(
            (project) => {
                state[project.id] =
                    true;
            }
        );

        setExpandedProjects(state);
    };

    const collapseAll = () => {
        setExpandedProjects({});
    };

    const formatPrice = (price) => {
        const value =
            Number(price || 0);

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(value);
    };

    const totalProjects =
        projects.length;

    const totalBuildings =
        buildings.length;

    const totalUnits =
        units.length;

    return (
        <Layout>

            <div className="properties-page">

                <div className="properties-header">

                    <div>
                        <h1>
                            Properties
                        </h1>

                        <p>
                            Manage projects,
                            buildings and
                            property units
                        </p>
                    </div>

                    <div className="properties-header-actions">

                        <button
                            className="properties-refresh-btn"
                            onClick={
                                fetchAll
                            }
                        >
                            ↻ Refresh
                        </button>

                        <button
                            className="properties-primary-btn"
                            onClick={
                                openCreateProject
                            }
                        >
                            + Add Project
                        </button>

                    </div>

                </div>

                {error && (
                    <div className="properties-alert error">

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
                    <div className="properties-alert success">

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

                <div className="properties-summary-grid">

                    <PropertySummary
                        icon="🏢"
                        label="Projects"
                        value={
                            totalProjects
                        }
                    />

                    <PropertySummary
                        icon="🏗"
                        label="Buildings"
                        value={
                            totalBuildings
                        }
                    />

                    <PropertySummary
                        icon="🏠"
                        label="Total Units"
                        value={
                            totalUnits
                        }
                    />

                    <PropertySummary
                        icon="✓"
                        label="Available Units"
                        value={
                            availableUnits.length
                        }
                    />

                </div>

                <div className="properties-filter-card">

                    <div className="properties-search">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search projects, buildings or units..."
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
                            selectedProject
                        }
                        onChange={(event) =>
                            setSelectedProject(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            All projects
                        </option>

                        {projects.map(
                            (project) => (
                                <option
                                    key={
                                        project.id
                                    }
                                    value={
                                        project.id
                                    }
                                >
                                    {
                                        project.name
                                    }
                                </option>
                            )
                        )}

                    </select>

                    <button
                        className="properties-outline-btn"
                        onClick={
                            expandAll
                        }
                    >
                        Expand All
                    </button>

                    <button
                        className="properties-outline-btn"
                        onClick={
                            collapseAll
                        }
                    >
                        Collapse All
                    </button>

                </div>

                <div className="properties-card">

                    <div className="properties-card-header">

                        <div>
                            <h2>
                                Property Hierarchy
                            </h2>

                            <p>
                                Project → Building → Unit
                            </p>
                        </div>

                        <span className="properties-count">
                            {filteredProjects.length} project
                            {filteredProjects.length ===
                            1
                                ? ""
                                : "s"}
                        </span>

                    </div>

                    {loading ? (
                        <div className="properties-loading">

                            <div className="properties-spinner"></div>

                            <p>
                                Loading properties...
                            </p>

                        </div>
                    ) : filteredProjects.length ===
                      0 ? (
                        <div className="properties-empty">

                            <div>
                                🏢
                            </div>

                            <h3>
                                No properties found
                            </h3>

                            <p>
                                {search ||
                                selectedProject
                                    ? "Try changing your search or project filter."
                                    : "Create your first project to begin managing properties."}
                            </p>

                            {!search &&
                                !selectedProject && (
                                    <button
                                        className="properties-primary-btn"
                                        onClick={
                                            openCreateProject
                                        }
                                    >
                                        + Add Project
                                    </button>
                                )}

                        </div>
                    ) : (
                        <div className="property-tree">

                            {filteredProjects
                                .filter(
                                    (project) =>
                                        !selectedProject ||
                                        Number(
                                            selectedProject
                                        ) ===
                                            Number(
                                                project.id
                                            )
                                )
                                .map(
                                    (project) => {

                                        const projectBuildingList =
                                            projectBuildings(
                                                project.id
                                            );

                                        const expanded =
                                            expandedProjects[
                                                project.id
                                            ];

                                        return (
                                            <div
                                                className="project-block"
                                                key={
                                                    project.id
                                                }
                                            >

                                                <div className="project-row">

                                                    <button
                                                        className="tree-toggle"
                                                        onClick={() =>
                                                            toggleProject(
                                                                project.id
                                                            )
                                                        }
                                                    >
                                                        {expanded
                                                            ? "⌄"
                                                            : "›"}
                                                    </button>

                                                    <div className="project-icon">
                                                        🏢
                                                    </div>

                                                    <div className="project-info">

                                                        <strong>
                                                            {
                                                                project.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            📍{" "}
                                                            {
                                                                project.location
                                                            }
                                                        </span>

                                                    </div>

                                                    <span className="tree-count">
                                                        {
                                                            projectBuildingList.length
                                                        }{" "}
                                                        building
                                                        {
                                                            projectBuildingList.length ===
                                                            1
                                                                ? ""
                                                                : "s"
                                                        }
                                                    </span>

                                                    <div className="tree-actions">

                                                        <button
                                                            onClick={() =>
                                                                openCreateBuilding(
                                                                    project.id
                                                                )
                                                            }
                                                            title="Add building"
                                                        >
                                                            + Building
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                openEditProject(
                                                                    project
                                                                )
                                                            }
                                                            title="Edit project"
                                                        >
                                                            ✎
                                                        </button>

                                                        <button
                                                            className="danger"
                                                            onClick={() =>
                                                                deleteProject(
                                                                    project
                                                                )
                                                            }
                                                            title="Delete project"
                                                        >
                                                            🗑
                                                        </button>

                                                    </div>

                                                </div>

                                                {expanded && (
                                                    <div className="building-list">

                                                        {projectBuildingList.length ===
                                                        0 ? (
                                                            <div className="tree-empty">
                                                                No buildings in this project.
                                                            </div>
                                                        ) : (
                                                            projectBuildingList.map(
                                                                (
                                                                    building
                                                                ) => {

                                                                    const unitList =
                                                                        buildingUnits(
                                                                            building.id
                                                                        );

                                                                    return (
                                                                        <div
                                                                            className="building-block"
                                                                            key={
                                                                                building.id
                                                                            }
                                                                        >

                                                                            <div className="building-row">

                                                                                <div className="building-line"></div>

                                                                                <div className="building-icon">
                                                                                    🏗
                                                                                </div>

                                                                                <div className="building-info">

                                                                                    <strong>
                                                                                        {
                                                                                            building.name
                                                                                        }
                                                                                    </strong>

                                                                                    <span>
                                                                                        {
                                                                                            unitList.length
                                                                                        }{" "}
                                                                                        unit
                                                                                        {
                                                                                            unitList.length ===
                                                                                            1
                                                                                                ? ""
                                                                                                : "s"
                                                                                        }
                                                                                    </span>

                                                                                </div>

                                                                                <div className="building-unit-status">

                                                                                    <span className="available-mini">
                                                                                        {
                                                                                            unitList.filter(
                                                                                                (
                                                                                                    unit
                                                                                                ) =>
                                                                                                    unit.status ===
                                                                                                    "AVAILABLE"
                                                                                            ).length
                                                                                        }{" "}
                                                                                        available
                                                                                    </span>

                                                                                    <span className="booked-mini">
                                                                                        {
                                                                                            unitList.filter(
                                                                                                (
                                                                                                    unit
                                                                                                ) =>
                                                                                                    unit.status ===
                                                                                                    "BOOKED"
                                                                                            ).length
                                                                                        }{" "}
                                                                                        booked
                                                                                    </span>

                                                                                </div>

                                                                                <div className="tree-actions">

                                                                                    <button
                                                                                        onClick={() =>
                                                                                            openCreateUnit(
                                                                                                building.id
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        + Unit
                                                                                    </button>

                                                                                    <button
                                                                                        onClick={() =>
                                                                                            openEditBuilding(
                                                                                                building
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        ✎
                                                                                    </button>

                                                                                    <button
                                                                                        className="danger"
                                                                                        onClick={() =>
                                                                                            deleteBuilding(
                                                                                                building
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        🗑
                                                                                    </button>

                                                                                </div>

                                                                            </div>

                                                                            <div className="unit-list">

                                                                                {unitList.length ===
                                                                                0 ? (
                                                                                    <div className="unit-empty">
                                                                                        No units added yet.
                                                                                    </div>
                                                                                ) : (
                                                                                    unitList.map(
                                                                                        (
                                                                                            unit
                                                                                        ) => (
                                                                                            <div
                                                                                                className="unit-row"
                                                                                                key={
                                                                                                    unit.id
                                                                                                }
                                                                                            >

                                                                                                <div className="unit-connector"></div>

                                                                                                <div className="unit-main">

                                                                                                    <div className="unit-number">
                                                                                                        {
                                                                                                            unit.unitNumber
                                                                                                        }
                                                                                                    </div>

                                                                                                    <div className="unit-details">

                                                                                                        <strong>
                                                                                                            {
                                                                                                                unit.unitType
                                                                                                            }
                                                                                                        </strong>

                                                                                                        <span>
                                                                                                            {
                                                                                                                formatPrice(
                                                                                                                    unit.price
                                                                                                                )
                                                                                                            }
                                                                                                        </span>

                                                                                                    </div>

                                                                                                </div>

                                                                                                <span
                                                                                                    className={`unit-status ${
                                                                                                        unit.status ===
                                                                                                        "BOOKED"
                                                                                                            ? "booked"
                                                                                                            : "available"
                                                                                                    }`}
                                                                                                >
                                                                                                    <span></span>

                                                                                                    {
                                                                                                        unit.status
                                                                                                    }
                                                                                                </span>

                                                                                                <div className="tree-actions">

                                                                                                    <button
                                                                                                        onClick={() =>
                                                                                                            openEditUnit(
                                                                                                                unit
                                                                                                            )
                                                                                                        }
                                                                                                    >
                                                                                                        ✎
                                                                                                    </button>

                                                                                                    <button
                                                                                                        className="danger"
                                                                                                        disabled={
                                                                                                            unit.status ===
                                                                                                            "BOOKED"
                                                                                                        }
                                                                                                        title={
                                                                                                            unit.status ===
                                                                                                            "BOOKED"
                                                                                                                ? "Booked units cannot be deleted"
                                                                                                                : "Delete unit"
                                                                                                        }
                                                                                                        onClick={() =>
                                                                                                            deleteUnit(
                                                                                                                unit
                                                                                                            )
                                                                                                        }
                                                                                                    >
                                                                                                        🗑
                                                                                                    </button>

                                                                                                </div>

                                                                                            </div>
                                                                                        )
                                                                                    )
                                                                                )}

                                                                            </div>

                                                                        </div>
                                                                    );
                                                                }
                                                            )
                                                        )}

                                                    </div>
                                                )}

                                            </div>
                                        );
                                    }
                                )}

                        </div>
                    )}

                </div>

                <div className="properties-footer-note">

                    <span>
                        ✓
                    </span>

                    <p>
                        Unit availability is controlled by
                        the booking workflow. Booked units
                        cannot be manually marked as available
                        or deleted.
                    </p>

                </div>

            </div>

            {/* PROJECT MODAL */}

            {showProjectModal && (
                <div
                    className="property-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget &&
                            !saving
                        ) {
                            setShowProjectModal(
                                false
                            );
                        }
                    }}
                >

                    <div className="property-modal">

                        <div className="property-modal-header">

                            <div>
                                <h2>
                                    {editingProject
                                        ? "Edit Project"
                                        : "Add Project"}
                                </h2>

                                <p>
                                    Add the basic project information.
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowProjectModal(
                                        false
                                    )
                                }
                                disabled={
                                    saving
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                saveProject
                            }
                            className="property-form"
                        >

                            <FormField
                                label="Project Name"
                                required
                            >
                                <input
                                    value={
                                        projectForm.name
                                    }
                                    onChange={(event) =>
                                        setProjectForm(
                                            {
                                                ...projectForm,
                                                name: event
                                                    .target
                                                    .value
                                            }
                                        )
                                    }
                                    placeholder="e.g. Green Valley Residency"
                                    required
                                />
                            </FormField>

                            <FormField
                                label="Location"
                                required
                            >
                                <input
                                    value={
                                        projectForm.location
                                    }
                                    onChange={(event) =>
                                        setProjectForm(
                                            {
                                                ...projectForm,
                                                location:
                                                    event
                                                        .target
                                                        .value
                                            }
                                        )
                                    }
                                    placeholder="e.g. OMR, Chennai"
                                    required
                                />
                            </FormField>

                            <ModalFooter
                                saving={
                                    saving
                                }
                                onCancel={() =>
                                    setShowProjectModal(
                                        false
                                    )
                                }
                                submitText={
                                    editingProject
                                        ? "Update Project"
                                        : "Create Project"
                                }
                            />

                        </form>

                    </div>

                </div>
            )}

            {/* BUILDING MODAL */}

            {showBuildingModal && (
                <div
                    className="property-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget &&
                            !saving
                        ) {
                            setShowBuildingModal(
                                false
                            );
                        }
                    }}
                >

                    <div className="property-modal">

                        <div className="property-modal-header">

                            <div>
                                <h2>
                                    {editingBuilding
                                        ? "Edit Building"
                                        : "Add Building"}
                                </h2>

                                <p>
                                    Add a building under a project.
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowBuildingModal(
                                        false
                                    )
                                }
                                disabled={
                                    saving
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                saveBuilding
                            }
                            className="property-form"
                        >

                            <FormField
                                label="Building Name"
                                required
                            >
                                <input
                                    value={
                                        buildingForm.name
                                    }
                                    onChange={(event) =>
                                        setBuildingForm(
                                            {
                                                ...buildingForm,
                                                name: event
                                                    .target
                                                    .value
                                            }
                                        )
                                    }
                                    placeholder="e.g. Tower A"
                                    required
                                />
                            </FormField>

                            <FormField
                                label="Project"
                                required
                            >
                                <select
                                    value={
                                        buildingForm.projectId
                                    }
                                    onChange={(event) =>
                                        setBuildingForm(
                                            {
                                                ...buildingForm,
                                                projectId:
                                                    event
                                                        .target
                                                        .value
                                            }
                                        )
                                    }
                                    required
                                >
                                    <option value="">
                                        Select project
                                    </option>

                                    {projects.map(
                                        (
                                            project
                                        ) => (
                                            <option
                                                key={
                                                    project.id
                                                }
                                                value={
                                                    project.id
                                                }
                                            >
                                                {
                                                    project.name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>
                            </FormField>

                            <ModalFooter
                                saving={
                                    saving
                                }
                                onCancel={() =>
                                    setShowBuildingModal(
                                        false
                                    )
                                }
                                submitText={
                                    editingBuilding
                                        ? "Update Building"
                                        : "Create Building"
                                }
                            />

                        </form>

                    </div>

                </div>
            )}

            {/* UNIT MODAL */}

            {showUnitModal && (
                <div
                    className="property-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget &&
                            !saving
                        ) {
                            setShowUnitModal(
                                false
                            );
                        }
                    }}
                >

                    <div className="property-modal">

                        <div className="property-modal-header">

                            <div>
                                <h2>
                                    {editingUnit
                                        ? "Edit Unit"
                                        : "Add Unit"}
                                </h2>

                                <p>
                                    Manage unit details and pricing.
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowUnitModal(
                                        false
                                    )
                                }
                                disabled={
                                    saving
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                saveUnit
                            }
                            className="property-form"
                        >

                            <div className="property-form-grid">

                                <FormField
                                    label="Unit Number"
                                    required
                                >
                                    <input
                                        value={
                                            unitForm.unitNumber
                                        }
                                        onChange={(event) =>
                                            setUnitForm(
                                                {
                                                    ...unitForm,
                                                    unitNumber:
                                                        event
                                                            .target
                                                            .value
                                                }
                                            )
                                        }
                                        placeholder="e.g. 101"
                                        required
                                    />
                                </FormField>

                                <FormField
                                    label="Unit Type"
                                    required
                                >
                                    <select
                                        value={
                                            unitForm.unitType
                                        }
                                        onChange={(event) =>
                                            setUnitForm(
                                                {
                                                    ...unitForm,
                                                    unitType:
                                                        event
                                                            .target
                                                            .value
                                                }
                                            )
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select type
                                        </option>

                                        <option value="1BHK">
                                            1 BHK
                                        </option>

                                        <option value="2BHK">
                                            2 BHK
                                        </option>

                                        <option value="3BHK">
                                            3 BHK
                                        </option>

                                        <option value="4BHK">
                                            4 BHK
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
                                    </select>
                                </FormField>

                            </div>

                            <FormField
                                label="Price"
                                required
                            >
                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        unitForm.price
                                    }
                                    onChange={(event) =>
                                        setUnitForm(
                                            {
                                                ...unitForm,
                                                price: event
                                                    .target
                                                    .value
                                            }
                                        )
                                    }
                                    placeholder="e.g. 7500000"
                                    required
                                />
                            </FormField>

                            <FormField
                                label="Building"
                                required
                            >
                                <select
                                    value={
                                        unitForm.buildingId
                                    }
                                    onChange={(event) =>
                                        setUnitForm(
                                            {
                                                ...unitForm,
                                                buildingId:
                                                    event
                                                        .target
                                                        .value
                                            }
                                        )
                                    }
                                    disabled={
                                        Boolean(
                                            editingUnit
                                        )
                                    }
                                    required
                                >
                                    <option value="">
                                        Select building
                                    </option>

                                    {buildings.map(
                                        (
                                            building
                                        ) => (
                                            <option
                                                key={
                                                    building.id
                                                }
                                                value={
                                                    building.id
                                                }
                                            >
                                                {
                                                    building.name
                                                }{" "}
                                                —{" "}
                                                {
                                                    building
                                                        .project
                                                        ?.name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>
                            </FormField>

                            {editingUnit && (
                                <div className="unit-readonly-note">

                                    <span>
                                        ✓
                                    </span>

                                    <p>
                                        Current status:{" "}
                                        <strong>
                                            {
                                                editingUnit.status
                                            }
                                        </strong>
                                        . Unit availability
                                        is controlled by
                                        the booking workflow.
                                    </p>

                                </div>
                            )}

                            <ModalFooter
                                saving={
                                    saving
                                }
                                onCancel={() =>
                                    setShowUnitModal(
                                        false
                                    )
                                }
                                submitText={
                                    editingUnit
                                        ? "Update Unit"
                                        : "Create Unit"
                                }
                            />

                        </form>

                    </div>

                </div>
            )}

        </Layout>
    );
}

function PropertySummary({
    icon,
    label,
    value
}) {
    return (
        <div className="property-summary-card">

            <div className="property-summary-icon">
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
        <div className="property-form-field">

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

function ModalFooter({
    saving,
    onCancel,
    submitText
}) {
    return (
        <div className="property-modal-footer">

            <button
                type="button"
                className="properties-secondary-btn"
                onClick={
                    onCancel
                }
                disabled={
                    saving
                }
            >
                Cancel
            </button>

            <button
                type="submit"
                className="properties-primary-btn"
                disabled={
                    saving
                }
            >
                {saving
                    ? "Saving..."
                    : submitText}
            </button>

        </div>
    );
}

export default Properties;