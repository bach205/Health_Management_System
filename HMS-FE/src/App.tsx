import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/index";
import Register from "./pages/Register/index";
import Dashboard from "./pages/Dashboard";
import { Authentication } from "./Authentication";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import { Fragment } from "react/jsx-runtime";
import Queue from "./pages/Queue/index";
import AdminDoctorDashboard from "./pages/Admin/Doctor/AdminDoctorDashboard";
import dayjs from "dayjs";
// import updateLocale from "dayjs/plugin/updateLocale";
import customParseFormat from "dayjs/plugin/customParseFormat";
import plugin from "dayjs/plugin/updateLocale";
import AdminNurseDashboard from "./pages/Admin/Nurse/AdminNurseDashboard";
import Unauthorized from "./pages/Unauthorized";
import AdminClinicDashboard from "./pages/Admin/Clinic/AdminClinicDashboard";
import Workschedule from "./pages/Workschedule/Workschedule";
import ShiftManager from "./pages/Shift/Shift";
import MyProfile from "./pages/Profile/MyProfile";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import MyAppointment from "./pages/Patient/MyAppointment";
import Examination from "./pages/Doctor/Examination";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import type { Role } from "./store/authStore";
import Resetpass from "./pages/ResetPassWord"; // Fixed casing to match actual file path
import PatientBookAppointment from "./pages/BookAppointment";
import './styles/scrollbar.css';
import NurseBookAppointment from "./pages/NurseBookAppointment";
import NurseManageAppointment from "./pages/NurseManageAppointment";
import DoctorQueue from "./pages/Doctor/Queue/DoctorQueue";
import AllDoctor from "./pages/Patient/AllDoctor";
import About from "./pages/Patient/About";
import Contact from "./pages/Patient/Contact";
import AdminPatientDashboard from "./pages/Admin/Patient/AdminPatientDashboard";
import StaffProfile from "./pages/Doctor/StaffProfile";
import ChatUI from "./layouts/MainLayout/ChatUI";
import DocumnetsManagement from "./pages/Admin/DocumentsManagement";
import PatientQueueTable from "./pages/Patient/Queue/PatientQueueTable";
import MedicineDashboard from "./pages/Admin/Medicine/AdminMedicineDashboard";
import AdminSpecialtyDashboard from "./pages/Admin/Specialty/AdminSpecialtyDashboard";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import ForgetPage from "./pages/ForgetPage";
import ChatPage from "./pages/Chat";
import Monitor from "./pages/Queue/Monitor";
import QRBookAppointment from "./pages/QRBookAppointment";
import SaleMedicinePage from "./pages/SaleMedicinePage";
import ExaminationResult from "./pages/Patient/ExaminationResult";
import ExaminationHistory from "./pages/Patient/ExaminationHistory";
import BlogDashboard from "./pages/Blog/BlogDashboard";
import BlogDetail from "./pages/Blog/BlogDetail";
import CreateBlog from "./pages/Admin/Blog/CreateBlog";
import AdminBlogDashboard from "./pages/Admin/Blog/AdminBlogDashboard";
import EditBlog from "./pages/Blog/BlogEdit";
import PaymentList from "./pages/Payment/PaymentList";

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
              <Authentication allowedRoles={route.allowedRoles || ["admin", "nurse", "doctor"]}>
                <route.layout>{route.element}</route.layout>
              </Authentication>
            }
          />

        ))}

        <Route path="unauthorize" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
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
    path: "/monitor",
    element: <Monitor />,
    layout: MainLayout,
  },
  {
    path: "/book-appointment/:docId",
    element: <PatientBookAppointment />,
    layout: MainLayout,
  },
  {
    path: "/login",
    element: <Login />,
    layout: MainLayout,
  },
  {
    path: "/register",
    element: <Register />,
    layout: MainLayout,
  },
  {
    path: "/forget-password",
    element: <Resetpass />,
    layout: MainLayout,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />
  },
  {
    path: "/doctors",
    element: <AllDoctor />,
    layout: MainLayout,
  },
  {
    path: "/about",
    element: <About />,
    layout: MainLayout,
  },
  {
    path: "/contact",
    element: <Contact />,
    layout: MainLayout,
  },
  {
    path: "/chatbot",
    element: <ChatUI />,
    layout: MainLayout,
  },
  {
    path: "/reset-password",
    element: <ForgetPage />,
    layout: MainLayout,
  },
  {
    path: "/qr-book-appointment",
    element: <QRBookAppointment />,
    layout: MainLayout,
  },
  {
    path: "/blogs",
    element: <BlogDashboard />,
    layout: MainLayout,
  },
  {
    path: "/blogs/:id",
    element: <BlogDetail />,
    layout: MainLayout,
  },
];

interface PrivateRoute {
  path: string;
  element: React.ReactNode;
  allowedRoles?: Role[];
  layout: React.ComponentType<{ children: React.ReactNode }>;
}
const PrivateRoutes: PrivateRoute[] = [
  {
    path: "/sale-medicine",
    element: <SaleMedicinePage />,
    layout: DashboardLayout,
  },
  {
    path: "/admin/",
    element: <AdminDashboard />,
    allowedRoles: ["admin"],
    layout: DashboardLayout,
  },
  {
    path: "/workschedule",
    element: <Workschedule />,
    layout: DashboardLayout,
  },
  {
    path: "/nurse-book-appointments",
    element: <NurseBookAppointment />,
    layout: DashboardLayout,
  },
  {
    path: "/user-book-appointments",
    element: <NurseManageAppointment />,
    layout: DashboardLayout,
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
    allowedRoles: ["admin"],
    layout: DashboardLayout,
  },

  {
    path: "/admin/blogs",
    element: <AdminBlogDashboard />,
    allowedRoles: ["admin"],
    layout: DashboardLayout,
  },

  {
    path: "/admin/blogs/create",
    element: <CreateBlog />,
    allowedRoles: ["admin"],
    layout: DashboardLayout,
  },
  {
    path: "/admin/blogs/update/:blogId",
    element: <EditBlog />,
    allowedRoles: ["admin"],
    layout: DashboardLayout,
  },
  {
    path: "/admin/doctors",
    allowedRoles: ["admin"],
    element: <AdminDoctorDashboard />,
    layout: DashboardLayout,
  },
  {
    path: "/admin/nurses",
    element: <AdminNurseDashboard />,
    layout: DashboardLayout,
  },
  {
    path: "/rooms",
    element: <AdminClinicDashboard />,
    layout: DashboardLayout,
  },
  {
    path: "/queues",
    element: <Queue />,
    layout: DashboardLayout,
  },
  {
    path: "/shift",
    element: <ShiftManager />,
    layout: DashboardLayout,
  },

  {
    path: "/manage-payments",
    element: <PaymentList />,
    layout: DashboardLayout,
  },

  {
    path: "/my-appointments",
    element: <MyAppointment />,
    allowedRoles: ["patient"],
    layout: MainLayout,
  },

  {
    path: "/my-appointments/record/:appointmentId",
    element: <ExaminationResult />,
    allowedRoles: ["patient"],
    layout: MainLayout,
  },

  {
    path: "/examination-history",
    element: <ExaminationHistory />,
    allowedRoles: ["patient"],
    layout: MainLayout,
  },

  {
    path: "/queue",
    element: <Monitor />,
    allowedRoles: ["patient"],
    layout: MainLayout,
  },
  {
    path: "/examination",
    element: <Examination />,
    // allowedRoles: ["doctor"],
    layout: DashboardLayout,
  },
  {
    path: "/doctor-profile",
    element: <DoctorProfile />,
    allowedRoles: ["doctor", "nurse", "admin"],
    layout: DashboardLayout,
  },
  {
    path: "/staff-profile",
    element: <StaffProfile />,
    allowedRoles: ["doctor", "nurse", "admin"],
    layout: DashboardLayout,
  },
  {
    path: "/my-profile",
    element: <MyProfile />,
    allowedRoles: ["patient"],
    layout: MainLayout,
  },
  {
    path: "/doctor/queue",
    element: <DoctorQueue />,
    allowedRoles: ["doctor", "admin"],
    layout: DashboardLayout,
  },
  {
    path: "/admin/patients",
    element: <AdminPatientDashboard />,
    layout: DashboardLayout,
    allowedRoles: ["admin"],
  },
  {
    path: "/admin/documents",
    element: <DocumnetsManagement />,
    layout: DashboardLayout,
    allowedRoles: ["admin"],
  },
  {
    path: "/queue",
    element: <PatientQueueTable />,
    layout: MainLayout,
    allowedRoles: ["patient"],
  },
  {
    path: "/admin/specialties",
    element: <AdminSpecialtyDashboard />,
    layout: DashboardLayout,
    allowedRoles: ["admin"],
  },


  {
    path: "/admin/medicines",
    element: <MedicineDashboard />,
    layout: DashboardLayout,
    allowedRoles: ["admin"],
  },
  {
    path: "/chat",
    element: <ChatPage />,
    layout: DashboardLayout,
    allowedRoles: ["admin", "doctor", "nurse", "patient"],
  },
  {
    path: "/blog/:id",
    element: <EditBlog />,
    layout: DashboardLayout,
    allowedRoles: ["admin", "doctor", "nurse", "patient"],
  },



];