import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './LanguagePicker.module.css';

interface LanguagePickerProps {
  onNext: () => void;
}

export default function LanguagePicker({ onNext }: LanguagePickerProps) {
  const { language, setLanguage, languages } = useLanguage();
  const [selected, setSelected] = useState(language);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = useCallback((code: string) => {
    setSelected(code);
    setLanguage(code);
    setIsOpen(false);
  }, [setLanguage]);

  const handleContinue = useCallback(() => {
    if (selected) {
      setLanguage(selected);
    }
    onNext();
  }, [selected, setLanguage, onNext]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const currentLang = languages.find(l => l.code === selected);

  return (
    <div className={styles.container}>
      <div className={styles.topContent}>
        <h1 className={styles.title}>Choose your language</h1>
        <p className={styles.subtitle}>You can always change this later in settings.</p>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.selectorWrapper} ref={containerRef}>
          <button
            ref={triggerRef}
            className={styles.selector}
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label="Select language"
          >
            {currentLang ? (
              <div className={styles.selectedRow}>
                <FlagImage code={currentLang.countryCode} />
                <span>{currentLang.name}</span>
              </div>
            ) : (
              <span className={styles.placeholder}>Select your language</span>
            )}
            <svg
              className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {isOpen && (
            <div className={styles.dropdown} role="listbox">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  className={`${styles.dropdownItem} ${lang.code === selected ? styles.dropdownItemSelected : ''}`}
                  onClick={() => handleSelect(lang.code)}
                  type="button"
                  role="option"
                  aria-selected={lang.code === selected}
                >
                  <div className={styles.optionLeft}>
                    <FlagImage code={lang.countryCode} />
                    <span>{lang.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className={`${styles.continueBtn} ${!selected ? styles.continueBtnDisabled : ''}`}
          onClick={handleContinue}
          disabled={!selected}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function FlagImage({ code }: { code: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return <span className={styles.flagFallback}>{code.toUpperCase()}</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt=""
      className={styles.flagImage}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
