"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import HeroManager from "@/components/admin/HeroManager";
import "../admin.css";
import "./hero-image.css";

export default function AdminHeroImagePage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("dera_admin_token")) {
      router.replace("/admin/login");
      return;
    }
    setAuthorized(true);
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <HeroManager />
      </main>
    </div>
  );
}
