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
                {route.element}
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
    path: "/dashboard",
    element: <Dashboard />,
    layout: DashboardLayout,
  },
];
