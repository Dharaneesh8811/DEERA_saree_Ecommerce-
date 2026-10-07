"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AdminSidebar from "@/components/admin/AdminSidebar";
import "../admin.css";

const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "Quoted",
  "Confirmed",
  "Completed",
  "Rejected",
];

export default function AdminBulkOrdersPage() {
  const router = useRouter();

  const [bulkOrders, setBulkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("dera_admin_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    loadBulkOrders(token);
  }, [router]);

  async function loadBulkOrders(token) {
    try {
      setLoading(true);
      setError("");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${apiUrl}/api/admin/bulk-orders`,
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

      if (!response.ok) {
        throw new Error("Failed to load bulk orders");
      }

      const data = await response.json();

      setBulkOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Bulk orders loading error:", error);
      setError("Unable to load bulk orders.");
      setBulkOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    const token = localStorage.getItem("dera_admin_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      setUpdatingId(id);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${apiUrl}/api/admin/bulk-orders/${id}`,
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

      setBulkOrders((current) =>
        current.map((order) =>
          order.id === id ? updatedOrder : order
        )
      );
    } catch (error) {
      console.error("Bulk order status update error:", error);
      alert("Unable to update bulk order status.");
    } finally {
      setUpdatingId(null);
    }
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
            <span className="admin-eyebrow">
              BULK ORDERS
            </span>

            <h1>Bulk Orders</h1>

            <p>
              Review and manage customer bulk order
              enquiries.
            </p>
          </div>
        </div>

        {/* =========================
            SUMMARY
        ========================= */}

        <section className="admin-stats-grid">

          <StatCard
            title="Total Requests"
            value={loading ? "..." : bulkOrders.length}
            subtitle="Bulk enquiries received"
            icon="◫"
          />

          <StatCard
            title="New"
            value={
              loading
                ? "..."
                : countStatus(bulkOrders, "New")
            }
            subtitle="Awaiting contact"
            icon="!"
          />

          <StatCard
            title="Quoted"
            value={
              loading
                ? "..."
                : countStatus(bulkOrders, "Quoted")
            }
            subtitle="Quotes in progress"
            icon="₹"
          />

          <StatCard
            title="Confirmed"
            value={
              loading
                ? "..."
                : countStatus(bulkOrders, "Confirmed")
            }
            subtitle="Confirmed requests"
            icon="✓"
          />

        </section>

        {/* =========================
            BULK ORDERS TABLE
        ========================= */}

        <section className="admin-card admin-panel">

          <div className="admin-panel-header">

            <div>
              <h2>Bulk Order Requests</h2>

              <p>
                Customer enquiries submitted through
                the website.
              </p>
            </div>

          </div>

          {loading ? (
            <div className="admin-empty-activity">
              <div className="admin-empty-icon">
                ◷
              </div>

              <h3>Loading bulk orders...</h3>
            </div>
          ) : error ? (
            <div className="admin-empty-activity">

              <div className="admin-empty-icon">
                !
              </div>

              <h3>{error}</h3>

              <button
                type="button"
                onClick={() =>
                  loadBulkOrders(
                    localStorage.getItem(
                      "dera_admin_token"
                    )
                  )
                }
                className="admin-panel-link"
              >
                Try Again
              </button>

            </div>
          ) : bulkOrders.length === 0 ? (
            <div className="admin-empty-activity">

              <div className="admin-empty-icon">
                ◫
              </div>

              <h3>No bulk orders yet</h3>

              <p>
                Customer bulk order enquiries will
                appear here.
              </p>

            </div>
          ) : (
            <div className="bulk-orders-table-wrapper">

              <table className="bulk-orders-table">

                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Company</th>
                    <th>Product / Category</th>
                    <th>Quantity</th>
                    <th>Required Date</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>

                  {bulkOrders.map((order) => (
                    <tr key={order.id}>

                      {/* CUSTOMER */}

                      <td>
                        <div className="bulk-customer">

                          <strong>
                            {order.customer_name}
                          </strong>

                          <span>
                            {order.email}
                          </span>

                          <span>
                            {order.phone}
                          </span>

                        </div>
                      </td>

                      {/* COMPANY */}

                      <td>
                        {order.company_name || "—"}
                      </td>

                      {/* PRODUCT */}

                      <td>
                        {order.product_category || "—"}
                      </td>

                      {/* QUANTITY */}

                      <td>
                        <strong>
                          {order.quantity}
                        </strong>
                      </td>

                      {/* REQUIRED DATE */}

                      <td>
                        {formatDate(
                          order.required_date
                        )}
                      </td>

                      {/* BUDGET */}

                      <td>
                        {order.budget || "—"}
                      </td>

                      {/* STATUS */}

                      <td>

                        <select
                          value={order.status}
                          disabled={
                            updatingId === order.id
                          }
                          onChange={(event) =>
                            updateStatus(
                              order.id,
                              event.target.value
                            )
                          }
                          className={`bulk-status-select status-${order.status.toLowerCase()}`}
                        >
                          {STATUS_OPTIONS.map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            )
                          )}
                        </select>

                      </td>

                      {/* DETAILS */}

                      <td>
                        <Link
                          href={`/admin/bulk-orders/${order.id}`}
                          className="admin-panel-link"
                        >
                          View
                        </Link>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}


/* =========================
   STAT CARD
========================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
}) {
  return (
    <div className="admin-stat-card">

      <div className="admin-stat-top">

        <span>{title}</span>

        <div className="admin-stat-icon">
          {icon}
        </div>

      </div>

      <strong>{value}</strong>

      <p>{subtitle}</p>

    </div>
  );
}


/* =========================
   HELPERS
========================= */

function countStatus(orders, status) {
  return orders.filter(
    (order) => order.status === status
  ).length;
}

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