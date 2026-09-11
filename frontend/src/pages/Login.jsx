import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";


function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    // =========================================================
    // LOGIN
    // =========================================================

    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await api.post(
                "/auth/login",
                {
                    email: email,
                    password: password
                }
            );

            const data = response.data;


            // -------------------------------------------------
            // Store JWT
            // -------------------------------------------------

            localStorage.setItem(
                "token",
                data.token
            );


            // -------------------------------------------------
            // Store user information
            // -------------------------------------------------

            localStorage.setItem(
                "email",
                data.email
            );

            localStorage.setItem(
                "role",
                data.role
            );


            // -------------------------------------------------
            // Navigate to dashboard
            // -------------------------------------------------

            navigate("/dashboard");

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            if (error.response) {

                setError(
                    error.response.data?.message ||
                    "Invalid email or password"
                );

            } else {

                setError(
                    "Unable to connect to the server"
                );
            }

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="login-page">

            <div className="login-card">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="login-header">

                    <div className="logo">
                        🏠
                    </div>

                    <h1>
                        Real Estate CRM
                    </h1>

                    <p>
                        Manage your leads, properties and bookings
                    </p>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="error-message">
                        {error}
                    </div>

                )}


                {/* =================================================
                    LOGIN FORM
                ================================================= */}

                <form onSubmit={handleLogin}>


                    {/* EMAIL */}

                    <div className="form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />

                    </div>


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing in..."
                            : "Sign In"
                        }

                    </button>

                </form>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="login-footer">

                    Admin & Sales Employee Portal

                </div>

            </div>

        </div>
    );
}


export default Login;