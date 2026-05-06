import { useState } from 'react';
import type { User } from '../../types';
import styles from './Dashboard.module.css';
import { MdClose, MdDarkMode, MdLightMode, MdDownload, MdInfo, MdGavel, MdSecurity } from 'react-icons/md';

interface SettingsModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: Partial<User>) => void;
}

export default function SettingsModal({ user, onClose, onUpdateUser }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'terms' | 'privacy'>('settings');
  const appVersion = '0.0.0';

  const toggleTheme = () => {
    const newTheme = user.theme === 'dark' ? 'light' : 'dark';
    onUpdateUser({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const exportData = () => {
    const data = {
      user,
      exportDate: new Date().toISOString(),
      appVersion,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gofinancial-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.settingsOverlay} onClick={onClose}>
      <div className={styles.settingsModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.settingsHeader}>
          <h3>Settings</h3>
          <div style={{ flex: 1 }}></div>
          <button className={styles.closeButtonFull} onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.settingsTabs}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'settings' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'terms' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            Terms
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'privacy' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy
          </button>
        </div>

        {activeTab === 'settings' && (
          <div className={styles.settingsContent}>
            <div className={styles.settingItem}>
              <div className={styles.settingLeft}>
                {user.theme === 'dark' ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
                <div>
                  <span className={styles.settingLabel}>Dark Mode</span>
                  <span className={styles.settingHint}>
                    {user.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
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
                  <span className={styles.settingLabel}>About GOfinancial</span>
                  <span className={styles.settingHint}>Version {appVersion}</span>
                </div>
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingLeft}>
                <MdDownload size={20} />
                <div>
                  <span className={styles.settingLabel}>Export Data</span>
                  <span className={styles.settingHint}>Download your financial data</span>
                </div>
              </div>
              <button className={styles.exportButton} onClick={exportData}>
                Export
              </button>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingLeft}>
                <MdGavel size={20} />
                <div>
                  <span className={styles.settingLabel}>Legal</span>
                  <span className={styles.settingHint}>Terms & Privacy below</span>
                </div>
              </div>
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
  );
}
