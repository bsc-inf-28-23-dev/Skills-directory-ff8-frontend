
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import '../../components/AuthForm/AuthForm.css';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setNotice('');

    if (!currentPassword || !newPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Your new password must contain at least 8 characters.');
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        'Your new password must be different from your current password.',
      );
      return;
    }

    setNotice(
      'Password updating is not connected to the backend yet. Your password has not been changed.',
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-brand">
          <div className="auth-logo">SD</div>
          <h1>Skillz Directory</h1>
          <p>Find the right skills. Connect with the right people.</p>
        </header>

        <div className="auth-heading">
          <h2>Change Password</h2>
          <p>Update your password to keep your account secure.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="currentPassword">Current Password</label>

          <div className="auth-password-field">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() =>
                setShowCurrentPassword((previous) => !previous)
              }
              aria-label={
                showCurrentPassword
                  ? 'Hide current password'
                  : 'Show current password'
              }
              title={
                showCurrentPassword
                  ? 'Hide current password'
                  : 'Show current password'
              }
            >
              {showCurrentPassword ? (
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

          <label htmlFor="newPassword">New Password</label>

          <div className="auth-password-field">
            <input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Enter your new password"
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowNewPassword((previous) => !previous)}
              aria-label={
                showNewPassword
                  ? 'Hide new password'
                  : 'Show new password'
              }
              title={
                showNewPassword
                  ? 'Hide new password'
                  : 'Show new password'
              }
            >
              {showNewPassword ? (
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
            Update Password
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/">Back to home</Link>
        </p>
      </section>
    </main>
  );
}
