import { MdAdd, MdDashboard, MdHistory, MdInsights } from 'react-icons/md';
import styles from './BottomNav.module.css';
import { useI18n } from '../../../hooks/useI18n';

export type Tab = 'dashboard' | 'history' | 'insight';

interface BottomNavProps {
  currentTab: Tab;
  onChangeTab: (tab: Tab) => void;
  onAddTap: () => void;
}

export default function BottomNav({ currentTab, onChangeTab, onAddTap }: BottomNavProps) {
  const { strings } = useI18n();

  return (
    <nav className={styles.nav} aria-label="Bottom Navigation">
      <div className={styles.container}>
        <button
          type="button"
          className={styles.addButton}
          onClick={onAddTap}
          aria-label={strings.nav_add}
        >
          <span className={styles.addIcon}><MdAdd /></span>
          <span className={styles.label}>{strings.nav_add}</span>
        </button>

        <div className={styles.group}>
          <button
            type="button"
            className={`${styles.navItem} ${currentTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => onChangeTab('dashboard')}
            aria-label={strings.nav_dashboard}
          >
            <span className={styles.icon}><MdDashboard /></span>
            <span className={styles.label}>{strings.nav_dashboard}</span>
          </button>

          <button
            type="button"
            className={`${styles.navItem} ${currentTab === 'history' ? styles.active : ''}`}
            onClick={() => onChangeTab('history')}
            aria-label={strings.nav_history}
          >
            <span className={styles.icon}><MdHistory /></span>
            <span className={styles.label}>{strings.nav_history}</span>
          </button>

          <button
            type="button"
            className={`${styles.navItem} ${currentTab === 'insight' ? styles.active : ''}`}
            onClick={() => onChangeTab('insight')}
            aria-label={strings.nav_insight}
          >
            <span className={styles.icon}><MdInsights /></span>
            <span className={styles.label}>{strings.nav_insight}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
