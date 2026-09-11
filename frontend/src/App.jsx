import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Lead from "./pages/Lead";
import Properties from "./pages/Properties";
import Booking from "./pages/Booking";

function ProtectedRoute({ children }) {

    const token =
        localStorage.getItem("token");

    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
}

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ==========================================
                    DEFAULT
                ========================================== */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />


                {/* ==========================================
                    LOGIN
                ========================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* ==========================================
                    DASHBOARD
                ========================================== */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    LEADS
                ========================================== */}

                <Route
                    path="/leads"
                    element={
                        <ProtectedRoute>
                            <Lead />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    PROPERTIES
                ========================================== */}

                <Route
                    path="/properties"
                    element={
                        <ProtectedRoute>
                            <Properties />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    BOOKINGS
                ========================================== */}

                <Route
                    path="/bookings"
                    element={
                        <ProtectedRoute>
                            <Booking />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    UNKNOWN ROUTE
                ========================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;