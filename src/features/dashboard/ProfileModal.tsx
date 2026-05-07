import { useState, useEffect, useRef, useCallback } from 'react';
import type { User } from '../../types';
import styles from './ProfileModal.module.css';
import { MdCameraAlt, MdEdit, MdClose, MdEmail, MdPerson, MdMoney, MdPublic, MdCalendarToday } from 'react-icons/md';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: Partial<User>) => void;
}

export default function ProfileModal({ user, onClose, onUpdateUser }: ProfileModalProps) {
  const [previewImage, setPreviewImage] = useState(user.profileImage);
  const [username, setUsername] = useState(user.username);
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be smaller than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        onUpdateUser({ profileImage: base64 });
      };
      reader.readAsDataURL(file);
    }
  }, [onUpdateUser]);

  const handleSaveUsername = useCallback(() => {
    const trimmed = sanitizeUsername(username);
    if (trimmed && trimmed !== user.username) {
      onUpdateUser({ username: trimmed });
      setIsEditingName(false);
    }
  }, [username, user.username, onUpdateUser]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Profile</h3>
          <div className={styles.spacer}></div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close profile">
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            {previewImage ? (
              <img src={previewImage} alt="Profile" className={styles.profileImage} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <MdPerson size={48} color="var(--color-on-secondary-container)" />
              </div>
            )}
            <button
              className={styles.cameraButton}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload photo"
            >
              <MdCameraAlt size={20} />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div className={styles.nameSection}>
          {isEditingName ? (
            <div className={styles.editNameRow}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.usernameInput}
                maxLength={20}
                autoFocus
                aria-label="Username"
              />
              <button
                className={styles.saveButton}
                onClick={handleSaveUsername}
                disabled={!username.trim() || username === user.username}
              >
                Save
              </button>
            </div>
          ) : (
            <div className={styles.nameDisplay}>
              <h4 className={styles.userName}>{user.username}</h4>
              <button
                className={styles.editIconButton}
                onClick={() => setIsEditingName(true)}
                aria-label="Edit username"
              >
                <MdEdit size={16} />
              </button>
            </div>
          )}
        </div>

        <div className={styles.fields}>
          <div className={styles.readOnlyContainer}>
            <div className={styles.readOnlyField}>
              <div className={styles.fieldIcon}><MdPerson size={20} /></div>
              <div className={styles.fieldContent}>
                <span className={styles.fieldLabel}>Full Name</span>
                <span className={styles.fieldValue}>{user.fullName || 'Not set'}</span>
              </div>
            </div>

            <div className={styles.readOnlyField}>
              <div className={styles.fieldIcon}><MdEmail size={20} /></div>
              <div className={styles.fieldContent}>
                <span className={styles.fieldLabel}>Email</span>
                <span className={styles.fieldValue}>{user.email || 'Not set'}</span>
              </div>
            </div>

            <div className={styles.readOnlyField}>
              <div className={styles.fieldIcon}><MdMoney size={20} /></div>
              <div className={styles.fieldContent}>
                <span className={styles.fieldLabel}>Currency</span>
                <span className={styles.fieldValue}>{user.currency}</span>
              </div>
            </div>

            <div className={styles.readOnlyField}>
              <div className={styles.fieldIcon}><MdPublic size={20} /></div>
              <div className={styles.fieldContent}>
                <span className={styles.fieldLabel}>Locale</span>
                <span className={styles.fieldValue}>{user.locale}</span>
              </div>
            </div>

            <div className={styles.readOnlyField}>
              <div className={styles.fieldIcon}><MdCalendarToday size={20} /></div>
              <div className={styles.fieldContent}>
                <span className={styles.fieldLabel}>Member since</span>
                <span className={styles.fieldValue}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function sanitizeUsername(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 20);
}
