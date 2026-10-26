
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthForm.css';
import { mockUsers } from '../../data/mockUsers';

type AuthFormProps = {
  role: 'resident' | 'provider';
  mode: 'login' | 'register';
};

export default function AuthForm({ role, mode }: AuthFormProps) {
  const isRegister = mode === 'register';
  const roleName = role === 'resident' ? 'Resident' : 'Service Provider';
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirmPassword') ?? '');

    // Registration validation
    if (isRegister) {
      if (password !== confirmPassword) {
        setError('Your passwords do not match.');
        return;
      }

      setMessage('Registration form validated successfully.');
      return;
    }

    // Check login credentials against mock users
    const matchedUser = mockUsers.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.password === password &&
        user.role === role,
    );

    if (!matchedUser) {
      setError('Invalid email or password for this account type.');
      return;
    }

    // Navigate to the dashboard for the user's role
    if (matchedUser.role === 'resident') {
      navigate('/resident/dashboard');
    } else {
      navigate('/provider/dashboard');
    }
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
          <h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2>
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
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={8}
              required
            />

            <button
              type="button"
              className="auth-show-password"
              onClick={() => setShowPassword((previous) => !previous)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {isRegister && (
            <>
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </>
          )}

          {!isRegister && (
            <div className="auth-form-options">
              <label className="auth-checkbox">
                <input type="checkbox" name="rememberMe" />
                Remember me
              </label>

              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          )}

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="auth-success" role="status">
              {message}
            </p>
          )}

          <button className="auth-submit" type="submit">
            {isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister
            ? 'Already have an account?'
            : "Don't have an account?"}{' '}

          <Link to={isRegister ? `/${role}/login` : `/${role}/register`}>
            {isRegister ? 'Sign in' : 'Create account'}
          </Link>
        </p>

        <p className="auth-role-note">
          Account type: <strong>{roleName}</strong>
        </p>
      </section>
    </main>
  );
}
