
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import '../../../components/AuthForm/AuthForm.css';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setNotice('');

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirmPassword') ?? '');

    if (password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    setNotice('Your details could not be submitted right now. Please try again.');
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
          <h2>Create your account</h2>
          <p>Enter your details to join Skillz Directory.</p>
        </div>

        <form onSubmit={handleSubmit}>
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

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            autoComplete="email"
            required
          />

          <label htmlFor="role">Account type</label>
          <select id="role" name="role" defaultValue="resident" required>
            <option value="resident">Resident</option>
            <option value="provider">Service Provider</option>
          </select>

          <label htmlFor="password">Password</label>
          <div className="auth-password-field">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
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

          <label htmlFor="confirmPassword">Confirm password</label>
          <div className="auth-password-field">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() =>
                setShowConfirmPassword((previous) => !previous)
              }
              aria-label={
                showConfirmPassword
                  ? 'Hide confirm password'
                  : 'Show confirm password'
              }
              title={
                showConfirmPassword
                  ? 'Hide confirm password'
                  : 'Show confirm password'
              }
            >
              {showConfirmPassword ? (
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

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {notice && (
            <p className="auth-notice" role="status">
              {notice}
            </p>
          )}

          <button className="auth-submit" type="submit">
            Create account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
