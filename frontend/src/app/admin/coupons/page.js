"use client";

import { useEffect, useState } from "react";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/services/couponServices";

import AdminSidebar from "@/components/admin/AdminSidebar";
import "./coupons.css";
import "../admin.css";

const emptyForm = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  minimum_order_amount: "",
  maximum_discount_amount: "",
  start_date: "",
  end_date: "",
  usage_limit: "",
  is_active: true,
};

function formatDateForInput(date) {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
  if (!date) return "-";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "-";

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadCoupons() {
    try {
      setLoading(true);
      setError("");

      const data = await getCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.userMessage ||
          err.response?.data?.detail ||
          "Failed to load coupons."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function openCreateForm() {
    setEditingCoupon(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(coupon) {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code || "",
      discount_type: coupon.discount_type || "percentage",
      discount_value: coupon.discount_value || "",
      minimum_order_amount: coupon.minimum_order_amount || "",
      maximum_discount_amount: coupon.maximum_discount_amount || "",
      start_date: formatDateForInput(coupon.start_date),
      end_date: formatDateForInput(coupon.end_date),
      usage_limit: coupon.usage_limit ?? "",
      is_active: coupon.is_active ?? true,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingCoupon(null);
    setForm(emptyForm);
    setError("");
  }

  function buildPayload() {
    return {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      minimum_order_amount: Number(form.minimum_order_amount || 0),
      maximum_discount_amount: Number(
        form.maximum_discount_amount || 0
      ),
      start_date: new Date(
        `${form.start_date}T00:00:00`
      ).toISOString(),
      end_date: new Date(
        `${form.end_date}T23:59:59`
      ).toISOString(),
      usage_limit: Number(form.usage_limit),
      is_active: form.is_active,
    };
  }

  function validateForm() {
    if (!form.code.trim()) {
      return "Coupon code is required.";
    }

    if (!form.discount_value || Number(form.discount_value) <= 0) {
      return "Discount value must be greater than 0.";
    }

    if (!form.start_date || !form.end_date) {
      return "Start date and end date are required.";
    }

    if (new Date(form.end_date) < new Date(form.start_date)) {
      return "End date cannot be before start date.";
    }

    if (!form.usage_limit || Number(form.usage_limit) <= 0) {
      return "Usage limit must be greater than 0.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = buildPayload();

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
        setSuccess("Coupon updated successfully.");
      } else {
        await createCoupon(payload);
        setSuccess("Coupon created successfully.");
      }

      await loadCoupons();

      setShowForm(false);
      setEditingCoupon(null);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err.userMessage ||
          err.response?.data?.detail ||
          "Failed to save coupon."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(coupon) {
    const confirmed = window.confirm(
      `Delete coupon "${coupon.code}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(coupon.id);
      setError("");
      setSuccess("");

      await deleteCoupon(coupon.id);

      setCoupons((current) =>
        current.filter((item) => item.id !== coupon.id)
      );

      setSuccess(`Coupon "${coupon.code}" deleted successfully.`);
    } catch (err) {
      setError(
        err.userMessage ||
          err.response?.data?.detail ||
          "Failed to delete coupon."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleStatus(coupon) {
    try {
      setError("");
      setSuccess("");

      await updateCoupon(coupon.id, {
        is_active: !coupon.is_active,
      });

      setCoupons((current) =>
        current.map((item) =>
          item.id === coupon.id
            ? { ...item, is_active: !item.is_active }
            : item
        )
      );

      setSuccess(
        `Coupon "${coupon.code}" is now ${
          !coupon.is_active ? "active" : "inactive"
        }.`
      );
    } catch (err) {
      setError(
        err.userMessage ||
          err.response?.data?.detail ||
          "Failed to update coupon status."
      );
    }
  }

  return (
    <main className="coupons-page">
    <AdminSidebar />

      <div className="coupons-container">
        <div className="coupons-header">
          <div>
            <p className="coupons-eyebrow">Promotion Management</p>

            <h1>Coupons</h1>

            <p className="coupons-description">
              Create and manage discount coupons for your customers.
            </p>
          </div>

          <button
            type="button"
            className="coupon-primary-button"
            onClick={openCreateForm}
          >
            + Add Coupon
          </button>
        </div>

        {success && (
          <div className="coupon-message coupon-success">
            {success}
          </div>
        )}

        {error && (
          <div className="coupon-message coupon-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="coupon-empty">
            <p>Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="coupon-empty">
            <h2>No coupons yet</h2>
            <p>Create your first coupon to get started.</p>

            <button
              type="button"
              className="coupon-primary-button"
              onClick={openCreateForm}
            >
              Add Coupon
            </button>
          </div>
        ) : (
          <div className="coupon-table-card">
            <div className="coupon-table-wrapper">
              <table className="coupon-table">
                <thead>
                  <tr>
                    <th>Coupon</th>
                    <th>Discount</th>
                    <th>Minimum Order</th>
                    <th>Max Discount</th>
                    <th>Usage</th>
                    <th>Validity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td>
                        <div className="coupon-code">
                          {coupon.code}
                        </div>

                        {/* <div className="coupon-id">
                          {coupon.id}
                        </div> */}
                      </td>

                      <td>
                        <strong>
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}%`
                            : `₹${Number(
                                coupon.discount_value
                              ).toLocaleString("en-IN")}`}
                        </strong>
                      </td>

                      <td>
                        ₹
                        {Number(
                          coupon.minimum_order_amount || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>
                        ₹
                        {Number(
                          coupon.maximum_discount_amount || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>
                        {coupon.used_count || 0}
                        {" / "}
                        {coupon.usage_limit}
                      </td>

                      <td>
                        <div className="coupon-dates">
                          <span>
                            {formatDisplayDate(coupon.start_date)}
                          </span>

                          <span>
                            {formatDisplayDate(coupon.end_date)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`coupon-status ${
                            coupon.is_active
                              ? "active"
                              : "inactive"
                          }`}
                          onClick={() =>
                            handleToggleStatus(coupon)
                          }
                        >
                          {coupon.is_active
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>

                      <td>
                        <div className="coupon-actions">
                          <button
                            type="button"
                            className="coupon-action edit"
                            onClick={() =>
                              openEditForm(coupon)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="coupon-action delete"
                            disabled={deletingId === coupon.id}
                            onClick={() =>
                              handleDelete(coupon)
                            }
                          >
                            {deletingId === coupon.id
                              ? "..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showForm && (
          <div className="coupon-modal-overlay">
            <div className="coupon-modal">
              <div className="coupon-modal-header">
                <div>
                  <p className="coupons-eyebrow">
                    {editingCoupon
                      ? "Update Coupon"
                      : "New Coupon"}
                  </p>

                  <h2>
                    {editingCoupon
                      ? "Edit Coupon"
                      : "Create Coupon"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="coupon-close"
                  onClick={closeForm}
                  disabled={saving}
                >
                  ×
                </button>
              </div>

              <form
                className="coupon-form"
                onSubmit={handleSubmit}
              >
                <div className="coupon-form-grid">
                  <label>
                    Coupon Code
                    <input
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      placeholder="EXAMPLE10"
                      disabled={saving}
                    />
                  </label>

                  <label>
                    Discount Type
                    <select
                      name="discount_type"
                      value={form.discount_type}
                      onChange={handleChange}
                      disabled={saving}
                    >
                      <option value="percentage">
                        Percentage
                      </option>
                      <option value="fixed">
                        Fixed Amount
                      </option>
                    </select>
                  </label>

                  <label>
                    Discount Value
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="discount_value"
                      value={form.discount_value}
                      onChange={handleChange}
                      placeholder="10"
                      disabled={saving}
                    />
                  </label>

                  <label>
                    Minimum Order Amount
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="minimum_order_amount"
                      value={form.minimum_order_amount}
                      onChange={handleChange}
                      placeholder="500"
                      disabled={saving}
                    />
                  </label>

                  <label>
                    Maximum Discount Amount
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="maximum_discount_amount"
                      value={form.maximum_discount_amount}
                      onChange={handleChange}
                      placeholder="200"
                      disabled={saving}
                    />
                  </label>

                  <label>
                    Usage Limit
                    <input
                      type="number"
                      min="1"
                      name="usage_limit"
                      value={form.usage_limit}
                      onChange={handleChange}
                      placeholder="10"
                      disabled={saving}
                    />
                  </label>

                  <label>
                    Start Date
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      disabled={saving}
                    />
                  </label>

                  <label>
                    End Date
                    <input
                      type="date"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      disabled={saving}
                    />
                  </label>
                </div>

                <label className="coupon-active-field">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    disabled={saving}
                  />

                  <span>Coupon is active</span>
                </label>

                {error && (
                  <div className="coupon-message coupon-error">
                    {error}
                  </div>
                )}

                <div className="coupon-form-actions">
                  <button
                    type="button"
                    className="coupon-secondary-button"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="coupon-primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingCoupon
                      ? "Update Coupon"
                      : "Create Coupon"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}