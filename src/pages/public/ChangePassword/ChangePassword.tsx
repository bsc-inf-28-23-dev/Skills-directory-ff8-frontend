import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';

import '../../../components/AuthForm/AuthForm.css';
import './ChangePassword.css';

type ChangePasswordProps = {
  role: 'resident' | 'provider';
};

export default function ChangePassword({ role }: ChangePasswordProps) {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const accountName =
    role === 'resident' ? 'Resident' : 'Service Provider';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setNotice('');

    if (currentPassword === newPassword) {
      setError('Your new password must be different from your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Your new password must contain at least 8 characters.');
      return;
    }

    // Backend integration will be added when the API is available.
    // Passwords are not stored in localStorage or anywhere else.

    setNotice(
      'Your form is valid, but password changes are not connected to the backend yet. Your password has not been changed.',
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card change-password-card">
        <header className="auth-brand">
          <div className="auth-logo">
            <LockKeyhole size={25} />
          </div>

          <h1>Skillz Directory</h1>

          <p>Find the right skills. Connect with the right people.</p>
        </header>

        <div className="auth-heading">
          <h2>Change password</h2>

          <p>
            Update the password for your {accountName.toLowerCase()} account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="currentPassword">Current password</label>

          <div className="auth-password-field">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Enter your current password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
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
            >
              {showCurrentPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <label htmlFor="newPassword">New password</label>

          <div className="auth-password-field">
            <input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter your new password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
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
            >
              {showNewPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <p className="change-password-hint">
            Your new password must contain at least 8 characters.
          </p>

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
            Update password
          </button>
        </form>

        <div className="change-password-footer">
          <button
            type="button"
            className="change-password-back"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          <Link to="/login">Sign in</Link>
        </div>
      </section>
    </main>
  );
}