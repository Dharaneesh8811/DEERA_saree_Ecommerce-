"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AdminSidebar from "@/components/admin/AdminSidebar";
import "./admin.css";

export default function AdminDashboard() {
  const router = useRouter();

  const [admin, setAdmin] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("dera_admin_token");
    const storedAdmin = localStorage.getItem("dera_admin");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch {
        setAdmin(null);
      }
    }

    async function loadDashboard() {
      try {
        setLoading(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        const [productsResponse, ordersResponse, couponsResponse] =
          await Promise.all([
            fetch(`${apiUrl}/api/products`),

            fetch(`${apiUrl}/api/admin/orders`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch(`${apiUrl}/api/coupons/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        /* PRODUCTS */

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();

          setProducts(
            Array.isArray(productsData) ? productsData : []
          );
        } else {
          setProducts([]);
        }

        /* ORDERS */

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();

          setOrders(
            Array.isArray(ordersData) ? ordersData : []
          );
        } else {
          setOrders([]);
        }

        /* COUPONS */

        if (couponsResponse.ok) {
          const couponsData = await couponsResponse.json();

          setCoupons(
            Array.isArray(couponsData) ? couponsData : []
          );
        } else {
          setCoupons([]);
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);

        setProducts([]);
        setOrders([]);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  /* =========================
     DASHBOARD CALCULATIONS
  ========================= */

  const totalProducts = products.length;

  const totalOrders = orders.length;

  const activeCoupons = coupons.filter(
    (coupon) => coupon.is_active === true
  ).length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "placed" ||
      order.status === "under_review"
  ).length;

  const revenue = orders
    .filter(
      (order) =>
        order.status === "confirmed" ||
        order.status === "shipped"
    )
    .reduce(
      (total, order) =>
        total + Number(order.final_amount || 0),
      0
    );

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    )
    .slice(0, 5);

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
              OVERVIEW
            </span>

            <h1>Dashboard</h1>

            <p>
              Welcome back,{" "}
              <strong>
                {admin?.full_name || "DEERA Admin"}
              </strong>
              . Here's what's happening with your
              store.
            </p>
          </div>
        </div>

        {/* =========================
            STAT CARDS
        ========================= */}

        <section className="admin-stats-grid">

          <StatCard
            title="Total Products"
            value={
              loading
                ? "..."
                : totalProducts
            }
            subtitle="Products in catalog"
            icon="□"
          />

          <StatCard
            title="Total Orders"
            value={
              loading
                ? "..."
                : totalOrders
            }
            subtitle="Orders received"
            icon="◫"
          />

          <StatCard
            title="Coupons"
            value={
              loading
                ? "..."
                : activeCoupons
            }
            subtitle="Active coupons"
            icon="%"
          />

          <StatCard
            title="Revenue"
            value={
              loading
                ? "..."
                : `₹${revenue.toLocaleString(
                    "en-IN"
                  )}`
            }
            subtitle="Confirmed revenue"
            icon="₹"
          />

        </section>

        {/* =========================
            TWO COLUMN SECTION
        ========================= */}

        <section className="admin-dashboard-grid">

          {/* QUICK ACTIONS */}

          <div className="admin-card admin-panel">

            <div className="admin-panel-header">
              <div>
                <h2>Quick Actions</h2>

                <p>
                  Manage your store quickly.
                </p>
              </div>
            </div>

            <div className="admin-quick-actions">

              <QuickAction
                href="/admin/products"
                icon="□"
                title="Manage Products"
                description="Add, edit or remove products"
              />

              <QuickAction
                href="/admin/orders"
                icon="◫"
                title="Manage Orders"
                description="Review customer orders"
              />

              <QuickAction
                href="/admin/coupons"
                icon="%"
                title="Manage Coupons"
                description="Create and manage discounts"
              />

            </div>
          </div>

          {/* STORE OVERVIEW */}

          <div className="admin-card admin-panel">

            <div className="admin-panel-header">
              <div>
                <h2>Store Overview</h2>

                <p>
                  Current store information.
                </p>
              </div>
            </div>

            <div className="admin-overview-list">

              <OverviewItem
                label="Store Status"
                value="Active"
                active
              />

              <OverviewItem
                label="Product Catalog"
                value={`${totalProducts} Product${
                  totalProducts !== 1
                    ? "s"
                    : ""
                }`}
              />

              <OverviewItem
                label="Pending Orders"
                value={`${pendingOrders} Order${
                  pendingOrders !== 1
                    ? "s"
                    : ""
                }`}
              />

              <OverviewItem
                label="Admin Account"
                value={
                  admin?.email || "Admin"
                }
              />

            </div>
          </div>

        </section>

        {/* =========================
            RECENT ACTIVITY
        ========================= */}

        <section className="admin-card admin-panel admin-recent-panel">

          <div className="admin-panel-header">

            <div>
              <h2>Recent Activity</h2>

              <p>
                Latest orders received by your
                store.
              </p>
            </div>

            {recentOrders.length > 0 && (
              <Link
                href="/admin/orders"
                className="admin-panel-link"
              >
                View All
              </Link>
            )}

          </div>

          {loading ? (
            <div className="admin-empty-activity">

              <div className="admin-empty-icon">
                ◷
              </div>

              <h3>Loading activity...</h3>

            </div>
          ) : recentOrders.length === 0 ? (
            <div className="admin-empty-activity">

              <div className="admin-empty-icon">
                ◷
              </div>

              <h3>No recent activity</h3>

              <p>
                Once you receive orders, they
                will appear here.
              </p>

            </div>
          ) : (
            <div className="admin-recent-orders">

              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="admin-recent-order"
                >

                  <div className="admin-recent-order-main">

                    <strong>
                      {order.customer_name}
                    </strong>

                    <span>
                      Order #
                      {order.id.slice(-8)}
                    </span>

                  </div>

                  <div className="admin-recent-order-meta">

                    <strong>
                      ₹
                      {Number(
                        order.final_amount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    <span
                      className={`admin-order-status status-${order.status}`}
                    >
                      {formatStatus(
                        order.status
                      )}
                    </span>

                  </div>

                </Link>
              ))}

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
   QUICK ACTION
========================= */

function QuickAction({
  href,
  icon,
  title,
  description,
}) {
  return (
    <Link
      href={href}
      className="admin-quick-action"
    >

      <div className="admin-quick-icon">
        {icon}
      </div>

      <div className="admin-quick-content">

        <strong>{title}</strong>

        <span>{description}</span>

      </div>

      <span className="admin-action-arrow">
        →
      </span>

    </Link>
  );
}


/* =========================
   OVERVIEW ITEM
========================= */

function OverviewItem({
  label,
  value,
  active,
}) {
  return (
    <div className="admin-overview-item">

      <span>{label}</span>

      {active ? (
        <strong className="admin-status-active">

          <i></i>

          {value}

        </strong>
      ) : (
        <strong>
          {value}
        </strong>
      )}

    </div>
  );
}


/* =========================
   ORDER STATUS FORMATTER
========================= */

function formatStatus(status) {
  switch (status) {
    case "placed":
      return "Placed";

    case "under_review":
      return "Under Review";

    case "confirmed":
      return "Confirmed";

    case "shipped":
      return "Shipped";

    default:
      return status || "Unknown";
  }
}
