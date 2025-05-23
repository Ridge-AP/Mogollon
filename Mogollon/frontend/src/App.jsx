// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login    from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout   from "./components/Layout";

// Inventory list & detail pages
import Inventory       from "./pages/Inventory";
import InventoryDetail from "./pages/InventoryDetails";

// RFQ pages
import RFQ       from "./pages/RFQ";
import RFQCreate from "./pages/RFQCreate";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" replace />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/logout"   element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />

        {/* All protected routes share the Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />

          {/* General Dashboard */}
          <Route
            path="/dashboard"
            element={<Navigate to="/inventory" replace />}
          />

          {/* Inventory list & detail */}
          <Route path="/inventory"     element={<Inventory />} />
          <Route path="/inventory/:id" element={<InventoryDetail />} />

          {/* RFQs listing */}
          <Route
            path="/rfqs"
            element={
              <ProtectedRoute roles={["admin","warehouse-staff","vendor"]}>
                <RFQ />
              </ProtectedRoute>
            }
          />

          {/* RFQ creation */}
          <Route
            path="/rfqs/create"
            element={
              <ProtectedRoute roles={["admin","warehouse-staff","vendor"]}>
                <RFQCreate />
              </ProtectedRoute>
            }
          />

          {/* Orders */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute roles={["admin","sales-rep"]}>
                <Navigate to="/orders" />
              </ProtectedRoute>
            }
          />

          {/* Quotes */}
          <Route
            path="/quotes"
            element={
              <ProtectedRoute roles={["admin","sales-rep"]}>
                <Navigate to="/quotes" />
              </ProtectedRoute>
            }
          />

          {/* VMI */}
          <Route
            path="/vmi"
            element={
              <ProtectedRoute roles={["admin","sales-rep"]}>
                <Navigate to="/vmi" />
              </ProtectedRoute>
            }
          />

          {/* E-Commerce */}
          <Route
            path="/ecommerce"
            element={
              <ProtectedRoute roles={["admin","neighbor-client"]}>
                <Navigate to="/ecommerce" />
              </ProtectedRoute>
            }
          />

          {/* Other role-specific */}
          <Route
            path="/sales"
            element={
              <ProtectedRoute roles={["sales-rep"]}>
                <Navigate to="/sales" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute roles={["warehouse-staff"]}>
                <Navigate to="/warehouse" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store"
            element={
              <ProtectedRoute roles={["neighbor-client"]}>
                <Navigate to="/store" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal"
            element={
              <ProtectedRoute roles={["other-client"]}>
                <Navigate to="/portal" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor"
            element={
              <ProtectedRoute roles={["vendor"]}>
                <Navigate to="/vendor" />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}
