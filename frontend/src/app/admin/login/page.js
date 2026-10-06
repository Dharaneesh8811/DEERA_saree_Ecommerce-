"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  UserRound,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { loginAdmin } from "@/services/authService";
import "./login.css";

export default function AdminLoginPage() {
  const router = useRouter();

  const [loginType, setLoginType] = useState("customer");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdminLogin(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { access_token, admin } = await loginAdmin(
        email,
        password
      );

      localStorage.setItem(
        "dera_admin_token",
        access_token
      );

      localStorage.setItem(
        "dera_admin",
        JSON.stringify(admin)
      );

      router.push("/admin");
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Invalid email or password."
          : "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCustomerContinue() {
    router.push("/");
  }

  function changeLoginType(type) {
    setLoginType(type);
    setError("");
  }

  return (
    <main className="admin-login-page">

      {/* Decorative background elements */}
      <div className="login-decoration login-decoration-left" />
      <div className="login-decoration login-decoration-right" />

      <div className="admin-login-card">

        {/* BRAND */}

        <div className="admin-login-header">

          <div className="login-brand">
            <span className="login-brand-line" />
            <span>DEERA</span>
            <span className="login-brand-line" />
          </div>

          <p className="login-overline">
            SILK · HERITAGE · ELEGANCE
          </p>

          <h1>Welcome</h1>

          <p className="login-description">
            Continue as a customer or access your
            administration panel.
          </p>

        </div>

        {/* LOGIN TYPE SWITCH */}

        <div className="login-type-switch">

          <button
            type="button"
            className={`login-type-button ${
              loginType === "customer"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changeLoginType("customer")
            }
          >
            <UserRound size={17} />

            <span>Customer</span>
          </button>

          <button
            type="button"
            className={`login-type-button ${
              loginType === "admin"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changeLoginType("admin")
            }
          >
            <ShieldCheck size={17} />

            <span>Admin</span>
          </button>

        </div>

        {/* CUSTOMER */}

        {loginType === "customer" && (
          <div className="customer-login-content">

            <div className="customer-icon-wrapper">
              <div className="customer-icon">
                <UserRound size={27} />
              </div>

              <span className="customer-icon-dot" />
            </div>

            <p className="content-eyebrow">
              WELCOME TO DEERA
            </p>

            <h2>
              Shop with DEERA
            </h2>

            <p className="customer-description">
              No account is required. Continue
              directly to our collection and
              discover your perfect silk saree.
            </p>

            <button
              type="button"
              className="admin-login-button customer-button"
              onClick={handleCustomerContinue}
            >
              <span>Continue to Home</span>

              <ArrowRight size={18} />
            </button>

            <div className="login-trust-note">
              <Sparkles size={13} />
              <span>
                Discover timeless silk craftsmanship
              </span>
            </div>

          </div>
        )}

        {/* ADMIN */}

        {loginType === "admin" && (
          <form
            className="admin-login-form"
            onSubmit={handleAdminLogin}
          >

            <div className="admin-login-form-heading">

              <div className="admin-form-icon">
                <ShieldCheck size={21} />
              </div>

              <div>
                <p className="content-eyebrow">
                  ADMINISTRATION
                </p>

                <h2>
                  Sign in to DEERA
                </h2>
              </div>

            </div>

            <div className="admin-form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

            <div className="admin-form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="password-input-wrapper">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {error && (
              <div className="admin-login-error">
                <span className="error-icon">
                  !
                </span>

                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="admin-security-note">
              <ShieldCheck size={14} />

              <span>
                Secure administrator access
              </span>
            </div>

          </form>
        )}

        {/* FOOTER */}

        <div className="login-footer">
          <span />
          <p>
            Heritage, reimagined.
          </p>
          <span />
        </div>

      </div>

    </main>
  );
}