import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        background: 'var(--color-error-container)',
        color: 'var(--color-on-error-container)',
        padding: '8px 20px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 500,
        maxWidth: 'calc(100% - 40px)',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        whiteSpace: 'nowrap',
      }}
      role="status"
      aria-live="polite"
    >
      You're offline — changes saved locally
    </div>
  );
}
