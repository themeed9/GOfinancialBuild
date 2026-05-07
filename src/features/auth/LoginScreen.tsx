import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './AuthScreen.module.css';

interface AuthScreenProps {
  onSwitchToRegister: () => void;
}

export default function LoginScreen({ onSwitchToRegister }: AuthScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
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
        <div className={styles.logoIcon}>GO</div>
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
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="login-password" className={styles.label}>Password</label>
          <input
            id="login-password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
          />
        </div>

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
    </div>
  );
}
