import { useState, useCallback } from 'react';
import styles from './UsernameSetup.module.css';
import { MdEdit } from 'react-icons/md';

interface UsernameSetupProps {
  onComplete: (username: string) => void;
}

export default function UsernameSetup({ onComplete }: UsernameSetupProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleContinue = useCallback(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Enter a username');
      return;
    }
    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    onComplete(trimmed);
  }, [username, onComplete]);

  return (
    <div className={styles.container}>
      <div className={styles.topContent}>
        <h1 className={styles.title}>Choose your username</h1>
        <p className={styles.subtitle}>
          This is how you'll appear in the app.
        </p>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.avatarCircle}>
          <span className={styles.avatarLetter}>
            {username.trim() ? username.trim()[0].toUpperCase() : '?'}
          </span>
          <div className={styles.avatarBadge}>
            <MdEdit size={14} />
          </div>
        </div>

        <div className={styles.inputCard}>
          <div className={styles.inputWrapper}>
            <span className={styles.prefix}>@</span>
            <input
              id="username-input"
              className={styles.usernameInput}
              type="text"
              placeholder="username"
              value={username}
              onChange={e => { setUsername(e.target.value.replace(/\s/g, '')); setError(''); }}
              autoFocus
              maxLength={20}
              autoComplete="username"
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.continueBtn} onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
