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
import Stub     from "./components/Stub";

// **NEW** import your Inventory stub/page
import Inventory from "./pages/Inventory";

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
        <Route path="/"        element={<Navigate to="/login" replace />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/logout"  element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />

        {/* All protected routes share the Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Admin: full access */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Stub title="Admin Dashboard" />
              </ProtectedRoute>
            }
          />

          {/* General Dashboard: any authenticated role */}
          <Route
            path="/dashboard"
            element={<Stub title="General Dashboard" />}
          />

          {/* Inventory module */}
          <Route
            path="/inventory"
            element={<Inventory />}
          />

          {/* RFQs */}
          <Route
            path="/rfqs"
            element={
              <ProtectedRoute roles={["admin","warehouse-staff","vendor"]}>
                <Stub title="RFQs" />
              </ProtectedRoute>
            }
          />

          {/* Orders */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute roles={["admin","sales-rep"]}>
                <Stub title="Orders" />
              </ProtectedRoute>
            }
          />

          {/* Quotes */}
          <Route
            path="/quotes"
            element={
              <ProtectedRoute roles={["admin","sales-rep"]}>
                <Stub title="Quotes" />
              </ProtectedRoute>
            }
          />

          {/* VMI */}
          <Route
            path="/vmi"
            element={
              <ProtectedRoute roles={["admin","sales-rep"]}>
                <Stub title="VMI Tools" />
              </ProtectedRoute>
            }
          />

          {/* E-Commerce */}
          <Route
            path="/ecommerce"
            element={
              <ProtectedRoute roles={["admin","neighbor-client"]}>
                <Stub title="E-Commerce Store" />
              </ProtectedRoute>
            }
          />

          {/* Other role-specific stubs: sales, warehouse, store, portal, vendor */}
          <Route
            path="/sales"
            element={
              <ProtectedRoute roles={["sales-rep"]}>
                <Stub title="Sales Rep Portal" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute roles={["warehouse-staff"]}>
                <Stub title="Warehouse Staff UI" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store"
            element={
              <ProtectedRoute roles={["neighbor-client"]}>
                <Stub title="Neighbor Client Store" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal"
            element={
              <ProtectedRoute roles={["other-client"]}>
                <Stub title="Client Portal (PO/RFQ)" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor"
            element={
              <ProtectedRoute roles={["vendor"]}>
                <Stub title="Vendor RFQ Response Portal" />
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
