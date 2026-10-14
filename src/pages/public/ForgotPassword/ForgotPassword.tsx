
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import '../../../components/AuthForm/AuthForm.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(
      `The form was submitted for ${email}. Password reset will be available when the backend is connected.`,
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
          <h2>Forgot your password?</h2>
          <p>
            Enter your registered email address to begin the
            password reset process.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="reset-email">Email address</label>
          <input
            id="reset-email"
            name="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          {message && (
            <p className="auth-success" role="status">
              {message}
            </p>
          )}

          <button className="auth-submit" type="submit">
            Reset password
          </button>
        </form>

        <p className="auth-switch">
          Remembered your password?{' '}
          <Link to="/login">Back to login</Link>
        </p>
      </section>
    </main>
  );
}