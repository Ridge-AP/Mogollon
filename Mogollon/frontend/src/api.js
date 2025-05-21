// src/api.js
import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// If you ever switch to session/cookie auth, uncomment this:
// axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",  // our DRF router is mounted under /api/
});

// Attach JWT from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: catch 401s globally and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ——— Helper methods for inventory transactions ———

/**
 * Create an intake or depletion transaction.
 * @param {Object} data
 *   { product_id, warehouse_id, transaction_type, quantity, uom, reason?, reference?, notes? }
 * @returns {Promise<axios.Response>}
 */
export function recordTransaction(data) {
  return api.post("/inventory/transactions/", data);
}

/**
 * Fetch transaction history for a specific inventory record.
 * @param {number|string} recordId
 * @returns {Promise<axios.Response>}
 */
export function fetchRecordTransactions(recordId) {
  return api.get(`/inventory/${recordId}/transactions/`);
}

export default api;
