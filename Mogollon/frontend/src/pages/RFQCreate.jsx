// src/pages/RFQCreate.jsx
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";

const formSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    customer: z.string().min(1, "Required"),
    productDescription: z.string().min(1, "Please describe the product"),
    productType: z.enum([
      "Boxes", "Poly", "Tape", "Stretch", 
      "Janitorial/Sanitation", "Cushioning", 
      "Labels", "Custom Retail Packaging", 
      "Cannabis Packaging", "Mailers", 
      "Banding/Strapping", "Machines", "Other"
    ]),
    otherTypeDescription: z.string().optional(),
    otherTypeQuantity: z.coerce.number().optional(),
    otherTypeTargetPrice: z.string().optional(),
    repEmail: z.string().email("Invalid email"),
    urgency: z.coerce
      .number()
      .min(1)
      .max(5),
    dueDate: z.string().min(1, "Required"),
    productNeededBy: z.string().min(1, "Required"),
    internalNotes: z.string().min(1, "Required"),
    vendorIds: z.array(z.string()).min(1, "Select at least one vendor"),
    products: z
      .array(
        z.object({
          productId: z.string().min(1, "Select a product"),
          quantity: z.coerce.number().positive("Must be > 0"),
          uom: z.string().min(1, "Required"),
        })
      )
      .min(1, "Add at least one line"),
  })
  .required();

export default function RFQCreate() {
  const [vendors, setVendors] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // fetch vendors + products once
  useEffect(() => {
    Promise.all([api.get("/vendors/"), api.get("/products/")])
      .then(([vRes, pRes]) => {
        setVendors(vRes.data);
        setProductsList(pRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      customer: "",
      productDescription: "",
      productType: "",
      otherTypeDescription: "",
      otherTypeQuantity: undefined,
      otherTypeTargetPrice: "",
      repEmail: "",
      urgency: 3,
      dueDate: new Date().toISOString().slice(0, 10),
      productNeededBy: new Date().toISOString().slice(0, 10),
      internalNotes: "",
      vendorIds: [],
      products: [{ productId: "", quantity: 1, uom: "" }],
    },
  });

  const { register, control, handleSubmit, watch, formState: { errors } } =
    form;
  const { fields, append, remove } = useFieldArray({
    name: "products",
    control,
  });

  const watchType = watch("productType");

  const onSubmit = async (data) => {
    try {
      await api.post("/rfqs/", {
        ...data,
        // adapt payload shape if needed
      });
      navigate("/rfqs");
    } catch (err) {
      console.error(err);
      alert("Error creating RFQ");
    }
  };

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="space-y-6 px-6 py-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2" /> Back to RFQs
      </button>

      <h1 className="text-2xl font-bold">Create New RFQ</h1>
      <p className="text-gray-600">Request quotes from vendors for your products</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── CONTACT & CUSTOMER ── */}
        <section className="bg-white p-4 rounded-xl shadow space-y-2">
          <h2 className="font-semibold">Contact & Customer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium">Your Email *</label>
              <input
                type="email"
                {...register("email")}
                className="mt-1 w-full border rounded px-2 py-1"
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Customer *</label>
              <input
                {...register("customer")}
                className="mt-1 w-full border rounded px-2 py-1"
              />
              {errors.customer && (
                <p className="text-red-600 text-sm">{errors.customer.message}</p>
              )}
            </div>

          </div>
        </section>

        {/* ── PRODUCT DETAILS ── */}
        <section className="bg-white p-4 rounded-xl shadow space-y-2">
          <h2 className="font-semibold">Describe Your Product *</h2>
          <textarea
            {...register("productDescription")}
            rows={3}
            className="w-full border rounded px-2 py-1"
          />
          {errors.productDescription && (
            <p className="text-red-600 text-sm">
              {errors.productDescription.message}
            </p>
          )}
        </section>

        {/* ── PRODUCT TYPE ── */}
        <section className="bg-white p-4 rounded-xl shadow space-y-2">
          <h2 className="font-semibold">Product Type *</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
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
              <label
                key={type}
                className="flex items-center border rounded px-3 py-2 hover:bg-gray-50"
              >
                <input
                  type="radio"
                  {...register("productType")}
                  value={type}
                  className="mr-2"
                />
                {type}
              </label>
            ))}
          </div>
          {errors.productType && (
            <p className="text-red-600 text-sm">{errors.productType.message}</p>
          )}

          {watchType === "Other" && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm">Description *</label>
                <input
                  {...register("otherTypeDescription")}
                  className="mt-1 w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm">Quantity *</label>
                <input
                  type="number"
                  {...register("otherTypeQuantity", { valueAsNumber: true })}
                  className="mt-1 w-full border rounded px-2 py-1"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm">Target Price *</label>
                <input
                  {...register("otherTypeTargetPrice")}
                  className="mt-1 w-full border rounded px-2 py-1"
                />
              </div>
            </div>
          )}
        </section>

        {/* ── VENDOR SELECTION ── */}
        <section className="bg-white p-4 rounded-xl shadow space-y-2">
          <h2 className="font-semibold">Select Vendors *</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {vendors.map((v) => (
              <label
                key={v.id}
                className="flex items-center border rounded px-4 py-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  {...register("vendorIds")}
                  value={v.id}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">{v.name}</p>
                  <p className="text-sm text-gray-500">{v.contact_email}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.vendorIds && (
            <p className="text-red-600 text-sm">{errors.vendorIds.message}</p>
          )}
        </section>

        {/* ── URGENCY & DATES ── */}
        <section className="bg-white p-4 rounded-xl shadow grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm">Rep Email *</label>
            <input
              type="email"
              {...register("repEmail")}
              className="mt-1 w-full border rounded px-2 py-1"
            />
            {errors.repEmail && (
              <p className="text-red-600 text-sm">{errors.repEmail.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm">Urgency (1 low – 5 high) *</label>
            <select
              {...register("urgency", { valueAsNumber: true })}
              className="mt-1 w-full border rounded px-2 py-1"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="block text-sm">Date Quote Needed By *</label>
              <input
                type="date"
                {...register("dueDate")}
                className="mt-1 w-full border rounded px-2 py-1"
              />
              {errors.dueDate && (
                <p className="text-red-600 text-sm">{errors.dueDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm">Product Needed By *</label>
              <input
                type="date"
                {...register("productNeededBy")}
                className="mt-1 w-full border rounded px-2 py-1"
              />
              {errors.productNeededBy && (
                <p className="text-red-600 text-sm">
                  {errors.productNeededBy.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── PRODUCTS LINES ── */}
        <section className="bg-white p-4 rounded-xl shadow space-y-2">
          <h2 className="font-semibold">Products *</h2>
          {fields.map((f, idx) => (
            <div key={f.id} className="grid grid-cols-6 gap-4 items-end">
              <div className="col-span-2">
                <select
                  {...register(`products.${idx}.productId`)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Select product</option>
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  {...register(`products.${idx}.quantity`, { valueAsNumber: true })}
                  className="w-full border rounded px-2 py-1"
                  min="1"
                />
              </div>
              <div>
                <input
                  {...register(`products.${idx}.uom`)}
                  className="w-full border rounded px-2 py-1"
                  placeholder="UOM"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-red-500"
              >
                <Trash2 />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ productId: "", quantity: 1, uom: "" })}
            className="flex items-center text-blue-600"
          >
            <PlusCircle className="mr-1" /> Add Product
          </button>
        </section>

        {/* ── INTERNAL NOTES ── */}
        <section className="bg-white p-4 rounded-xl shadow space-y-2">
          <h2 className="font-semibold">Internal Notes for Merchandiser *</h2>
          <textarea
            {...register("internalNotes")}
            rows={4}
            className="w-full border rounded px-2 py-1"
          />
          {errors.internalNotes && (
            <p className="text-red-600 text-sm">
              {errors.internalNotes.message}
            </p>
          )}
        </section>

        {/* ── ACTIONS ── */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border rounded px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-yellow-500 text-white px-4 py-2 rounded shadow"
          >
            Create RFQ
          </button>
        </div>
      </form>
    </div>
  );
}
