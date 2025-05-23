// src/pages/InventoryDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { fetchRecordTransactions } from "../api";
import { ArrowLeft } from "lucide-react";

export default function InventoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.get(`/inventory/${id}/`).then((res) => setRecord(res.data));
    fetchRecordTransactions(id).then((res) => setTransactions(res.data));
  }, [id]);

  if (!record) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brown-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">

      {/* Back */}
      <button
        className="flex items-center space-x-1 text-gray-700"
        onClick={() => navigate("/inventory")}
      >
        <ArrowLeft size={16} /> <span>Back to Inventory</span>
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold">
        {record.product.name}{" "}
        <span className="text-gray-500">({record.product.sku})</span>
      </h1>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500">Quantity On Hand</p>
          <p className="text-2xl font-bold">
            {record.quantity_on_hand.toLocaleString()} {record.uom}
          </p>
          <p className="text-xs text-gray-400">
            Reorder point: {record.reorder_point.toLocaleString()} {record.uom}
          </p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500">Location</p>
          <p className="text-xl font-medium">{record.warehouse.name}</p>
          {record.warehouse.location && (
            <p className="text-xs text-gray-400">
              {record.warehouse.location}
            </p>
          )}
        </div>
        <div className="bg-white border rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500">Units of Measure</p>
          <p className="text-lg font-medium">
            {record.product.default_uom} <span className="text-gray-400">(default)</span>
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white border rounded-xl shadow p-6">
        <h2 className="text-xl font-medium mb-4">Transaction History</h2>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Date", "Type", "Qty", "UOM", "Reference", "User"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-sm font-medium text-gray-600 text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t">
                <td className="px-4 py-2">
                  {new Date(tx.date).toLocaleString()}
                </td>
                <td className="px-4 py-2 capitalize">{tx.transaction_type}</td>
                <td className="px-4 py-2">
                  {tx.transaction_type === "intake" ? "+" : "-"}
                  {tx.quantity.toLocaleString()}
                </td>
                <td className="px-4 py-2">{tx.uom}</td>
                <td className="px-4 py-2">{tx.reference || "—"}</td>
                <td className="px-4 py-2">
                  {tx.user?.username ?? tx.user}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Details */}
      <div className="bg-white border rounded-xl shadow p-6">
        <h2 className="text-xl font-medium mb-4">Product Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div>
            <p className="text-sm text-gray-500">Product Name</p>
            <p className="text-lg font-semibold">{record.product.name}</p>

            <p className="text-sm text-gray-500 mt-4">Description</p>
            <p className="text-gray-800">
              {record.product.description || "No description provided."}
            </p>
          </div>

          {/* Right column */}
          <div>
            <p className="text-sm text-gray-500">SKU</p>
            <p className="text-lg font-semibold">{record.product.sku}</p>

            {/* Add any other product fields here, e.g. category, weight, etc. */}
          </div>
        </div>
      </div>
    </div>
  );
}
