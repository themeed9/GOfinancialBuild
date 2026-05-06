import { useState, useEffect, useRef } from 'react';
import type { Transaction, Category } from '../../types';
import styles from './TransactionList.module.css';
import { MdClose, MdDelete, MdExpandMore } from 'react-icons/md';

interface EditTransactionModalProps {
  transaction: Transaction;
  categories: Category[];
  onClose: () => void;
  onSave: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
}

export default function EditTransactionModal({ 
  transaction, 
  categories, 
  onClose, 
  onSave, 
  onDelete 
}: EditTransactionModalProps) {
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [note, setNote] = useState(transaction.note);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const categoryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const selectedCategory = categories.find(c => c.id === categoryId) || categories[0];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    onSave(transaction.id, {
      amount: numAmount,
      categoryId,
      note,
      updatedAt: Date.now(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Delete this transaction?')) {
      onDelete(transaction.id);
      onClose();
    }
  };

  return (
    <div className={styles.editOverlay} onClick={onClose}>
      <div 
        className={styles.editModal} 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.editHeader}>
          <h3>Edit Expense</h3>
          <div style={{ flex: 1 }}></div>
          <button className={styles.closeButtonFull} onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.editForm}>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.editInput}
              min="0"
              step="0.01"
              autoFocus
            />
          </div>

          <div className={styles.editField}>
            <label className={styles.editLabel}>Category</label>
            <div className={styles.categorySelectorContainer} ref={categoryRef}>
              <button 
                className={styles.categorySelectorBox}
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                type="button"
              >
                <div className={styles.categoryCurrent}>
                  <span className={styles.categoryIcon}>{selectedCategory.icon}</span>
                  <span className={styles.categoryName}>{selectedCategory.name}</span>
                </div>
                <MdExpandMore 
                  size={24} 
                  className={`${styles.categoryChevron} ${isCategoryOpen ? styles.chevronOpen : ''}`} 
                />
              </button>
              
              {isCategoryOpen && (
                <div className={styles.categoryDropdown}>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      className={`${styles.categoryOption} ${c.id === categoryId ? styles.categoryOptionSelected : ''}`}
                      onClick={() => {
                        setCategoryId(c.id);
                        setIsCategoryOpen(false);
                      }}
                      type="button"
                    >
                      <span className={styles.categoryIcon}>{c.icon}</span>
                      <span className={styles.categoryName}>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.editField}>
            <label className={styles.editLabel}>Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={styles.editInput}
              placeholder="Add a note"
              maxLength={50}
            />
          </div>
        </div>

        <div className={styles.editActions}>
          <button className={styles.deleteButton} onClick={handleDelete}>
            <MdDelete size={18} />
            Delete
          </button>
          <button 
            className={styles.saveButtonFull}
            onClick={handleSave}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
