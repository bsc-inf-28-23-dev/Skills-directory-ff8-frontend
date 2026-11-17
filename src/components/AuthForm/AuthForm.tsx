import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom"; // Link removed from import
import "./AuthForm.css";
import api from "../../services/api"; // Import the real Axios instance

type AuthFormProps = {
  role: "resident" | "provider";
  mode: "login" | "register";
};

export default function AuthForm({ role, mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const roleName = role === "resident" ? "Resident" : "Service Provider";
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("fullName") ?? "");
    const phone = String(formData.get("phone") ?? "");

    try {
      if (isRegister) {
        const confirmPassword = String(formData.get("confirmPassword") ?? "");
        if (password !== confirmPassword) {
          throw new Error("Your passwords do not match.");
        }
        
        // Real Backend Registration
        await api.post("/auth/register", { 
          fullName, 
          email, 
          phone, 
          password, 
          role 
        });
        setMessage("Registration successful! You can now log in.");
        
      } else {
        // Real Backend Login
        await api.post("/auth/login", { email, password });
        
        // Navigate based on the role
        if (role === "resident") navigate("/resident/dashboard");
        else navigate("/provider/dashboard");
      }
    } catch (err: any) {
      // Show the error message sent by the backend
      setError(err.response?.data?.message || err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
              : `Sign in to your ${roleName.toLowerCase()} account.`}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" type="text" placeholder="Enter your full name" required />

              <label htmlFor="phone">Phone number</label>
              <input id="phone" name="phone" type="tel" placeholder="Enter your phone number" required />
            </>
          )}

          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" placeholder="Enter your email" required />

          <label htmlFor="password">Password</label>
          <div className="auth-password-field">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="auth-show-password"
              onClick={() => setShowPassword((prev) => !prev)}
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
                required
              />
            </>
          )}

          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <a href={isRegister ? (role === "resident" ? "/resident/login" : "/provider/login") : (role === "resident" ? "/resident/register" : "/provider/register")}>
            {isRegister ? "Sign in" : "Create account"}
          </a>
        </p>
      </section>
    </main>
  );
}