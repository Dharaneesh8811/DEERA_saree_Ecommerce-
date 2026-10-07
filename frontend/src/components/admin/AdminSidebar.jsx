"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("dera_admin");

      if (storedAdmin) {
        setAdminData(JSON.parse(storedAdmin));
      }
    } catch {
      setAdminData(null);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("dera_admin_token");
    localStorage.removeItem("dera_admin");

    router.replace("/admin/login");
  }

    const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: "▦",
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: "□",
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: "◇",
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: "◫",
    },
    {
      name: "Bulk Orders",
      href: "/admin/bulk-orders",
      icon: "▤",
    },
    {
      name: "Coupons",
      href: "/admin/coupons",
      icon: "%",
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: "↗",
    },
  ];

  function isActive(item) {
    return item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href);
  }

  function handleMobileNavigation() {
    setMobileMenuOpen(false);
  }

  return (
    <>
      {/* ========================================
          MOBILE HEADER
      ======================================== */}
      <div className="admin-mobile-header">
        <span className="admin-mobile-logo">DEERA</span>

        <button
          type="button"
          className="admin-mobile-menu-button"
          onClick={() => setMobileMenuOpen((value) => !value)}
          aria-label="Toggle admin menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? "×" : "☰"}
        </button>
      </div>

      {/* ========================================
          MOBILE MENU
      ======================================== */}
      <div className={`admin-mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <nav>
          {menuItems.map((item) => {
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleMobileNavigation}
                className={`admin-mobile-menu-item ${active ? "active" : ""}`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Profile */}
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid rgba(198, 161, 91, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
            }}
          >
            <div className="admin-profile-icon">
              {adminData?.full_name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="admin-profile-info">
              <strong>{adminData?.full_name || "DEERA Admin"}</strong>

              <span>Administrator</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-mobile-menu-item"
            onClick={handleLogout}
          >
            <span>↪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ========================================
          DESKTOP SIDEBAR
      ======================================== */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <span>DEERA</span>
          <small>ADMIN PANEL</small>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          <p className="admin-nav-title">MENU</p>

          {menuItems.map((item) => {
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${active ? "admin-nav-active" : ""}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="admin-sidebar-bottom">
          <div className="admin-profile">
            <div className="admin-profile-icon">
              {adminData?.full_name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="admin-profile-info">
              <strong>{adminData?.full_name || "DEERA Admin"}</strong>

              <span>Administrator</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
