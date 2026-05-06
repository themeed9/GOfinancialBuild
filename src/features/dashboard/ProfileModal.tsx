import { useState, useEffect, useRef } from 'react';
import type { User } from '../../types';
import styles from './Dashboard.module.css';
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        onUpdateUser({ profileImage: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUsername = () => {
    if (username.trim() && username !== user.username) {
      onUpdateUser({ username: username.trim() });
      setIsEditingName(false);
    }
  };

  return (
    <div className={styles.profileOverlay} onClick={onClose}>
      <div className={styles.profileModalFull} ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className={styles.profileHeaderFull}>
          <h3>Profile</h3>
          <div style={{ flex: 1 }}></div>
          <button className={styles.closeButtonFull} onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.profileImageSectionFull}>
          <div className={styles.profileImageWrapper}>
            {previewImage ? (
              <img src={previewImage} alt="Profile" className={styles.profileImageFull} />
            ) : (
              <div className={styles.profileImagePlaceholderFull}>
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

        <div className={styles.profileNameSection}>
          {isEditingName ? (
            <div className={styles.editNameRow}>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.usernameInputFull}
                maxLength={20}
                autoFocus
              />
              <button 
                className={styles.saveButtonFull}
                onClick={handleSaveUsername}
                disabled={!username.trim() || username === user.username}
              >
                Save
              </button>
            </div>
          ) : (
            <div className={styles.nameDisplayRow}>
              <h4 className={styles.userNameFull}>{user.username}</h4>
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

        <div className={styles.profileFieldsFull}>
          <div className={styles.readOnlyContainer}>
            <div className={styles.readOnlyField}>
              <div className={styles.fieldIconFull}><MdPerson size={20} /></div>
              <div className={styles.fieldContentFull}>
                <span className={styles.fieldLabelFull}>Full Name</span>
                <span className={styles.fieldValueFull}>{user.fullName || 'Not set'}</span>
              </div>
            </div>

            <div className={styles.readOnlyField}>
              <div className={styles.fieldIconFull}><MdEmail size={20} /></div>
              <div className={styles.fieldContentFull}>
                <span className={styles.fieldLabelFull}>Email</span>
                <span className={styles.fieldValueFull}>{user.email || 'Not set'}</span>
              </div>
            </div>

            <div className={styles.readOnlyField}>
              <div className={styles.fieldIconFull}><MdMoney size={20} /></div>
              <div className={styles.fieldContentFull}>
                <span className={styles.fieldLabelFull}>Currency</span>
                <span className={styles.fieldValueFull}>{user.currency}</span>
              </div>
            </div>

            <div className={styles.readOnlyField}>
              <div className={styles.fieldIconFull}><MdPublic size={20} /></div>
              <div className={styles.fieldContentFull}>
                <span className={styles.fieldLabelFull}>Locale</span>
                <span className={styles.fieldValueFull}>{user.locale}</span>
              </div>
            </div>

            <div className={styles.readOnlyField}>
              <div className={styles.fieldIconFull}><MdCalendarToday size={20} /></div>
              <div className={styles.fieldContentFull}>
                <span className={styles.fieldLabelFull}>Member since</span>
                <span className={styles.fieldValueFull}>
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
