import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './AuthScreen.module.css';
import ForgotPasswordModal from './ForgotPasswordModal';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

interface AuthScreenProps {
  onSwitchToRegister: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SYMBOLS = '. ! @ # $ % ^ & * ( ) _ - + =';
const ALLOWED_SET = new Set(ALLOWED_SYMBOLS.replace(/ /g, ''));

export default function LoginScreen({ onSwitchToRegister }: AuthScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = useCallback((value: string) => {
    if (value.trim() && !EMAIL_REGEX.test(value)) {
      setEmailError('Invalid email');
    } else {
      setEmailError('');
    }
  }, []);

  const validatePassword = useCallback((value: string) => {
    if (!value) {
      setPasswordError('');
      return;
    }
    for (const ch of value) {
      if (/[A-Za-z0-9]/.test(ch)) continue;
      if (!ALLOWED_SET.has(ch)) {
        setPasswordError(`Symbol "${ch}" is not allowed`);
        return;
      }
    }
    setPasswordError('');
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Invalid email');
      return;
    }
    for (const ch of password) {
      if (/[A-Za-z0-9]/.test(ch)) continue;
      if (!ALLOWED_SET.has(ch)) {
        setPasswordError(`Symbol "${ch}" is not allowed`);
        return;
      }
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }, [email, password, login]);

  return (
    <div className={styles.container}>
      <div className={styles.logoSection}>
        <img src="/images/logoAlt.svg" alt="GOfinancial" className={styles.logoIcon} />
        <h1 className={styles.title}>GOfinancial</h1>
        <p className={styles.subtitle}>Frictionless expense tracking</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.formTitle}>Welcome back</h2>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="login-email" className={styles.label}>Email</label>
          <input
            id="login-email"
            type="email"
            className={`${styles.input} ${emailError ? styles.inputError : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={(e) => validateEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
          {emailError && <p className={styles.fieldError}>{emailError}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="login-password" className={styles.label}>Password</label>
          <div className={styles.passwordWrapper}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${styles.passwordInput} ${passwordError ? styles.inputError : ''}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              autoComplete="current-password"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <MdVisibilityOff size={22} /> : <MdVisibility size={22} />}
            </button>
          </div>
          {passwordError && <p className={styles.fieldError}>{passwordError}</p>}
          <p className={styles.passwordHint}>Allowed symbols: {ALLOWED_SYMBOLS}</p>
        </div>

        <button
          type="button"
          className={styles.forgotLink}
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot password?
        </button>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <button type="button" className={styles.switchLink} onClick={onSwitchToRegister}>
            Create one
          </button>
        </p>
      </form>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}
