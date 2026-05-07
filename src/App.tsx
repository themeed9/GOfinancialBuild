import { useState } from 'react';
import { useTransactions } from './hooks/useTransactions';
import { useCurrency } from './hooks/useCurrency';
import { defaultCategories } from './data/categories';
import Dashboard from './features/dashboard/Dashboard';
import AddTransaction from './features/add-transaction/AddTransaction';
import TransactionList from './features/history/TransactionList';
import BottomNav, { type Tab } from './components/layout/BottomNav/BottomNav';
import './App.css';

function App() {
  const { transactions, loading, addTransaction, deleteTransaction, updateTransaction } = useTransactions();
  const { currency, setCurrency } = useCurrency();
  const [showAdd, setShowAdd] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');

  const [historySyncDate, setHistorySyncDate] = useState<Date | null>(null);

  function handleSave(transaction: typeof transactions[0]) {
    addTransaction(transaction);
    setShowAdd(false);
  }

  if (loading) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        Loading...
      </div>
    );
  }

  return (
    <div className="app">
      {currentTab === 'dashboard' && (
        <>
          <Dashboard
            transactions={transactions}
            currency={currency}
            onCurrencyChange={setCurrency}
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
        />
      )}

      {currentTab === 'insight' && (
        <div className="insights-placeholder">
          <h2>Insights Coming Soon</h2>
        </div>
      )}

      {showAdd && (
        <AddTransaction
          categories={defaultCategories}
          currency={currency}
          onSave={handleSave}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onAddTap={() => setShowAdd(true)}
      />
    </div>
  );
}

export default App;
