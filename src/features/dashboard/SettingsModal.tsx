import { useState, useCallback, useRef, useEffect } from 'react';
import type { Transaction, User } from '../../types';
import type { Budget, BudgetPeriod } from '../../types/budget';
import styles from './SettingsModal.module.css';
import { MdClose, MdDarkMode, MdLightMode, MdDownload, MdInfo, MdGavel, MdSecurity, MdLanguage, MdExpandMore, MdAccountBalanceWallet, MdLogout, MdDescription, MdTableChart } from 'react-icons/md';
import { useLanguage } from '../../hooks/useLanguage';
import { useI18n } from '../../hooks/useI18n';
import { useAuth } from '../../hooks/useAuth';
import BudgetModal from '../insights/BudgetModal';
import { getCurrencyByCode } from '../../data/currencies';

interface SettingsModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: Partial<User>) => void;
  budget: Budget | null;
  onSetBudget: (amount: number, period: BudgetPeriod) => void;
  onClearBudget: () => void;
  transactions: Transaction[];
}

export default function SettingsModal({ user, onClose, onUpdateUser, budget, onSetBudget, onClearBudget, transactions }: SettingsModalProps) {
  const { strings } = useI18n();
  const { language, setLanguage, languages } = useLanguage();
  const [activeTab, setActiveTab] = useState<'settings' | 'terms' | 'privacy'>('settings');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement | null>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const { logout } = useAuth();
  const currencyOption = getCurrencyByCode(user.currency) ?? { code: 'us', symbol: '$', name: 'US Dollar', countryHint: 'USA', flag: 'us', rateToUSD: 1 };
  const appVersion = import.meta.env.VITE_APP_VERSION || '0.0.0';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(e.target as Node)) {
        setIsLanguageOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLogoutConfirm) {
          setShowLogoutConfirm(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose, showLogoutConfirm]);

  const toggleTheme = useCallback(() => {
    const newTheme = user.theme === 'dark' ? 'light' : 'dark';
    onUpdateUser({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('gofinancial_theme', newTheme);
  }, [user.theme, onUpdateUser]);

  const generateCSV = useCallback(() => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency'];
    const rows = transactions.map(t => [
      new Date(t.timestamp).toLocaleDateString(),
      `"${t.note.replace(/"/g, '""')}"`,
      t.categoryId,
      t.amount.toFixed(2),
      user.currency,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }, [transactions, user.currency]);

  const generateHTML = useCallback(() => {
    const rows = transactions.map(t => `
      <tr>
        <td>${new Date(t.timestamp).toLocaleDateString()}</td>
        <td>${t.note}</td>
        <td>${t.categoryId}</td>
        <td>${user.currency} ${t.amount.toFixed(2)}</td>
      </tr>`).join('');
    return `<html><head><meta charset="utf-8"><title>GOfinancial Export</title><style>table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;border:1px solid #ddd;text-align:left}th{background:#0769F7;color:#fff}tr:nth-child(even){background:#f5f5f5}</style></head><body><h2>Expense Report</h2><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><p>Total transactions: ${transactions.length}</p></body></html>`;
  }, [transactions, user.currency]);

  const handleExportFormat = useCallback((format: 'csv' | 'html') => {
    setShowExportOptions(false);
    const content = format === 'csv' ? generateCSV() : generateHTML();
    const mimeType = format === 'csv' ? 'text/csv' : 'text/html';
    const ext = format === 'csv' ? 'csv' : 'html';
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gofinancial-export-${new Date().toISOString().split('T')[0]}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generateCSV, generateHTML]);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    setShowLogoutConfirm(false);
    onClose();
    logout();
  }, [logout, onClose]);

  const handleLogoutCancel = useCallback(() => {
    setShowLogoutConfirm(false);
  }, []);

  return (
    <>
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{strings.settings_title}</h3>
          <div className={styles.spacer}></div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close settings">
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === 'settings' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('settings')}
            aria-label={strings.settings_tab}
          >
            {strings.settings_tab}
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'terms' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('terms')}
            aria-label={strings.terms_tab}
          >
            {strings.terms_tab}
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'privacy' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('privacy')}
            aria-label={strings.privacy_tab}
          >
            {strings.privacy_tab}
          </button>
        </div>

        {activeTab === 'settings' && (
          <div className={styles.content}>
            <div className={styles.settingItem}>
              <div className={styles.settingLeft}>
                <MdLanguage size={20} />
                <div>
                  <span className={styles.settingLabel}>{strings.language}</span>
                  <span className={styles.settingHint}>{strings.language_hint}</span>
                </div>
              </div>
              <div className={styles.languageSelectorContainer} ref={languageRef}>
                <button
                  className={styles.languageSelectorBox}
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  type="button"
                  aria-expanded={isLanguageOpen}
                  aria-haspopup="listbox"
                >
                  <span className={styles.languageCurrent}>
                    {languages.find(l => l.code === language)?.nativeName || 'English'}
                  </span>
                  <MdExpandMore
                    size={20}
                    className={`${styles.languageChevron} ${isLanguageOpen ? styles.chevronOpen : ''}`}
                  />
                </button>

                {isLanguageOpen && (
                  <div className={styles.languageDropdown} role="listbox">
                    {languages.map(l => (
                      <button
                        key={l.code}
                        className={`${styles.languageOption} ${l.code === language ? styles.languageOptionSelected : ''}`}
                        onClick={() => {
                          setLanguage(l.code);
                          setIsLanguageOpen(false);
                        }}
                        type="button"
                        role="option"
                        aria-selected={l.code === language}
                      >
                        <span className={styles.languageOptionName}>{l.nativeName}</span>
                        <span className={styles.languageOptionCode}>{l.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingLeft}>
                {user.theme === 'dark' ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
                <div>
                  <span className={styles.settingLabel}>{strings.dark_mode}</span>
                  <span className={styles.settingHint}>
                    {user.theme === 'dark' ? strings.dark_mode_hint_on : strings.dark_mode_hint_off}
                  </span>
                </div>
              </div>
              <button
                className={styles.toggleButton}
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <div className={`${styles.toggleTrack} ${user.theme === 'dark' ? styles.toggleActive : ''}`}>
                  <div className={styles.toggleThumb}></div>
                </div>
              </button>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingLeft}>
                <MdInfo size={20} />
                <div>
                  <span className={styles.settingLabel}>{strings.about_app}</span>
                  <span className={styles.settingHint}>Version {appVersion}</span>
                </div>
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingLeft}>
                <MdDownload size={20} />
                <div>
                  <span className={styles.settingLabel}>{strings.export_data}</span>
                  <span className={styles.settingHint}>{strings.export_data_hint}</span>
                </div>
              </div>
              <button className={styles.textLinkBtn} onClick={() => setShowExportOptions(true)}>
                {strings.export_button}
              </button>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingLeft}>
                <MdAccountBalanceWallet size={20} />
                <div>
                  <span className={styles.settingLabel}>{strings.budget}</span>
                  <span className={styles.settingHint}>
                    {budget ? `${budget.amount.toLocaleString()} / ${budget.period}` : strings.budget_set_hint}
                  </span>
                </div>
              </div>
              <button
                className={styles.textLinkBtn}
                onClick={() => setShowBudgetModal(true)}
              >
                {budget ? 'Adjust budget' : strings.budget_set}
              </button>
            </div>

            {showBudgetModal && (
              <BudgetModal
                budget={budget}
                currency={currencyOption}
                onSave={onSetBudget}
                onClear={onClearBudget}
                onClose={() => setShowBudgetModal(false)}
              />
            )}

            <div className={styles.settingItem}>
              <div className={styles.settingLeft}>
                <MdGavel size={20} />
                <div>
                  <span className={styles.settingLabel}>{strings.legal}</span>
                  <span className={styles.settingHint}>{strings.legal_hint}</span>
                </div>
              </div>
            </div>

            <div className={styles.logoutItem}>
              <button className={styles.logoutButton} onClick={handleLogoutClick}>
                <MdLogout size={20} />
                <span>{strings.logout}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className={styles.legalContent}>
            <h4>Terms and Conditions</h4>
            <p><strong>Last updated:</strong> May 5, 2026</p>

            <h5>1. Acceptance of Terms</h5>
            <p>By accessing and using GOfinancial ("the App"), you accept and agree to be bound by the terms and provision of this agreement.</p>

            <h5>2. Description of Service</h5>
            <p>GOfinancial is a mobile-first fintech application that provides frictionless expense tracking to help users build daily financial habits. The App allows you to:</p>
            <ul>
              <li>Add and categorize transactions quickly</li>
              <li>View daily spending summaries</li>
              <li>Track expenses with offline support</li>
              <li>Access basic financial insights</li>
            </ul>

            <h5>3. User Responsibilities</h5>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate information during onboarding</li>
              <li>Maintain the security of your device</li>
              <li>Not use the App for any unlawful purpose</li>
              <li>Accept that data is stored locally on your device</li>
            </ul>

            <h5>4. Intellectual Property</h5>
            <p>All content, features, and functionality of the App are owned by GOfinancial and are protected by international copyright, trademark, and other intellectual property laws.</p>

            <h5>5. Limitation of Liability</h5>
            <p>GOfinancial shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the App. The App is provided "as is" without warranties of any kind.</p>

            <h5>6. Changes to Terms</h5>
            <p>We reserve the right to modify these terms at any time. Continued use of the App after changes constitutes acceptance of the new terms.</p>

            <h5>7. Contact</h5>
            <p>For questions about these Terms, please contact us through the App.</p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className={styles.legalContent}>
            <h4>Privacy Policy</h4>
            <p><strong>Last updated:</strong> May 5, 2026</p>

            <h5>1. Information We Collect</h5>
            <p>We collect the following information:</p>
            <ul>
              <li><strong>Personal Information:</strong> Username, email (optional), profile image</li>
              <li><strong>Financial Data:</strong> Transaction records, spending categories</li>
              <li><strong>Device Data:</strong> Stored locally on your device via IndexedDB and LocalStorage</li>
              <li><strong>Usage Data:</strong> We do not track or transmit usage data externally</li>
            </ul>

            <h5>2. How We Use Your Information</h5>
            <p>Your information is used solely to:</p>
            <ul>
              <li>Provide and maintain the App's functionality</li>
              <li>Display your transaction history and spending insights</li>
              <li>Enable profile customization</li>
              <li>Improve the App based on your feedback</li>
            </ul>

            <h5>3. Data Storage and Security</h5>
            <p>All data is stored <strong>locally on your device</strong>. We do not transmit your financial data to external servers. You are responsible for:</p>
            <ul>
              <li>Maintaining physical security of your device</li>
              <li>Regularly exporting your data as backup</li>
              <li>Using device security features (PIN, biometrics)</li>
            </ul>

            <h5>4. Data Sharing</h5>
            <p>We do <strong>not</strong> share, sell, or distribute your personal or financial data to third parties. Since data is stored locally, no data leaves your device unless you explicitly export it.</p>

            <h5>5. Your Rights</h5>
            <p>You have the right to:</p>
            <ul>
              <li>Access your data within the App</li>
              <li>Export your data in JSON format</li>
              <li>Delete your data by clearing the App's storage</li>
              <li>Update your profile information at any time</li>
            </ul>

            <h5>6. Children's Privacy</h5>
            <p>The App is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>

            <h5>7. Changes to Privacy Policy</h5>
            <p>We may update this Privacy Policy. Changes will be reflected in the App with an updated "Last updated" date.</p>

            <h5>8. Contact</h5>
            <p>For privacy-related questions, please contact us through the App.</p>

            <div className={styles.privacyHighlight}>
              <MdSecurity size={24} />
              <div>
                <strong>Your Data, Your Control</strong>
                <p>Since all data stays on your device, you have complete control. No cloud, no tracking, no surprises.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {showLogoutConfirm && (
      <div className={styles.confirmationOverlay} onClick={handleLogoutCancel}>
        <div className={styles.confirmationDialog} onClick={(e) => e.stopPropagation()}>
          <h3 className={styles.confirmationTitle}>{strings.logout_confirm_title}</h3>
          <p className={styles.confirmationMessage}>{strings.logout_confirm_msg}</p>
          <div className={styles.confirmationActions}>
            <button className={styles.confirmationCancel} onClick={handleLogoutCancel}>
              {strings.cancel}
            </button>
            <button className={styles.confirmationConfirm} onClick={handleLogoutConfirm}>
              {strings.confirm_logout}
            </button>
          </div>
        </div>
      </div>
    )}

    {showExportOptions && (
      <div className={styles.exportOverlay} onClick={() => setShowExportOptions(false)}>
        <div className={styles.exportDialog} onClick={(e) => e.stopPropagation()}>
          <h3 className={styles.exportTitle}>Export Data</h3>
          <p className={styles.exportDesc}>Choose export format</p>
          <div className={styles.exportOptions}>
            <button className={styles.exportOptionBtn} onClick={() => handleExportFormat('csv')}>
              <MdTableChart size={32} />
              <span className={styles.exportOptionLabel}>Excel (CSV)</span>
              <span className={styles.exportOptionHint}>Open in Excel, Google Sheets</span>
            </button>
            <button className={styles.exportOptionBtn} onClick={() => handleExportFormat('html')}>
              <MdDescription size={32} />
              <span className={styles.exportOptionLabel}>PDF</span>
              <span className={styles.exportOptionHint}>Printable report</span>
            </button>
          </div>
          <button className={styles.exportCancelBtn} onClick={() => setShowExportOptions(false)}>
            Cancel
          </button>
        </div>
      </div>
    )}
    </>
  );
}
