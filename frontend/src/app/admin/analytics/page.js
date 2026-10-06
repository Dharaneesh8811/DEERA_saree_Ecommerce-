"use client";

import { useEffect, useState } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAnalytics } from "@/services/analyticsService";

import "../admin.css";
import "./analytics.css";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const data = await getAnalytics();

        setAnalytics(data);
      } catch (err) {
        console.error("Analytics loading failed:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load analytics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const overview = analytics?.overview || {};

  const orderStatus = analytics?.order_status || {};

  const salesByCategory =
    analytics?.sales_by_category || [];

  const topProducts =
    analytics?.top_products || [];

  const recentOrders =
    analytics?.recent_orders || [];

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  function formatStatus(status) {
    if (!status) return "-";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  if (loading) {
    return (
      <main className="analytics-page">
        <AdminSidebar />

        <div className="analytics-container">
          <div className="analytics-header">
            <p className="analytics-eyebrow">
              Store Insights
            </p>

            <h1>Analytics</h1>
          </div>

          <div className="analytics-loading">
            Loading analytics...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="analytics-page">
        <AdminSidebar />

        <div className="analytics-container">
          <div className="analytics-header">
            <p className="analytics-eyebrow">
              Store Insights
            </p>

            <h1>Analytics</h1>
          </div>

          <div className="analytics-error">
            <h2>Unable to load analytics</h2>

            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="analytics-page">
      <AdminSidebar />

      <div className="analytics-container">
        {/* HEADER */}

        <div className="analytics-header">
          <p className="analytics-eyebrow">
            Store Insights
          </p>

          <h1>Analytics</h1>

          <p className="analytics-description">
            Overview of your DEERA store performance.
          </p>
        </div>

        {/* OVERVIEW */}

        <section className="analytics-overview">
          <div className="analytics-card">
            <span>Total Products</span>

            <strong>
              {overview.total_products ?? 0}
            </strong>
          </div>

          <div className="analytics-card">
            <span>Total Categories</span>

            <strong>
              {overview.total_categories ?? 0}
            </strong>
          </div>

          <div className="analytics-card">
            <span>Total Orders</span>

            <strong>
              {overview.total_orders ?? 0}
            </strong>
          </div>

          <div className="analytics-card">
            <span>Total Revenue</span>

            <strong>
              {formatCurrency(
                overview.total_revenue
              )}
            </strong>
          </div>

          <div className="analytics-card">
            <span>Average Order Value</span>

            <strong>
              {formatCurrency(
                overview.average_order_value
              )}
            </strong>
          </div>
        </section>

        {/* ORDER STATUS */}

        <section className="analytics-section">
          <div className="analytics-section-header">
            <h2>Order Status</h2>
          </div>

          <div className="status-grid">
            <div className="status-card">
              <span>Placed</span>
              <strong>
                {orderStatus.placed ?? 0}
              </strong>
            </div>

            <div className="status-card">
              <span>Under Review</span>
              <strong>
                {orderStatus.under_review ?? 0}
              </strong>
            </div>

            <div className="status-card">
              <span>Confirmed</span>
              <strong>
                {orderStatus.confirmed ?? 0}
              </strong>
            </div>

            <div className="status-card">
              <span>Shipped</span>
              <strong>
                {orderStatus.shipped ?? 0}
              </strong>
            </div>
          </div>
        </section>

        {/* SALES BY CATEGORY */}

        <section className="analytics-section">
          <div className="analytics-section-header">
            <h2>Sales by Category</h2>
          </div>

          {salesByCategory.length === 0 ? (
            <div className="analytics-empty-small">
              No category sales data available yet.
            </div>
          ) : (
            <div className="analytics-table-wrapper">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Sales</th>
                  </tr>
                </thead>

                <tbody>
                  {salesByCategory.map((item) => (
                    <tr
                      key={item.category}
                    >
                      <td>{item.category}</td>

                      <td>
                        {formatCurrency(item.sales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* TOP PRODUCTS */}

        <section className="analytics-section">
          <div className="analytics-section-header">
            <h2>Top Products</h2>
          </div>

          {topProducts.length === 0 ? (
            <div className="analytics-empty-small">
              No product sales data available yet.
            </div>
          ) : (
            <div className="analytics-table-wrapper">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity Sold</th>
                    <th>Sales</th>
                  </tr>
                </thead>

                <tbody>
                  {topProducts.map((item, index) => (
                    <tr
                      key={`${item.product_name}-${index}`}
                    >
                      <td>{item.product_name}</td>

                      <td>
                        {item.quantity_sold}
                      </td>

                      <td>
                        {formatCurrency(item.sales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* RECENT ORDERS */}

        <section className="analytics-section">
          <div className="analytics-section-header">
            <h2>Recent Orders</h2>
          </div>

          {recentOrders.length === 0 ? (
            <div className="analytics-empty-small">
              No orders available yet.
            </div>
          ) : (
            <div className="analytics-table-wrapper">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        {order.customer_name}
                      </td>

                      <td>
                        {formatCurrency(
                          order.amount
                        )}
                      </td>

                      <td>
                        <span
                          className={`order-status order-status-${order.status}`}
                        >
                          {formatStatus(
                            order.status
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}