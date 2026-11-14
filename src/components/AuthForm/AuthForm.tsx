
import axios from 'axios';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AuthForm.css';
import { useAuth } from '../../hooks/useAuth';
import { loginUser, registerUser } from '../../services/authService';

type AuthFormProps = {
  role: 'resident' | 'provider';
  mode: 'login' | 'register';
};

export default function AuthForm({ role, mode }: AuthFormProps) {
  const isRegister = mode === 'register';
  const roleName = role === 'resident' ? 'Resident' : 'Service Provider';
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get('fullName') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirmPassword') ?? '');

    if (isRegister && password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    try {
      if (isRegister) {
        await registerUser({ fullName, phone, email, password, role });
        setMessage('Successfully registered! You may log in.');
        setTimeout(() => {
          navigate(`/${role}/login`, {
            state: { registrationSuccess: true },
          });
        }, 1500);
        return;
      }

      const { user, accessToken, token } = await loginUser({
        email,
        password,
        role,
      });
      setUser(user, accessToken ?? token);

      const returnTo = (location.state as { from?: unknown } | null)?.from;
      if (typeof returnTo === 'string' && returnTo.startsWith('/')) {
        navigate(returnTo, { replace: true });
        return;
      }

      if (user.role === 'resident') {
        navigate('/', { replace: true });
      } else {
        navigate('/provider/messages', { replace: true });
      }
    } catch (requestError: unknown) {
      const responseMessage = axios.isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : undefined;
      setError(
        responseMessage ??
          (requestError instanceof Error
            ? requestError.message
            : 'The request could not be completed. Please try again.'),
      );
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
