import { useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import type { UserRole } from "../../types";
import "./AuthForm.css";

type AuthFormProps = {
  role?: "resident" | "provider";
  mode: "login" | "register";
};

function getErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function getHomePath(role: UserRole) {
  if (role === "provider") return "/provider/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/resident/dashboard";
}

export default function AuthForm({ role, mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const roleName = role
    ? role === "resident"
      ? "Resident"
      : "Service Provider"
    : "Skillz Directory";
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(() => {
    const navigationState = location.state as { logoutError?: unknown } | null;
    return typeof navigationState?.logoutError === "string"
      ? navigationState.logoutError
      : "";
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("fullName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const formRole = formData.get("role");
    const selectedRole =
      role ??
      (formRole === "resident" || formRole === "provider" ? formRole : undefined);

    try {
      if (isRegister) {
        const confirmPassword = String(formData.get("confirmPassword") ?? "");
        if (!selectedRole) {
          setError("Select an account type before creating an account.");
          return;
        }
        if (password !== confirmPassword) {
          setError("Your passwords do not match.");
          return;
        }

        await api.post("/auth/register", {
          fullName,
          email,
          phone,
          password,
          role: selectedRole,
        });
        setMessage("Registration successful. You can now sign in.");
        return;
      }

      const authenticatedUser = await login(email, password);
      const returnTo = (location.state as { from?: unknown } | null)?.from;
      if (
        typeof returnTo === "string" &&
        returnTo.startsWith("/") &&
        !returnTo.startsWith("//")
      ) {
        navigate(returnTo, { replace: true });
        return;
      }
      navigate(getHomePath(authenticatedUser.role), { replace: true });
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  const loginPath = role ? `/${role}/login` : "/login";
  const registerPath = role ? `/${role}/register` : "/register";

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-brand">
          <div className="auth-logo">S</div>
          <h1>Skillz Directory</h1>
          <p>Find the right skills. Connect with the right people.</p>
        </header>

        <div className="auth-heading">
          <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
          <p>
            {isRegister
              ? `Register as a ${roleName.toLowerCase()}.`
              : role
                ? `Sign in to your ${roleName.toLowerCase()} account.`
                : "Sign in and we will open the right workspace for your account."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              {!role && (
                <>
                  <label htmlFor="role">Account type</label>
                  <select id="role" name="role" defaultValue="" required>
                    <option value="" disabled>
                      Choose your account type
                    </option>
                    <option value="resident">Resident</option>
                    <option value="provider">Service provider</option>
                  </select>
                </>
              )}
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                autoComplete="tel"
                required
              />
            </>
          )}

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <div className="auth-password-field">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
            />
            <button
              type="button"
              className="auth-show-password"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {isRegister && (
            <>
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
              />
            </>
          )}

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="auth-success" role="status">
              {message} <Link to={loginPath}>Sign in</Link>
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <Link to={isRegister ? loginPath : registerPath}>
            {isRegister ? "Sign in" : "Create account"}
          </Link>
        </p>

        {role && (
          <p className="auth-role-note">
            Account type: <strong>{roleName}</strong>
          </p>
        )}
      </section>
    </main>
  );
}
