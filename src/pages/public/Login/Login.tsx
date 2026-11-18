
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import '../../../components/AuthForm/AuthForm.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setNotice(
      'Login is not connected to the backend yet. Your details have not been submitted.',
    );
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
          <h2>Welcome back!</h2>
          <p>Sign in to your Skillz Directory account.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>

          <div className="auth-password-field">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                  <path d="M9.9 5.2A11.8 11.8 0 0112 5c5.5 0 9 7 9 7a14.5 14.5 0 01-3.1 3.8" />
                  <path d="M6.2 6.2C3.9 7.7 3 12 3 12s3.5 7 9 7a10.8 10.8 0 004-.8" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <div className="auth-form-options">
            <label className="auth-checkbox">
              <input type="checkbox" name="rememberMe" />
              Remember me
            </label>

            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          {notice && (
            <p className="auth-notice" role="status">
              {notice}
            </p>
          )}

          <button className="auth-submit" type="submit">
            Sign in
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create account</Link>
        </p>
      </section>
    </main>
  );
}
