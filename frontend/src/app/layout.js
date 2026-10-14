"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const isAdminPage = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" />
        <title>Deera Silks</title>
        <meta
          name="description"
          content="Traditional silk sarees crafted for generations."
        />
      </head>

      <body>
        {!isAdminPage && <Header />}

        {children}

        {!isAdminPage && <Footer />}

        {!isAdminPage && <WhatsAppButton />}
      </body>
    </html>
  );
}