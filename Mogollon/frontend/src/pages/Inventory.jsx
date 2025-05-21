// src/pages/Inventory.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { recordTransaction, fetchRecordTransactions } from "../api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Database,
  AlertTriangle,
  TrendingUp,
  Truck,
  Search,
  ArrowUpDown,
  PlusCircle,
  Upload,
  Download,
  ArrowLeft,
} from "lucide-react";

// ——— Simple toast hook + component ———
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const toast = ({ title, description, variant = "default" }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((ts) => [...ts, { id, title, description, variant }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 4000);
  };
  const dismiss = (id) => setToasts((ts) => ts.filter((t) => t.id !== id));
  return { toasts, toast, dismiss };
};
const ToastContainer = ({ toasts, dismiss }) => (
  <div className="fixed bottom-4 right-4 space-y-2 z-50">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={
          "flex max-w-sm items-start space-x-3 rounded border p-3 shadow " +
          (t.variant === "destructive"
            ? "bg-red-50 border-red-200 text-red-800"
            : "bg-white border-gray-200 text-gray-800")
        }
      >
        <div className="flex-1">
          <strong>{t.title}</strong>
          {t.description && <p className="mt-1 text-sm">{t.description}</p>}
        </div>
        <button onClick={() => dismiss(t.id)} className="font-bold">
          ×
        </button>
      </div>
    ))}
  </div>
);

// ——— Validation schemas ———
const intakeSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  uom: z.string().min(1),
  reference: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().min(1),
});
const depletionSchema = intakeSchema.extend({
  reason: z.enum(["client_order", "shrinkage", "damage", "transfer", "other"]),
});
const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  defaultUom: z.string().min(1),
});
const warehouseSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
});
// ——— Add New Product form ———
function AddProductForm({ setView, toast, fetchAllData }) {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", sku: "", defaultUom: "" },
  });

  // This is your submit handler
  const onSubmit = async (data) => {
    try {
      await api.post("/products/", {
        name: data.name,
        sku: data.sku,
        default_uom: data.defaultUom,
      });
      toast({ title: "Product added successfully" });
      await fetchAllData();
      setView("overview");
    } catch (err) {
      console.error(err.response?.data || err);
      toast({
        title: "Error adding product",
        description: JSON.stringify(err.response?.data),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border rounded-xl shadow p-6 space-y-6">
      {/* Back button */}
      <button
        className="flex items-center space-x-1 text-gray-700 mb-4"
        onClick={() => setView("overview")}
      >
        <ArrowLeft size={16} /> <span>Back</span>
      </button>

      {/* Heading */}
      <h2 className="text-xl font-bold">Add New Product</h2>

      {/* *** Here’s your form *** */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name field */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            {...form.register("name")}
            className="w-full border rounded px-3 py-2"
          />
          {form.formState.errors.name && (
            <p className="text-red-600 text-sm">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* SKU field */}
        <div>
          <label className="block text-sm font-medium mb-1">SKU</label>
          <input
            {...form.register("sku")}
            className="w-full border rounded px-3 py-2"
          />
          {form.formState.errors.sku && (
            <p className="text-red-600 text-sm">
              {form.formState.errors.sku.message}
            </p>
          )}
        </div>

        {/* Default UOM field */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Default UOM
          </label>
          <input
            {...form.register("defaultUom")}
            className="w-full border rounded px-3 py-2"
          />
          {form.formState.errors.defaultUom && (
            <p className="text-red-600 text-sm">
              {form.formState.errors.defaultUom.message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setView("overview")}
            className="px-4 py-2 border rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-600 text-white rounded"
          >
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
}


// ——— Add New Warehouse form ———
function AddWarehouseForm({ setView, toast, fetchAllData }) {
  const form = useForm({
    resolver: zodResolver(warehouseSchema),
    defaultValues: { name: "", location: "" },
  });

  const onSubmit = async (data) => {
    try {
      await api.post("/warehouses/", data);
      toast({ title: "Warehouse added successfully" });
      await fetchAllData();
      setView("overview");
    } catch (err) {
      console.error(err.response?.data || err);
      toast({
        title: "Error adding warehouse",
        description: JSON.stringify(err.response?.data),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border rounded-xl shadow p-6 space-y-6">
      <button
        className="flex items-center space-x-1 text-gray-700 mb-4"
        onClick={() => setView("overview")}
      >
        <ArrowLeft size={16} /> <span>Back</span>
      </button>
      <h2 className="text-xl font-bold">Add New Warehouse</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Warehouse Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Warehouse Name
          </label>
          <input
            {...form.register("name")}
            className="w-full border rounded px-3 py-2"
          />
          {form.formState.errors.name && (
            <p className="text-red-600 text-sm">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            {...form.register("location")}
            className="w-full border rounded px-3 py-2"
          />
          {form.formState.errors.location && (
            <p className="text-red-600 text-sm">
              {form.formState.errors.location.message}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setView("overview")}
            className="px-4 py-2 border rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-600 text-white rounded"
          >
            Create Warehouse
          </button>
        </div>
      </form>
    </div>
  );
}

// ——— Main component ———
export default function InventoryPage() {
  const [view, setView] = useState("overview"); // overview | intake | deplete | addProduct | addWarehouse
  const [records, setRecords] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toasts, toast, dismiss } = useToast();

  // centralized data fetch, **normalize snake_case → camelCase + pull IDs from nested objects**
  const fetchAllData = async () => {
    try {
      const [invRes, whRes, prRes] = await Promise.all([
        api.get("/inventory/"),
        api.get("/warehouses/"),
        api.get("/products/"),
      ]);

      const normalized = invRes.data.map((r) => ({
        ...r,
        // API returns nested `product` & `warehouse`, so grab their IDs:
        productId: r.product.id,
        warehouseId: r.warehouse.id,
        // guard against strings in JSON:
        quantityOnHand: Number(r.quantity_on_hand),
        reorderPoint: Number(r.reorder_point),
      }));

      setRecords(normalized);
      setWarehouses(whRes.data);
      setProducts(prRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brown-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // ——— Overview ———
  const Overview = () => {
    const [searchText, setSearchText] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState("");
    const [lowOnly, setLowOnly] = useState(false);
    const [sortBy, setSortBy] = useState("sku");
    const [sortDir, setSortDir] = useState("asc");

    const sortFns = {
      sku: (r) => r.product.sku,
      name: (r) => r.product.name,
      warehouse: (r) => r.warehouse.name,
      quantity: (r) => r.quantityOnHand,
    };

    const filtered = records
      .filter((r) => {
        const txt = searchText.toLowerCase();
        const okSearch =
          !txt ||
          r.product.sku.toLowerCase().includes(txt) ||
          r.product.name.toLowerCase().includes(txt);
        // compare numeric ID to Number(filter)
        const okWh =
          !warehouseFilter ||
          r.warehouseId === Number(warehouseFilter);
        const isLow = r.quantityOnHand <= r.reorderPoint;
        return okSearch && okWh && (!lowOnly || isLow);
      })
      .sort((a, b) => {
        const va = sortFns[sortBy](a);
        const vb = sortFns[sortBy](b);
        if (va < vb) return sortDir === "asc" ? -1 : 1;
        if (va > vb) return sortDir === "asc" ? 1 : -1;
        return 0;
      });

    const totalUnits = records.reduce((s, r) => s + r.quantityOnHand, 0);
    const lowCount = records.filter(
      (r) => r.quantityOnHand <= r.reorderPoint
    ).length;
    const uniqueProducts = new Set(records.map((r) => r.productId)).size;
    const warehouseCount = new Set(records.map((r) => r.warehouseId))
      .size;

    return (
      <div className="space-y-6">
        {/* header + actions */}
        <div className="bg-white border rounded-xl shadow p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-gray-600">Track and manage your inventory.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50 flex items-center"
              onClick={() => setView("deplete")}
            >
              <Upload size={16} />{" "}
              <span className="ml-1">Record Depletion</span>
            </button>
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50 flex items-center"
              onClick={() => setView("intake")}
            >
              <Download size={16} />{" "}
              <span className="ml-1">Record Intake</span>
            </button>
            <button
              className="px-3 py-1 bg-yellow-500 text-white rounded flex items-center hover:bg-yellow-600"
              onClick={() => setView("addProduct")}
            >
              <PlusCircle size={16} />{" "}
              <span className="ml-1">Add New Product</span>
            </button>
            <button
              className="px-3 py-1 bg-amber-700 text-white rounded flex items-center hover:bg-amber-800"
              onClick={() => setView("addWarehouse")}
            >
              <PlusCircle size={16} />{" "}
              <span className="ml-1">Add New Warehouse</span>
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total Inventory",
              value: totalUnits.toLocaleString(),
              note: `${uniqueProducts} SKUs`,
              Icon: Database,
              color: "text-blue-600",
            },
            {
              title: "Low Stock Alerts",
              value: lowCount,
              note: "Below reorder",
              Icon: AlertTriangle,
              color: "text-amber-500",
            },
            {
              title: "Active SKUs",
              value: uniqueProducts,
              note: "Unique products",
              Icon: TrendingUp,
              color: "text-emerald-600",
            },
            {
              title: "Warehouses",
              value: warehouseCount,
              note: "Locations",
              Icon: Truck,
              color: "text-indigo-600",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="bg-white border rounded-xl p-4 shadow flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-gray-500">{c.title}</p>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-xs text-gray-500">{c.note}</p>
              </div>
              <c.Icon size={24} className={c.color} />
            </div>
          ))}
        </div>

        {/* filters */}
        <div className="bg-white border rounded-xl p-4 shadow flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              className="w-full border rounded-full pl-10 pr-4 py-2"
              placeholder="Search by SKU or name…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <select
            className="border rounded-full px-4 py-2"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={lowOnly}
              onChange={(e) => setLowOnly(e.target.checked)}
            />
            <span>Low Stock Only</span>
          </label>
        </div>

        {/* table */}
        <div className="bg-white border rounded-xl shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: "sku", label: "SKU", align: "text-left" },
                  { key: "name", label: "Product", align: "text-left" },
                  { key: "warehouse", label: "Warehouse", align: "text-left" },
                  { key: "quantity", label: "Qty", align: "text-right" },
                  { key: "uom", label: "UOM", align: "text-right" },
                  { key: "status", label: "Status", align: "text-right" },
                  { key: "actions", label: "Actions", align: "text-right" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-2 text-sm font-medium text-gray-600 ${col.align} cursor-pointer`}
                    onClick={() => {
                      if (col.key === "actions") return;
                      if (sortBy === col.key) {
                        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                      } else {
                        setSortBy(col.key);
                        setSortDir("asc");
                      }
                    }}
                  >
                    <div className="inline-flex items-center space-x-1">
                      <span>{col.label}</span>
                      {sortBy === col.key && (
                        <ArrowUpDown
                          className="h-4 w-4 text-gray-500"
                          style={{
                            transform:
                              sortDir === "asc"
                                ? "rotate(180deg)"
                                : undefined,
                          }}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const low = r.quantityOnHand <= r.reorderPoint;
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/inventory/${r.id}`)}
                  >
                    <td className="px-4 py-2">{r.product.sku}</td>
                    <td className="px-4 py-2">{r.product.name}</td>
                    <td className="px-4 py-2">{r.warehouse.name}</td>
                    <td className="px-4 py-2 text-right flex justify-end items-center space-x-1">
                      {low && <AlertTriangle className="text-amber-500" />}
                      <span className={low ? "text-amber-600 font-semibold" : ""}>
                        {r.quantityOnHand.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">{r.uom}</td>
                    <td className="px-4 py-2 text-right">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full inline-block ${
                          low
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {low ? "Low" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/inventory/${r.id}`);
                        }}
                        className="text-grey-600"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ——— Record Intake form ———
  const IntakeForm = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const form = useForm({
      resolver: zodResolver(intakeSchema),
      defaultValues: { date: new Date().toISOString().slice(0, 10), quantity: 1 },
    });

    const onSubmit = async (data) => {
  try {
   await recordTransaction({
  product_id: data.productId,
  warehouse_id: data.warehouseId,
  transaction_type: "intake",   // or "depletion"
  quantity: data.quantity,
  uom: data.uom,
  reason: data.reason,          // only for depletion
  reference: data.reference,
  notes: data.notes,
});

    toast({ title: "Intake recorded successfully!" });
    await fetchAllData();
    setView("overview");
  } catch (err) {
    console.error(err.response?.data || err);
    toast({
      title: "Error recording intake",
      description: JSON.stringify(err.response?.data),
      variant: "destructive",
    });
  }
};


    return (
      <div>
        <button
          className="flex items-center space-x-1 text-gray-700 mb-4"
          onClick={() => setView("overview")}
        >
          <ArrowLeft size={16} /> <span>Back</span>
        </button>
        <div className="max-w-3xl mx-auto bg-white border rounded-xl shadow p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center">
            <Download size={20} className="mr-2 text-blue-600" />
            Record Inventory Intake
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* date */}
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                {...form.register("date")}
                className="w-full border rounded px-3 py-2"
              />
              {form.formState.errors.date && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>
            {/* reference */}
            <div>
              <label className="block text-sm font-medium mb-1">Reference</label>
              <input
                placeholder="PO-12345"
                {...form.register("reference")}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            {/* product */}
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <select
                {...form.register("productId")}
                onChange={(e) => {
                  form.setValue("productId", e.target.value);
                  const p = products.find(
                    (p) => p.id === Number(e.target.value)
                  );
                  setSelectedProduct(p);
                  form.setValue("uom", p?.defaultUom || "");
                }}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
              {form.formState.errors.productId && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.productId.message}
                </p>
              )}
            </div>
            {/* warehouse */}
            <div>
              <label className="block text-sm font-medium mb-1">Warehouse</label>
              <select
                {...form.register("warehouseId")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.warehouseId && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.warehouseId.message}
                </p>
              )}
            </div>
            {/* quantity */}
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                {...form.register("quantity")}
                className="w-full border rounded px-3 py-2"
              />
              {form.formState.errors.quantity && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.quantity.message}
                </p>
              )}
            </div>
            {/* uom */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Unit of Measure
              </label>
              <input
                type="text"
                {...form.register("uom")}
                placeholder="e.g. unit, kg, box…"
                className="w-full border rounded px-3 py-2"
              />
              {form.formState.errors.uom && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.uom.message}
                </p>
              )}
            </div>
            {/* notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                {...form.register("notes")}
                rows={3}
                className="w-full border rounded px-3 py-2"
                placeholder="Optional notes…"
              />
            </div>
            {/* submit */}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setView("overview")}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-600 text-white rounded"
              >
                Record Intake
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ——— Record Depletion form ———
  const DepletionForm = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const form = useForm({
      resolver: zodResolver(depletionSchema),
      defaultValues: {
        date: new Date().toISOString().slice(0, 10),
        quantity: 1,
        reason: "client_order",
      },
    });

    const getCurrentStock = () => {
      if (!selectedProduct || selectedWarehouse === null) return 0;
      const rec = records.find(
        (r) =>
          r.productId === selectedProduct.id &&
          r.warehouseId === selectedWarehouse
      );
      return rec?.quantityOnHand || 0;
    };

    const onSubmit = async (data) => {
  try {
    await api.post(`/inventory/transactions/`, {
      product_id: data.productId,
      warehouse_id: data.warehouseId,
      transaction_type: "depletion",
      quantity: data.quantity,
      uom: data.uom,
      reason: data.reason,
      reference: data.reference,
      notes: data.notes,
    });

    toast({ title: "Depletion recorded successfully!" });
    await fetchAllData();
    setView("overview");
  } catch (err) {
    console.error(err.response?.data || err);
    toast({
      title: "Error recording depletion",
      description: JSON.stringify(err.response?.data),
      variant: "destructive",
    });
  }
};


    return (
      <div>
        <button
          className="flex items-center space-x-1 text-gray-700 mb-4"
          onClick={() => setView("overview")}
        >
          <ArrowLeft size={16} /> <span>Back</span>
        </button>
        <div className="max-w-3xl mx-auto bg-white border rounded-xl shadow p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center">
            <Upload size={20} className="mr-2 text-blue-600" />
            Record Inventory Depletion
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* date */}
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                {...form.register("date")}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            {/* reason */}
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <div className="space-y-1">
                {[
                  "client_order",
                  "shrinkage",
                  "damage",
                  "transfer",
                  "other",
                ].map((val) => (
                  <label
                    key={val}
                    className="inline-flex items-center space-x-2 mr-4"
                  >
                    <input
                      type="radio"
                      value={val}
                      {...form.register("reason")}
                      className="h-4 w-4"
                    />
                    <span className="capitalize">{val.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* product */}
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <select
                {...form.register("productId")}
                onChange={(e) => {
                  form.setValue("productId", e.target.value);
                  const p = products.find(
                    (p) => p.id === Number(e.target.value)
                  );
                  setSelectedProduct(p);
                  form.setValue("uom", p?.defaultUom || "");
                }}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
            {/* warehouse */}
            <div>
              <label className="block text-sm font-medium mb-1">Warehouse</label>
              <select
                {...form.register("warehouseId")}
                onChange={(e) => {
                  form.setValue("warehouseId", e.target.value);
                  setSelectedWarehouse(Number(e.target.value));
                }}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Current stock: {getCurrentStock()}
              </p>
            </div>
            {/* quantity */}
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                {...form.register("quantity")}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            {/* uom */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Unit of Measure
              </label>
              <input
                type="text"
                {...form.register("uom")}
                placeholder="e.g. unit, kg, box…"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            {/* reference */}
            <div>
              <label className="block text-sm font-medium mb-1">Reference</label>
              <input
                placeholder="e.g. ORD-12345"
                {...form.register("reference")}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            {/* notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                {...form.register("notes")}
                rows={3}
                className="w-full border rounded px-3 py-2"
                placeholder="Optional notes…"
              />
            </div>
            {/* submit */}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setView("overview")}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-600 text-white rounded"
              >
                Record Depletion
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {view === "overview" && <Overview />}
      {view === "intake" && <IntakeForm />}
      {view === "deplete" && <DepletionForm />}
      {view === "addProduct" && (
        <AddProductForm
          setView={setView}
          toast={toast}
          fetchAllData={fetchAllData}
        />
      )}
      {view === "addWarehouse" && (
        <AddWarehouseForm
          setView={setView}
          toast={toast}
          fetchAllData={fetchAllData}
        />
      )}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
