import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import { Authentication } from "@/Authentication";
import MainLayout from "@/layouts/MainLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Fragment } from "react/jsx-runtime";
import Queue from "@/pages/Queue";
import AdminDoctorDashboard from "./pages/Admin/AdminDoctorDashboard";
import dayjs from "dayjs";
// import updateLocale from "dayjs/plugin/updateLocale";
import customParseFormat from "dayjs/plugin/customParseFormat";
import plugin from "dayjs/plugin/updateLocale";
dayjs.extend(plugin);
dayjs.updateLocale("en", {
  weekStart: 1,
});
dayjs.extend(customParseFormat);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {PublicRoutes.map((route) => {
          const Layout = route.layout || Fragment;
          return (
            <Route
              path={route.path}
              element={<Layout>{route.element}</Layout>}
            />
          );
        })}
        {PrivateRoutes.map((route) => (
          <Route
            path={route.path}
            element={
              <Authentication allowedRoles={["admin", "staff", "doctor"]}>
                <route.layout>{route.element}</route.layout>
              </Authentication>
            }
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

const PublicRoutes = [
  {
    path: "/",
    element: <Home />,
    layout: MainLayout,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
];

const PrivateRoutes = [
  {
    path: "/admin/",
    element: <Dashboard />,
    layout: DashboardLayout,
  },
  {
    path: "/admin/dashboard",
    element: <Dashboard />,
    layout: DashboardLayout,
  },
  {
    path: "/admin/doctors",
    element: <AdminDoctorDashboard />,
    layout: DashboardLayout,
  },
  {
    path: "/queues",
    element: <Queue />,
    layout: DashboardLayout,
  },


];
