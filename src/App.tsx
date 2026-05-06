import { useState } from 'react';
import { useTransactions } from './hooks/useTransactions';
import { defaultCategories } from './data/categories';
import Dashboard from './features/dashboard/Dashboard';
import AddTransaction from './features/add-transaction/AddTransaction';
import TransactionList from './features/history/TransactionList';
import BottomNav, { type Tab } from './components/layout/BottomNav/BottomNav';
import './App.css';

function App() {
  const { transactions, loading, addTransaction, deleteTransaction, updateTransaction } = useTransactions();
  const [showAdd, setShowAdd] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  const [currencySymbol, setCurrencySymbol] = useState(() => {
    const saved = localStorage.getItem('gofinancial_currency');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.symbol || '₦';
      } catch {
        return '₦';
      }
    }
    return '₦';
  });

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
            onCurrencyChange={setCurrencySymbol} 
          />
          <TransactionList
            transactions={transactions}
            categories={defaultCategories}
            onDelete={deleteTransaction}
            onUpdate={updateTransaction}
            currencySymbol={currencySymbol}
          />
        </>
      )}

      {currentTab === 'history' && (
        <TransactionList
          transactions={transactions}
          categories={defaultCategories}
          onDelete={deleteTransaction}
          onUpdate={updateTransaction}
          currencySymbol={currencySymbol}
        />
      )}

      {currentTab === 'insight' && (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <h2>Insights Coming Soon</h2>
        </div>
      )}

      {showAdd && (
        <AddTransaction
          categories={defaultCategories}
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
