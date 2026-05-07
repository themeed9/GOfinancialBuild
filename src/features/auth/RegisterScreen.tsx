import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './AuthScreen.module.css';

interface AuthScreenProps {
  onSwitchToLogin: () => void;
}

export default function RegisterScreen({ onSwitchToLogin }: AuthScreenProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
    } catch {
      setError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  }, [name, email, password, register]);

  return (
    <div className={styles.container}>
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>GO</div>
        <h1 className={styles.title}>GOfinancial</h1>
        <p className={styles.subtitle}>Start your financial habit</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.formTitle}>Create account</h2>

        {error && <div className={styles.errorBanner}>{error}</div>}

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
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="register-password" className={styles.label}>Password</label>
          <input
            id="register-password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
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
