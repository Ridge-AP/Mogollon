// src/roleRoutes.js

// 1. The list of roles for the dropdown
export const ROLE_OPTIONS = [
  { value: "admin",            label: "Admin" },
  { value: "sales-rep",        label: "Sales Rep" },
  { value: "warehouse-staff",  label: "Warehouse Staff" },
  { value: "neighbor-client",  label: "Neighbor Client" },
  { value: "other-client",     label: "Other Client" },
  { value: "vendor",           label: "Vendor" },
];

// 2. Default landing routes for each role
export const ROLE_DEFAULT_ROUTE = {
  admin:            "/admin",
  "sales-rep":      "/sales",
  "warehouse-staff":"/warehouse",
  "neighbor-client":"/store",
  "other-client":   "/portal",
  vendor:           "/vendor",
  default:          "/dashboard",
};
