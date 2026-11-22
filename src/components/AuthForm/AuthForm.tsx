import axios from 'axios';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AuthForm.css';
import { useAuth } from '../../hooks/useAuth';
import { loginUser, registerUser } from '../../services/authService';
import type { User } from '../../types';

type AuthFormProps = {
  role?: 'resident' | 'provider';
  mode: 'login' | 'register';
};

export default function AuthForm({ role, mode }: AuthFormProps) {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function finishSignIn(user: User, accessToken?: string) {
    (setUser as any)(user, accessToken);
    const returnTo = (location.state as { from?: unknown } | null)?.from;
    if (typeof returnTo === 'string' && returnTo.startsWith('/')) {
      navigate(returnTo, { replace: true });
      return;
    }
    const destination =
      user.role === 'provider' ? '/provider/dashboard'
      : user.role === 'admin' ? '/admin/dashboard'
      : '/resident/dashboard';
    navigate(destination, { replace: true });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get('fullName') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirmPassword') ?? '');
    const selectedRole = formData.get('role') === 'provider' ? 'provider' : 'resident';

    if (isRegister && password !== confirmPassword) {
      setError('Your passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        // The backend expects `name`, not `fullName`
        await registerUser({
          name: fullName,
          phone,
          email,
          password,
          role: selectedRole,
        });
        setMessage('Successfully registered! You may log in.');
        setTimeout(() => {
          navigate('/login', { replace: true, state: { registrationSuccess: true } });
        }, 1500);
        return;
      }

      const { user, accessToken, token } = await loginUser({ email, password });
      finishSignIn(user, accessToken ?? token);
    } catch (requestError: unknown) {
      const responseMessage = axios.isAxiosError<{ message?: string | string[] }>(requestError)
        ? requestError.response?.data?.message
        : undefined;

      const readableMessage = Array.isArray(responseMessage)
        ? responseMessage.join(' ')
        : responseMessage;

      setError(
        readableMessage ??
          (requestError instanceof Error
            ? requestError.message
            : 'The request could not be completed. Please try again.'),
      );
    } finally {
      setLoading(false);
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
              ? 'Create an account to get started with Skillz Directory.'
              : 'Sign in to your Skillz Directory account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" type="text" placeholder="Enter your full name" autoComplete="name" required />

              <label htmlFor="phone">Phone number</label>
              <input id="phone" name="phone" type="tel" placeholder="Enter your phone number" autoComplete="tel" required />

              <label htmlFor="role">Account type</label>
              <select id="role" name="role" defaultValue="resident">
                <option value="resident">Resident</option>
                <option value="provider">Service Provider</option>
              </select>
            </>
          )}

          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" placeholder="Enter your email" autoComplete="email" required />

          <label htmlFor="password">Password</label>
          <div className="auth-password-field">
            <input
              id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
              autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={8} required
            />
            <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(p => !p)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {isRegister && (
            <>
              <label htmlFor="confirmPassword">Confirm password</label>
              <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Re-enter your password" autoComplete="new-password" minLength={8} required />
            </>
          )}

          {!isRegister && (
            <div className="auth-form-options">
              <label className="auth-checkbox">
                <input type="checkbox" name="rememberMe" /> Remember me
              </label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          )}

          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Sign in' : 'Create account'}
          </Link>
        </p>
      </section>
    </main>
  );
}