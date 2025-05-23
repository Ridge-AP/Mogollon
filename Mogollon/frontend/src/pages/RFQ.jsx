// src/pages/RFQ.jsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../api";
import {
  ArrowLeft,
  ArrowUpDown,
  List as ListIcon,
  PlusCircle,
} from "lucide-react";

const rfqSchema = z.object({
  // Step 1: Contact
  email: z.string().email("Invalid email address"),
  customer: z.string().min(1, "Required"),

  // Step 2: Item Description
  product: z.string().min(1, "Required"),
  description: z.string().min(1, "Describe the item"),

  // Step 3: Product Type
  productType: z.enum([
    "Boxes",
    "Poly",
    "Tape",
    "Stretch",
    "Janitorial/Sanitation",
    "Cushioning",
    "Labels",
    "Custom Retail Packaging",
    "Cannabis Packaging",
    "Mailers",
    "Banding/Strapping",
    "Machines",
    "Other",
  ]),
  otherDesc: z.string().optional(),
  otherQty: z.coerce.number().positive("Must be > 0").optional(),
  otherTarget: z.string().optional(),

  // Step 4: Rep & Urgency
  repEmail: z.string().email("Invalid email address"),
  urgency: z.coerce.number().min(1).max(5),

  // Step 5: Dates
  dueDate: z.string().min(1, "Required"),
  neededBy: z.string().min(1, "Required"),

  // Step 6: Internal Notes
  internalNotes: z.string().min(1, "Required"),
});

export default function RFQ() {
  // ---- state & data fetching ----
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/rfqs/");
      setRfqs(res.data);
    } catch (err) {
      console.error("Failed to load RFQs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  // ---- modal + wizard state ----
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);

  // ---- form setup ----
  const form = useForm({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      email: "",
      customer: "",
      product: "",
      description: "",
      productType: "",
      otherDesc: "",
      otherQty: undefined,
      otherTarget: "",
      repEmail: "",
      urgency: 3,
      dueDate: new Date().toISOString().slice(0, 10),
      neededBy: new Date().toISOString().slice(0, 10),
      internalNotes: "",
    },
  });
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;
  const watchType = watch("productType");

  const openModal = () => {
    form.reset();
    setStep(1);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  // 🔑 Updated submit: remap fields & display backend errors
  const submitRFQ = handleSubmit(async (data) => {
    const payload = {
      email: data.email,
      customer: data.customer,
      product: data.product,
      description: data.description,
      product_type: data.productType,
      other_desc: data.otherDesc,
      other_qty: data.otherQty,
      other_target: data.otherTarget,
      rep_email: data.repEmail,
      urgency: data.urgency,
      due_date: data.dueDate,
      needed_by: data.neededBy,
      internal_notes: data.internalNotes,
    };

    try {
      await api.post("/rfqs/", payload);
      await fetchRFQs();   // refresh table data
      closeModal();        // then close modal
    } catch (err) {
      // if DRF returns validation errors, show them
      if (err.response?.data) {
        console.error("Validation error:", err.response.data);
        alert(
          "Failed to create RFQ:\n" +
            JSON.stringify(err.response.data, null, 2)
        );
      } else {
        console.error("Error creating RFQ", err);
        alert("Error creating RFQ");
      }
    }
  });

  // ---- filtering ----
  const filtered = rfqs.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (!searchText) return true;
    const txt = searchText.toLowerCase();
    return (
      r.id.toLowerCase().includes(txt) ||
      (r.products ?? []).some((p) =>
        p.name.toLowerCase().includes(txt)
      ) ||
      (r.vendors ?? []).some((v) =>
        v.name.toLowerCase().includes(txt)
      )
    );
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-800">
            Vendor Quote Requests (RFQs)
          </h1>
          <p className="text-gray-600">
            Manage and track requests for quotes from vendors
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded shadow"
        >
          <PlusCircle className="mr-2" /> Create New RFQ
        </button>
      </div>

      {/* Dashboard Card */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">RFQ Dashboard</h2>
          <p className="text-gray-500">View and filter all vendor quote requests</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search RFQs, products, or vendors…"
            className="flex-1 border rounded-full px-4 py-2"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <select
            className="border rounded-full px-4 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* RFQs Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: "id", label: "RFQ ID" },
                  { key: "created_at", label: "Created Date" },
                  { key: "due_date", label: "Due Date" },
                  { key: "status", label: "Status" },
                  { key: "vendors", label: "Vendors" },
                  { key: "products", label: "Products" },
                  { key: "actions", label: "Actions" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-2 text-left text-sm font-medium text-gray-600"
                  >
                    <div className="inline-flex items-center space-x-1">
                      <span>{col.label}</span>
                      {col.key !== "actions" && (
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{r.id}</td>
                  <td className="px-4 py-2">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(r.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        r.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : r.status === "sent"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2">{(r.vendors ?? []).length}</td>
                  <td className="px-4 py-2">{(r.products ?? []).length}</td>
                  <td className="px-4 py-2 text-right">
                    <button>
                      <ListIcon className="h-5 w-5 text-gray-600 hover:text-gray-800" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-right text-sm text-gray-500">
          Showing {filtered.length} RFQ{filtered.length !== 1 && "s"}
        </p>
      </div>

      {/* Wizard Modal: Google-Form Steps */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <form
            onSubmit={submitRFQ}
            className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 space-y-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">New RFQ</h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <p className="text-gray-600">Step {step} of 6</p>

            {/* Step 1 */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm">Email *</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm">Customer *</label>
                  <input
                    {...register("customer")}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                  {errors.customer && (
                    <p className="text-red-600 text-sm">{errors.customer.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm">Product *</label>
                  <input
                    {...register("product")}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                  {errors.product && (
                    <p className="text-red-600 text-sm">{errors.product.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm">
                    Describe the item in detail *
                  </label>
                  <textarea
                    rows={3}
                    {...register("description")}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <label className="block text-sm">Product Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                  {[
                    "Boxes",
                    "Poly",
                    "Tape",
                    "Stretch",
                    "Janitorial/Sanitation",
                    "Cushioning",
                    "Labels",
                    "Custom Retail Packaging",
                    "Cannabis Packaging",
                    "Mailers",
                    "Banding/Strapping",
                    "Machines",
                    "Other",
                  ].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        {...register("productType")}
                        value={type}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
                {errors.productType && (
                  <p className="text-red-600 text-sm">
                    {errors.productType.message}
                  </p>
                )}
                {watchType === "Other" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm">
                        Other – Description *
                      </label>
                      <input
                        {...register("otherDesc")}
                        className="mt-1 w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm">
                        Other – Quantity *
                      </label>
                      <input
                        type="number"
                        {...register("otherQty", { valueAsNumber: true })}
                        className="mt-1 w-full border rounded px-3 py-2"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm">
                        Other – Target Price *
                      </label>
                      <input
                        {...register("otherTarget")}
                        className="mt-1 w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm">Rep Email *</label>
                  <input
                    type="email"
                    {...register("repEmail")}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                  {errors.repEmail && (
                    <p className="text-red-600 text-sm">
                      {errors.repEmail.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm">
                    Urgency (1 low – 5 high) *
                  </label>
                  <select
                    {...register("urgency", { valueAsNumber: true })}
                    className="mt-1 w-full border rounded px-3 py-2"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm">
                    Date Quote Needed By *
                  </label>
                  <input
                    type="date"
                    {...register("dueDate")}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                  {errors.dueDate && (
                    <p className="text-red-600 text-sm">
                      {errors.dueDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm">Product Needed By *</label>
                  <input
                    type="date"
                    {...register("neededBy")}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                  {errors.neededBy && (
                    <p className="text-red-600 text-sm">
                      {errors.neededBy.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 6 */}
            {step === 6 && (
              <div>
                <label className="block text-sm">
                  Internal Notes for Merchandiser *
                </label>
                <textarea
                  rows={4}
                  {...register("internalNotes")}
                  className="mt-1 w-full border rounded px-3 py-2"
                />
                {errors.internalNotes && (
                  <p className="text-red-600 text-sm">
                    {errors.internalNotes.message}
                  </p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="border rounded px-4 py-2"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              {step < 6 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded"
                >
                  {isSubmitting ? "Submitting…" : "Submit RFQ"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
