"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Boxes, Mail, ShoppingBag, Tag } from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAdminOrdersPage } from "@/services/orderService";
import { getAdminMessagesPage } from "@/services/messageService";
import { getAdminBulkOrdersPage } from "@/services/bulkOrderService";
import { getCouponsPage } from "@/services/couponServices";
import "./admin.css";

const ACTIVITY_ICONS = {
  order: ShoppingBag,
  message: Mail,
  bulk: Boxes,
  coupon: Tag,
};

function getRecentActivity(orders, messages, bulkOrders, coupons) {
  const entries = [
    ...orders.map((order) => ({
      id: `order-${order.id}`,
      type: "order",
      title: "Order received",
      detail: `${order.customer_name || "Customer"} · #${String(order.id).slice(-8)} · ₹${Number(order.final_amount || order.total_amount || 0).toLocaleString("en-IN")}`,
      timestamp: order.created_at,
      status: formatStatus(order.status),
      href: `/admin/orders/${order.id}`,
    })),
    ...messages.map((message) => ({
      id: `message-${message.id}`,
      type: "message",
      title: "Customer message received",
      detail: `${message.name || "Customer"} · ${message.subject || "No subject"}`,
      timestamp: message.created_at,
      status: message.status,
      href: "/admin/messages",
    })),
    ...bulkOrders.map((order) => ({
      id: `bulk-${order.id}`,
      type: "bulk",
      title: "Bulk order enquiry",
      detail: `${order.customer_name || "Customer"} · ${Number(order.quantity) || 0} items`,
      timestamp: order.created_at,
      status: order.status,
      href: `/admin/bulk-orders/${order.id}`,
    })),
    ...coupons.map((coupon) => ({
      id: `coupon-${coupon.id}`,
      type: "coupon",
      title: "Coupon created",
      detail: `${coupon.code} · ${coupon.discount_type === "percentage" ? `${coupon.discount_value}% off` : `₹${coupon.discount_value} off`}`,
      timestamp: coupon.created_at,
      status: !coupon.is_active ? "Inactive" : coupon.is_expired ? "Expired" : "Active",
      href: "/admin/coupons",
    })),
  ];

  return entries
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return (Number.isFinite(timeB) ? timeB : 0) - (Number.isFinite(timeA) ? timeA : 0);
    })
    .slice(0, 8);
}

function formatActivityDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

export default function AdminDashboard() {
  const router = useRouter();

  const [admin, setAdmin] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");

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

        const [
          productsResponse,
          ordersResponse,
          couponsResponse,
        ] = await Promise.all([
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

        /* =========================
           PRODUCTS
        ========================= */

        if (productsResponse.ok) {
          const productsData =
            await productsResponse.json();

          setProducts(
            Array.isArray(productsData)
              ? productsData
              : []
          );
        } else {
          setProducts([]);
        }

        /* =========================
           ORDERS
        ========================= */

        if (ordersResponse.ok) {
          const ordersData =
            await ordersResponse.json();

          setOrders(
            Array.isArray(ordersData)
              ? ordersData
              : []
          );
        } else {
          setOrders([]);
        }

        /* =========================
           COUPONS
        ========================= */

        if (couponsResponse.ok) {
          const couponsData =
            await couponsResponse.json();

          setCoupons(
            Array.isArray(couponsData)
              ? couponsData
              : []
          );
        } else {
          setCoupons([]);
        }
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );

        setProducts([]);
        setOrders([]);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    }

    async function loadRecentActivity() {
      try {
        setActivityLoading(true);
        setActivityError("");
        const [ordersPage, messagesPage, bulkOrdersPage, couponsPage] =
          await Promise.all([
            getAdminOrdersPage({ limit: 8 }),
            getAdminMessagesPage({ limit: 8 }),
            getAdminBulkOrdersPage({ limit: 8 }),
            getCouponsPage({ limit: 8 }),
          ]);

        setActivity(
          getRecentActivity(
            ordersPage.items || [],
            messagesPage.items || [],
            bulkOrdersPage.items || [],
            couponsPage.items || []
          )
        );
      } catch (error) {
        setActivityError(
          error.userMessage ||
            error.response?.data?.detail ||
            "Unable to load recent activity. Please try again."
        );
      } finally {
        setActivityLoading(false);
      }
    }

    loadDashboard();
    loadRecentActivity();
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

          {/* =========================
              QUICK ACTIONS
          ========================= */}

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

              <QuickAction
                href="/admin/hero-slides"
                icon="▧"
                title="Manage Hero Image"
                description="Update the homepage hero image"
              />

            </div>
          </div>

          {/* =========================
              STORE OVERVIEW
          ========================= */}

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
                The latest orders, messages, bulk enquiries and coupons.
              </p>
            </div>

              {activity.length > 0 && (
                <Link
                  href="/admin/orders"
                  className="admin-panel-link"
                >
                  View Orders
                </Link>
              )}

            </div>

            {activityLoading ? (
              <div className="admin-empty-activity">

              <div className="admin-empty-icon">
                ◷
              </div>

              <h3>
                Loading recent activity...
              </h3>

            </div>
          ) : activityError ? (
            <div className="admin-empty-activity" role="alert">
              <div className="admin-empty-icon">!</div>
              <h3>Activity could not be loaded</h3>
              <p>{activityError}</p>
            </div>
          ) : activity.length === 0 ? (
            <div className="admin-empty-activity">

              <div className="admin-empty-icon">
                ◷
              </div>

              <h3>
                No recent activity
              </h3>

              <p>
                New store activity will appear here as it happens.
              </p>

            </div>
          ) : (
            <div className="admin-activity-list">

              {activity.map((item) => {
                const Icon = ACTIVITY_ICONS[item.type];
                return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="admin-activity-item"
                >
                  <span className={`admin-activity-icon admin-activity-icon-${item.type}`}>
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <div className="admin-activity-content">
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <div className="admin-activity-meta">
                    {item.status && (
                      <span className={`admin-activity-status status-${item.status.toLowerCase().replaceAll(" ", "-")}`}>
                        {item.status}
                      </span>
                    )}
                    <time dateTime={item.timestamp}>
                      {formatActivityDate(item.timestamp)}
                    </time>
                  </div>
                </Link>
                );
              })}

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