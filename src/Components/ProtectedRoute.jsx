import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

const ProtectedRoute = () => {
    const token = localStorage.getItem("token");
    console.log("ProtectedRoute: Token exists?", !!token);

    useEffect(() => {
        const handlePopState = () => {
            console.log("Popstate triggered, token:", !!token);
            if (!token) {
                window.location.replace("/login");
            }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [token]);

    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;