import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './AuthScreen.module.css';
import { MdVisibility, MdVisibilityOff, MdErrorOutline } from 'react-icons/md';

interface AuthScreenProps {
  onSwitchToLogin: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SYMBOLS = '. ! @ # $ % ^ & * ( ) _ - + =';
const ALLOWED_SET = new Set(ALLOWED_SYMBOLS.replace(/ /g, ''));

export default function RegisterScreen({ onSwitchToLogin }: AuthScreenProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
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
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
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
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [name, email, password, register]);

  return (
    <div className={styles.container}>
      <div className={styles.logoSection}>
        <img src="/images/logoAlt.svg" alt="GOfinancial" className={styles.logoIcon} />
        <h1 className={styles.title}>GOfinancial</h1>
        <p className={styles.subtitle}>Start your financial habit</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.formTitle}>Create account</h2>

        {error && <div className={styles.errorBanner}><MdErrorOutline size={16} /><span>{error}</span></div>}

        <div className={styles.field}>
          <label htmlFor="register-name" className={styles.label}>Name</label>
          <input
            id="register-name"
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Your name"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="register-email" className={styles.label}>Email</label>
          <input
            id="register-email"
            type="email"
            className={`${styles.input} ${emailError ? styles.inputError : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={(e) => validateEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
          {emailError && <div className={styles.fieldError}><MdErrorOutline size={12} /><span>{emailError}</span></div>}
        </div>

        <div className={styles.field}>
          <label htmlFor="register-password" className={styles.label}>Password</label>
          <div className={styles.passwordWrapper}>
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${styles.passwordInput} ${passwordError ? styles.inputError : ''}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              autoComplete="new-password"
              placeholder="At least 6 characters"
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
          {passwordError && <div className={styles.fieldError}><MdErrorOutline size={12} /><span>{passwordError}</span></div>}
          <p className={styles.passwordHint}>Allowed symbols: {ALLOWED_SYMBOLS}</p>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <button type="button" className={styles.switchLink} onClick={onSwitchToLogin}>
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}
