import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import "./index.css";
import Login from "./Routes/Login";
import ForgotPassword from "./Routes/ForgotPassword";
import ChangePassword from "./Routes/ChangePassword";
import Dashboard from "./Routes/Dashboard";
import AddRecords from "./Routes/AddRecords";
import Request from "./Routes/Request";
import History from "./Routes/History";
import CommitteeManage from "./Routes/CommitteeManage";
import ManageAccount from "./Routes/ManageAccount";
import Settings from "./Routes/Settings";
import Sidebar from "./Components/Sidebar";
import ProtectedRoute from "./Components/ProtectedRoute";
import ErrorBoundary from "./Components/ErrorBoundary";
import { SidebarProvider } from "./Components/SidebarContext";
import { useContext } from "react";
import { SidebarContext } from "./Components/SidebarContext";

const Layout = () => {
    const { open } = useContext(SidebarContext);
    const sidebarWidth = open ? "300px" : "85px";

    return (
        <ErrorBoundary>
            <div className="flex min-h-screen">
                <Sidebar />
                <div
                    className="flex-grow bg-gray-50 transition-all duration-300 ease-in-out"
                    style={{ marginLeft: sidebarWidth }}
                >
                    <Outlet />
                </div>
            </div>
        </ErrorBoundary>
    );
};

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <SidebarProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/add-records" element={<AddRecords />} />
                            <Route path="/request" element={<Request />} />
                            <Route path="/history" element={<History />} />
                            <Route path="/committee-management" element={<CommitteeManage />} />
                            <Route path="/manage-account" element={<ManageAccount />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>
                    </Route>
                    <Route path="*" element={<div>404 - Page Not Found</div>} />
                </Routes>
            </Router>
        </SidebarProvider>
    </StrictMode>
);