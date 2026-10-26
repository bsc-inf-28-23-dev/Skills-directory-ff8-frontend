
import { Link } from 'react-router-dom';
import '../../../components/AuthForm/AuthForm.css';

export default function Login() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">S</div>
          <h1>Skillz Directory</h1>
          <p>Find the right skills. Connect with the right people.</p>
        </div>

        <div className="auth-heading">
          <h2>Welcome back!</h2>
          <p>Choose your account type to sign in.</p>
        </div>

        <div className="auth-role-options">
          <Link className="auth-role-card" to="/resident/login">
            <span className="auth-role-icon">🏠</span>

            <span>
              <strong>Resident</strong>
              <small>Find and connect with service providers.</small>
            </span>

            <span className="auth-role-arrow" aria-hidden="true">
              →
            </span>
          </Link>

          <Link className="auth-role-card" to="/provider/login">
            <span className="auth-role-icon">🛠️</span>

            <span>
              <strong>Service Provider</strong>
              <small>Showcase your skills and manage your services.</small>
            </span>

            <span className="auth-role-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        <p className="auth-switch">
          New to Skillz Directory?{' '}
          <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
