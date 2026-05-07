import { MdAdd, MdDashboard, MdHistory, MdInsights } from 'react-icons/md';
import styles from './BottomNav.module.css';

export type Tab = 'dashboard' | 'history' | 'insight';

interface BottomNavProps {
  currentTab: Tab;
  onChangeTab: (tab: Tab) => void;
  onAddTap: () => void;
}

export default function BottomNav({ currentTab, onChangeTab, onAddTap }: BottomNavProps) {
  return (
    <nav className={styles.nav} aria-label="Bottom Navigation">
      <div className={styles.container}>
        <button
          type="button"
          className={styles.addButton}
          onClick={onAddTap}
          aria-label="Add expense"
        >
          <span className={styles.addIcon}><MdAdd /></span>
          <span className={styles.label}>Add</span>
        </button>

        <div className={styles.group}>
          <button
            type="button"
            className={`${styles.navItem} ${currentTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => onChangeTab('dashboard')}
            aria-label="Dashboard"
          >
            <span className={styles.icon}><MdDashboard /></span>
            <span className={styles.label}>Dashboard</span>
          </button>

          <button
            type="button"
            className={`${styles.navItem} ${currentTab === 'history' ? styles.active : ''}`}
            onClick={() => onChangeTab('history')}
            aria-label="History"
          >
            <span className={styles.icon}><MdHistory /></span>
            <span className={styles.label}>History</span>
          </button>

          <button
            type="button"
            className={`${styles.navItem} ${currentTab === 'insight' ? styles.active : ''}`}
            onClick={() => onChangeTab('insight')}
            aria-label="Insight"
          >
            <span className={styles.icon}><MdInsights /></span>
            <span className={styles.label}>Insight</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
