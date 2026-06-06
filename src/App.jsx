import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppToastRegion, EmptyState, ProtectedRoute } from "./components";
import { AdminPage } from "./pages/AdminPage";
import { AdminCustomersPage } from "./pages/AdminCustomersPage";
import { AdminInventoryPage } from "./pages/AdminInventoryPage";
import { AdminRevenuePage } from "./pages/AdminRevenuePage";
import { AdminSchedulePage } from "./pages/AdminSchedulePage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { OrderTrackingPage } from "./pages/OrderTrackingPage";
import { ProviderPage } from "./pages/ProviderPage";
import { SystemHealthPage } from "./pages/SystemHealthPage";
import { ProjectOverviewPage } from "./pages/ProjectOverviewPage";
import { BookingPage } from "./pages/BookingPage";

function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-margin-mobile">
      <div className="w-full max-w-2xl">
        <EmptyState
          icon="explore_off"
          title="页面未找到"
          description={`当前地址 ${location.pathname} 不存在，请返回首页或重新选择模块。`}
          action={
            <a
              href="/"
              className="inline-flex rounded-xl bg-primary px-lg py-3 text-label-md font-semibold text-on-primary"
            >
              返回首页
            </a>
          }
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <AppToastRegion />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <LandingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <OrderTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <ProviderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedule"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/revenue"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminRevenuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminInventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ops"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SystemHealthPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/overview"
          element={
            <ProtectedRoute allowedRoles={["customer", "provider", "admin"]}>
              <ProjectOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
