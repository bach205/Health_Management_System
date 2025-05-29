import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { Authentication } from "./Authentication";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import StaffLayoutPage from "./pages/StaffLayoutPage";
import UsersPage from "./pages/Admin/Users";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFound from "./pages/NotFound";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Client */}
                <Route path="/" element={<MainLayout><Home /></MainLayout>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Staff */}
                <Route path="/admin" element={<StaffLayoutPage />}>
                    <Route index element={<h1>Home</h1>} />
                    <Route path="users" element={<UsersPage />} />
                </Route>

                <Route path="/staff" element={<StaffLayoutPage />}>
                    <Route path="dashboard"
                        element={
                            <Authentication allowedRoles={["admin", "staff", "doctor"]}>
                                <DashboardLayout>
                                    <Dashboard />
                                </DashboardLayout>
                            </Authentication>
                        }
                    />
                </Route>

                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path='*' element={<NotFound />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;