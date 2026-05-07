import { useState, useEffect, useRef, useCallback } from 'react';
import type { Transaction, Category } from '../../types';
import styles from './TransactionList.module.css';
import { MdClose, MdDelete, MdExpandMore } from 'react-icons/md';
import { useI18n } from '../../hooks/useI18n';

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
  const { strings } = useI18n();
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [note, setNote] = useState(transaction.note);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showConfirmation) {
          setShowConfirmation(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose, showConfirmation]);

  const selectedCategory = categories.find(c => c.id === categoryId) || categories[0];

  const handleSave = useCallback(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (!note.trim()) {
      setDescriptionError(true);
      return;
    }

    onSave(transaction.id, {
      amount: numAmount,
      categoryId,
      note: sanitizeInput(note),
      updatedAt: Date.now(),
    });
    onClose();
  }, [amount, categoryId, note, transaction.id, onSave, onClose]);

  const handleDeleteClick = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    onDelete(transaction.id);
    setShowConfirmation(false);
    onClose();
  }, [transaction.id, onDelete, onClose]);

  const handleDeleteCancel = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  return (
    <>
    <div className={styles.editOverlay} onClick={onClose}>
      <div
        className={styles.editModal}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.editHeader}>
          <h3>{strings.edit_expense}</h3>
          <div className={styles.spacer}></div>
          <button className={styles.closeButtonFull} onClick={onClose} aria-label="Close edit modal">
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.editForm}>
          <div className={styles.editField}>
            <label className={styles.editLabel} htmlFor="edit-amount">{strings.amount}</label>
            <input
              id="edit-amount"
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
            <label className={styles.editLabel}>{strings.category}</label>
            <div className={styles.categorySelectorContainer} ref={categoryRef}>
              <button
                className={styles.categorySelectorBox}
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                type="button"
                aria-expanded={isCategoryOpen}
                aria-haspopup="listbox"
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
                <div className={styles.categoryDropdown} role="listbox">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      className={`${styles.categoryOption} ${c.id === categoryId ? styles.categoryOptionSelected : ''}`}
                      onClick={() => {
                        setCategoryId(c.id);
                        setIsCategoryOpen(false);
                      }}
                      type="button"
                      role="option"
                      aria-selected={c.id === categoryId}
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
            <label className={styles.editLabel} htmlFor="edit-note">{strings.description}</label>
            <div className={styles.editInputWrapper}>
              <input
                id="edit-note"
                type="text"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  if (descriptionError) setDescriptionError(false);
                }}
                className={`${styles.editInput} ${descriptionError ? styles.editInputError : ''}`}
                placeholder={strings.description_placeholder}
                maxLength={50}
                autoComplete="off"
              />
            </div>
            {descriptionError && <span className={styles.editInlineError}>{strings.error_enter_description}</span>}
          </div>
        </div>

        <div className={styles.editActions}>
          <button className={styles.deleteButton} onClick={handleDeleteClick}>
            <MdDelete size={18} />
            {strings.delete}
          </button>
          <button
            className={styles.saveButtonFull}
            onClick={handleSave}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            {strings.save_changes}
          </button>
        </div>
      </div>
    </div>

    {showConfirmation && (
      <div className={styles.confirmationOverlay} onClick={handleDeleteCancel}>
        <div className={styles.confirmationDialog} onClick={(e) => e.stopPropagation()}>
          <h3 className={styles.confirmationTitle}>{strings.delete_transaction_title}</h3>
          <p className={styles.confirmationMessage}>
            {strings.delete_confirm_msg}
          </p>
          <div className={styles.confirmationActions}>
            <button className={styles.confirmationCancel} onClick={handleDeleteCancel}>
              {strings.cancel}
            </button>
            <button className={styles.confirmationConfirm} onClick={handleDeleteConfirm}>
              {strings.delete}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 50);
}
