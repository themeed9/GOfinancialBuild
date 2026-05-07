import { useEffect } from 'react';
import styles from './SplashScreen.module.css';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={styles.container}>
      <div className={styles.logoWrapper}>
        <img src="/images/logo.svg" alt="GOfinancial" className={styles.logo} />
      </div>
      <p className={styles.tagline}>Go for freedom</p>
    </div>
  );
}
