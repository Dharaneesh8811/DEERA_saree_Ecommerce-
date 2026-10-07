"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import AdminSidebar from "@/components/admin/AdminSidebar";
import "../../admin.css";

const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "Quoted",
  "Confirmed",
  "Completed",
  "Rejected",
];

export default function BulkOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("dera_admin_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    loadOrder(token);
  }, [router, params.id]);

  async function loadOrder(token) {
    try {
      setLoading(true);
      setError("");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${apiUrl}/api/admin/bulk-orders/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("dera_admin_token");
        localStorage.removeItem("dera_admin");
        router.replace("/admin/login");
        return;
      }

      if (response.status === 404) {
        setError("Bulk order not found.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load bulk order");
      }

      const data = await response.json();

      setOrder(data);
      setStatus(data.status);
    } catch (error) {
      console.error("Bulk order loading error:", error);
      setError("Unable to load bulk order.");
    } finally {
      setLoading(false);
    }
  }

  async function saveStatus() {
    const token = localStorage.getItem("dera_admin_token");

    if (!token || !order) {
      return;
    }

    try {
      setSaving(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${apiUrl}/api/admin/bulk-orders/${order.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("dera_admin_token");
        localStorage.removeItem("dera_admin");
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedOrder = await response.json();

      setOrder(updatedOrder);
      setStatus(updatedOrder.status);
    } catch (error) {
      console.error("Bulk order update error:", error);
      alert("Unable to update bulk order status.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />

        <main className="admin-main">
          <div className="admin-empty-activity">
            <div className="admin-empty-icon">◷</div>
            <h3>Loading bulk order...</h3>
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="admin-layout">
        <AdminSidebar />

        <main className="admin-main">
          <div className="admin-page-header">
            <div>
              <span className="admin-eyebrow">
                BULK ORDERS
              </span>

              <h1>Bulk Order</h1>

              <p>{error || "Bulk order not found."}</p>
            </div>
          </div>

          <Link
            href="/admin/bulk-orders"
            className="admin-panel-link"
          >
            ← Back to Bulk Orders
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">

        {/* =========================
            HEADER
        ========================= */}

        <div className="admin-page-header">

          <div>

            <Link
              href="/admin/bulk-orders"
              className="bulk-back-link"
            >
              ← Back to Bulk Orders
            </Link>

            <span className="admin-eyebrow">
              BULK ORDER REQUEST
            </span>

            <h1>
              {order.customer_name}
            </h1>

            <p>
              Submitted on{" "}
              {formatDateTime(order.created_at)}
            </p>

          </div>

        </div>


        {/* =========================
            STATUS PANEL
        ========================= */}

        <section className="admin-card admin-panel my-4">

          <div className="admin-panel-header">

            <div>
              <h2>Order Status</h2>

              <p>
                Update the progress of this bulk
                order enquiry.
              </p>
            </div>

          </div>

          <div className="bulk-detail-status">

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className={`bulk-status-select status-${status.toLowerCase()}`}
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={saveStatus}
              disabled={
                saving || status === order.status
              }
              className="bulk-save-button"
            >
              {saving ? "Saving..." : "Save Status"}
            </button>

          </div>

        </section>


        {/* =========================
            CUSTOMER DETAILS
        ========================= */}

        <section className="admin-dashboard-grid">

          <div className="admin-card admin-panel">

            <div className="admin-panel-header">
              <div>
                <h2>Customer Details</h2>

                <p>
                  Contact information provided by
                  the customer.
                </p>
              </div>
            </div>

            <div className="bulk-detail-list">

              <DetailItem
                label="Name"
                value={order.customer_name}
              />

              <DetailItem
                label="Company"
                value={order.company_name || "—"}
              />

              <DetailItem
                label="Email"
                value={order.email}
              />

              <DetailItem
                label="Phone"
                value={order.phone}
              />

            </div>

          </div>


          {/* =========================
              REQUIREMENT DETAILS
          ========================= */}

          <div className="admin-card admin-panel">

            <div className="admin-panel-header">
              <div>
                <h2>Order Requirements</h2>

                <p>
                  Customer's bulk order requirements.
                </p>
              </div>
            </div>

            <div className="bulk-detail-list">

              <DetailItem
                label="Product / Category"
                value={
                  order.product_category || "—"
                }
              />

              <DetailItem
                label="Quantity"
                value={`${order.quantity} pieces`}
              />

              <DetailItem
                label="Required Date"
                value={formatDate(
                  order.required_date
                )}
              />

              <DetailItem
                label="Budget"
                value={order.budget || "—"}
              />

            </div>

          </div>

        </section>


        {/* =========================
            MESSAGE
        ========================= */}

        <section className="admin-card admin-panel my-4">

          <div className="admin-panel-header">

            <div>
              <h2>Customer Message</h2>

              <p>
                Additional information provided with
                the request.
              </p>
            </div>

          </div>

          <div className="bulk-message-box">
            {order.message || "No additional message provided."}
          </div>

        </section>


        {/* =========================
            CONTACT ACTIONS
        ========================= */}

        <section className="admin-card admin-panel">

          <div className="admin-panel-header">

            <div>
              <h2>Contact Customer</h2>

              <p>
                Use the customer's contact details to
                discuss the request directly.
              </p>
            </div>

          </div>

          <div className="bulk-contact-actions">

            <a
              href={`mailto:${order.email}`}
              className="bulk-contact-button"
            >
              Email Customer
            </a>

            <a
              href={`tel:${order.phone}`}
              className="bulk-contact-button"
            >
              Call Customer
            </a>

            <a
              href={`https://wa.me/${order.phone.replace(
                /\D/g,
                ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bulk-contact-button"
            >
              WhatsApp Customer
            </a>

          </div>

        </section>

      </main>
    </div>
  );
}


/* =========================
   DETAIL ITEM
========================= */

function DetailItem({ label, value }) {
  return (
    <div className="bulk-detail-item">

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}


/* =========================
   DATE FORMATTERS
========================= */

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}