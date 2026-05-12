import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { useCurrency } from './hooks/useCurrency';
import { useBudget } from './hooks/useBudget';
import { defaultCategories } from './data/categories';
import Dashboard from './features/dashboard/Dashboard';
import AddTransaction from './features/add-transaction/AddTransaction';
import TransactionList from './features/history/TransactionList';
import Insights from './features/insights/Insights';
import BottomNav, { type Tab } from './components/layout/BottomNav/BottomNav';
import OfflineBanner from './components/OfflineBanner';
import LoginScreen from './features/auth/LoginScreen';
import RegisterScreen from './features/auth/RegisterScreen';
import SplashScreen from './features/onboarding/SplashScreen';
import LanguagePicker from './features/onboarding/LanguagePicker';
import Onboarding from './features/onboarding/Onboarding';
import BudgetSetup from './features/onboarding/BudgetSetup';
import UsernameSetup from './features/onboarding/UsernameSetup';
import type { BudgetPeriod } from './types/budget';
import './App.css';

type AuthView = 'login' | 'register';

const FIRST_RUN_KEY = 'gofinancial_first_run_done';

function isFirstRun(): boolean {
  try {
    return !localStorage.getItem(FIRST_RUN_KEY);
  } catch {
    return true;
  }
}

function markFirstRunDone(): void {
  try {
    localStorage.setItem(FIRST_RUN_KEY, 'true');
  } catch {
    // ignore
  }
}

function AuthFlow() {
  const [view, setView] = useState<AuthView>('login');
  return view === 'login'
    ? <LoginScreen onSwitchToRegister={() => setView('register')} />
    : <RegisterScreen onSwitchToLogin={() => setView('login')} />;
}

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { transactions, loading, addTransaction, deleteTransaction, updateTransaction } = useTransactions();
  const { currency, setCurrency } = useCurrency();
  const { budget, setBudget, clearBudget } = useBudget();
  const [showAdd, setShowAdd] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  const [historySyncDate, setHistorySyncDate] = useState<Date | null>(null);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const [firstRun, setFirstRun] = useState<'splash' | 'language' | 'onboarding' | 'username' | 'budget' | 'done'>(
    isFirstRun() ? 'splash' : 'done'
  );

  const handleSplashDone = useCallback(() => setFirstRun('language'), []);
  const handleLanguageDone = useCallback(() => setFirstRun('onboarding'), []);
  const handleOnboardingDone = useCallback(() => {
    setFirstRun('username');
  }, []);
  const handleUsernameDone = useCallback((_username: string) => {
    setFirstRun('budget');
  }, []);
  const handleBudgetDone = useCallback((amount: number, period: BudgetPeriod) => {
    setBudget(amount, period);
    markFirstRunDone();
    setFirstRun('done');
  }, [setBudget]);
  const handleBudgetSkip = useCallback(() => {
    markFirstRunDone();
    setFirstRun('done');
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('gofinancial_theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const handleSave = useCallback((transaction: typeof transactions[0]) => {
    addTransaction(transaction);
    setShowAdd(false);
    setPendingDate(null);
  }, [addTransaction]);

  if (firstRun !== 'done') {
    if (firstRun === 'splash') return <SplashScreen onComplete={handleSplashDone} />;
    if (firstRun === 'language') return <LanguagePicker onNext={handleLanguageDone} />;
    if (firstRun === 'onboarding') return <Onboarding onComplete={handleOnboardingDone} />;
    if (firstRun === 'username') return <UsernameSetup onComplete={handleUsernameDone} />;
    return <BudgetSetup onComplete={handleBudgetDone} onSkip={handleBudgetSkip} />;
  }

  if (isLoading || loading) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthFlow />;
  }

  return (
    <div className="app">
      {currentTab === 'dashboard' && (
        <>
          <Dashboard
            transactions={transactions}
            currency={currency}
            onCurrencyChange={setCurrency}
            budget={budget}
            onSetBudget={setBudget}
            onClearBudget={clearBudget}
          />
          <TransactionList
            transactions={transactions}
            categories={defaultCategories}
            onDelete={deleteTransaction}
            onUpdate={updateTransaction}
            currency={currency}
            viewMode="dashboard"
            onSwitchToHistory={(date) => {
              setHistorySyncDate(date);
              setCurrentTab('history');
            }}
          />
        </>
      )}

      {currentTab === 'history' && (
        <TransactionList
          key={historySyncDate ? historySyncDate.getTime() : 'history'}
          transactions={transactions}
          categories={defaultCategories}
          onDelete={deleteTransaction}
          onUpdate={updateTransaction}
          currency={currency}
          viewMode="history"
          syncDate={historySyncDate}
          onAddEntry={(date) => {
            setPendingDate(date);
            setShowAdd(true);
          }}
        />
      )}

      {currentTab === 'insight' && (
          <Insights
            transactions={transactions}
            categories={defaultCategories}
            currency={currency}
            budget={budget}
            onSetBudget={setBudget}
            onClearBudget={clearBudget}
            onViewAll={() => { setHistorySyncDate(new Date()); setCurrentTab('history'); }}
          />
      )}

      {showAdd && (
        <AddTransaction
          categories={defaultCategories}
          currency={currency}
          onSave={handleSave}
          onCancel={() => { setShowAdd(false); setPendingDate(null); }}
          defaultTimestamp={pendingDate?.getTime()}
        />
      )}

      <OfflineBanner />
      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onAddTap={() => setShowAdd(true)}
      />
    </div>
  );
}

export default App;
