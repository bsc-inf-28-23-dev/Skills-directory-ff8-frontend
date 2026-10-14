
import { Link } from 'react-router-dom';
import '../../../components/AuthForm/AuthForm.css';

export default function Register() {
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
          <p>Choose the type of account you want to create.</p>
        </div>

        <div className="auth-role-options">
          <Link className="auth-role-card" to="/resident/register">
            <span className="auth-role-icon">🏠</span>
            <span>
              <strong>Resident</strong><br />
              <small>Find and connect with service providers.</small>
            </span>
            <span className="auth-role-arrow"></span> <br />
          </Link>
            <br />
          <Link className="auth-role-card" to="/provider/register">
            <span className="auth-role-icon">🛠️</span>
            <span>
              <strong>Service Provider</strong><br />
              <small>Showcase your skills and manage your services.</small>
            </span>
            <span className="auth-role-arrow"></span>
          </Link>
        </div>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
