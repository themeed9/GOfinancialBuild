import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './ForgotPasswordModal.module.css';
import { MdClose, MdArrowBack } from 'react-icons/md';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ForgotPasswordModalProps {
  onClose: () => void;
}

type Step = 'email' | 'otp' | 'reset';

const LOCAL_USERS_KEY = 'gofinancial_users';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generatedOtp] = useState(generateOTP);
  const [successMessage, setSuccessMessage] = useState('');
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleEmailSubmit = useCallback(() => {
    setEmailError('');
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Invalid email');
      return;
    }
    const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const exists = users.some((u: { email: string }) => u.email === email);
    if (!exists) {
      setEmailError('No account found with this email');
      return;
    }
    setStep('otp');
  }, [email]);

  const handleOtpSubmit = useCallback(() => {
    setOtpError('');
    if (!otp.trim()) {
      setOtpError('OTP is required');
      return;
    }
    if (otp !== generatedOtp) {
      setOtpError('Invalid OTP');
      return;
    }
    setStep('reset');
  }, [otp, generatedOtp]);

  const handleResetSubmit = useCallback(async () => {
    setPasswordError('');
    setSuccessMessage('');
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const idx = users.findIndex((u: { email: string }) => u.email === email);
    if (idx === -1) {
      setPasswordError('Account not found');
      return;
    }
    users[idx].passwordHash = await hashPassword(password);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    setSuccessMessage('Password reset successful');
    setTimeout(onClose, 1500);
  }, [password, confirmPassword, email, onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          {step !== 'email' ? (
            <button className={styles.backButton} onClick={() => setStep('email')} aria-label="Go back">
              <MdArrowBack size={22} />
            </button>
          ) : <div />}
          <h3 className={styles.title}>Reset Password</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <MdClose size={22} />
          </button>
        </div>

        {step === 'email' && (
          <div className={styles.body}>
            <p className={styles.description}>
              Enter the email address linked to your account and we'll send you an OTP to reset your password.
            </p>
            <div className={styles.field}>
              <label htmlFor="reset-email" className={styles.label}>Email</label>
              <input
                id="reset-email"
                type="email"
                className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
              />
              {emailError && <p className={styles.fieldError}>{emailError}</p>}
            </div>
            <button className={styles.primaryButton} onClick={handleEmailSubmit}>
              Send OTP
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className={styles.body}>
            <p className={styles.description}>
              An OTP has been sent to <strong>{email}</strong>. Enter the 6-digit code below.
            </p>
            <p className={styles.otpDemo}>
              Demo OTP: <strong>{generatedOtp}</strong>
            </p>
            <div className={styles.field}>
              <label htmlFor="reset-otp" className={styles.label}>OTP Code</label>
              <input
                id="reset-otp"
                type="text"
                className={`${styles.input} ${styles.otpInput} ${otpError ? styles.inputError : ''}`}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
              />
              {otpError && <p className={styles.fieldError}>{otpError}</p>}
            </div>
            <button className={styles.primaryButton} onClick={handleOtpSubmit}>
              Verify OTP
            </button>
          </div>
        )}

        {step === 'reset' && (
          <div className={styles.body}>
            <p className={styles.description}>
              Enter your new password.
            </p>
            <div className={styles.field}>
              <label htmlFor="reset-password" className={styles.label}>New Password</label>
              <input
                id="reset-password"
                type="password"
                className={`${styles.input} ${passwordError ? styles.inputError : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoFocus
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="reset-confirm" className={styles.label}>Confirm Password</label>
              <input
                id="reset-confirm"
                type="password"
                className={`${styles.input} ${passwordError ? styles.inputError : ''}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
              />
              {passwordError && <p className={styles.fieldError}>{passwordError}</p>}
            </div>
            {successMessage && (
              <div className={styles.successBanner}>{successMessage}</div>
            )}
            <button className={styles.primaryButton} onClick={handleResetSubmit}>
              Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
