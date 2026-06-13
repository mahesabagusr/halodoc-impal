import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import PublicLayout from "./layout/PublicLayout";
import ProtectedRoute from "./layout/ProtectedRoute";
import HomePage from "./Pages/Home/Home";
import AuthPage from "./Pages/Auth/Auth";
import NotFound from "./Pages/NotFound";
import ProductPage from "./Pages/Products/Home";
import ProductDetailPage from "./Pages/Products/ProductDetail/Home";
import SpecializationSelect from "./Pages/Doctor/pages/SpecializationSelect";
import DoctorList from "./Pages/Doctor/pages/DoctorList";
import DoctorDetail from "./Pages/Doctor/pages/DoctorDetail";
import ConsultationPayment from "./Pages/Consultations/pages/ConsultationPayment";
import ConsultationSuccess from "./Pages/Consultations/pages/ConsultationSuccess";
import ConsultationChat from "./Pages/Consultations/pages/ConsultationChat";
import DoctorDashboard from "./Pages/Doctor/pages/DoctorDashboard";
import DoctorRequests from "./Pages/Doctor/pages/DoctorRequests";
import MyConsultations from "./Pages/Consultations/pages/MyConsultations";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "auth",
        element: <AuthPage />,
      },
      {
        path: "products",
        element: <ProductPage />,
      },
      {
        path: "products/:id",
        element: <ProductDetailPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "consultations",
            element: <SpecializationSelect />,
          },
          {
            path: "consultations/doctors",
            element: <DoctorList />,
          },
          {
            path: "consultations/doctors/:doctorId",
            element: <DoctorDetail />,
          },
          {
            path: "consultations/:id/payment",
            element: <ConsultationPayment />,
          },
          {
            path: "consultations/success",
            element: <ConsultationSuccess />,
          },
          {
            path: "history",
            element: <MyConsultations />,
          },
        ],
      },
    ],
  },
  // ── Full-screen routes (no Navbar/Footer) ─────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/consultations/:id/chat",
        element: <ConsultationChat />,
      },
    ],
  },
  {
    path: "/doctor/dashboard",
    element: <DoctorDashboard />,
  },
  {
    path: "/doctor/requests",
    element: <DoctorRequests />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return <RouterProvider router={routes} />;
}

export default App;
