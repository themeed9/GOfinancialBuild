import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { AuthProvider } from './contexts/auth.provider.tsx'
import { LanguageProvider } from './contexts/language.provider.tsx'
import './index.css'
import App from './App.tsx'

function initTheme() {
  try {
    const saved = localStorage.getItem('gofinancial_theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
      return;
    }
  } catch {
    // ignore
  }

  document.documentElement.setAttribute('data-theme', 'light');
}

function initLanguage() {
  try {
    const saved = localStorage.getItem('gofinancial_language');
    if (saved && ['ar', 'he'].includes(saved)) {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = saved;
    }
  } catch {
    // ignore
  }
}

initTheme();
initLanguage();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
)
