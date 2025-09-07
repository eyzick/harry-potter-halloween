import React, { useState, useEffect, useRef } from 'react';
import './PasswordPrompt.css';
import { LockClosedIcon, Cross2Icon, EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';

interface PasswordPromptProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hashPassword = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString();
    };

    const correctHash = '1347871041';
    const inputHash = hashPassword(password.toLowerCase());

    if (inputHash === correctHash) {
      onSuccess();
    } else {
      setAttempts(prev => prev + 1);
      setError(`Incorrect password. Attempt ${attempts + 1}/3`);
      setPassword('');
      
      if (attempts >= 2) {
        setError('Too many failed attempts. Access denied.');
        setTimeout(() => {
          onCancel();
        }, 2000);
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };

  return (
    <div className="password-overlay">
      <div className="password-prompt">
        <div className="password-header">
          <h3>
            <LockClosedIcon className="icon" />
            Admin Access Required
          </h3>
          <button className="password-close-button" onClick={onCancel}>
            <Cross2Icon className="icon" />
          </button>
        </div>
        
        <div className="password-body">
          <p className="password-description">
            Enter the admin password to access the dashboard:
          </p>
          
          <form onSubmit={handleSubmit} className="password-form">
            <div className="password-input-container">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter password"
                className="password-input"
                maxLength={20}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeClosedIcon className="icon" /> : <EyeOpenIcon className="icon" />}
              </button>
            </div>
            
            {error && (
              <div className="password-error">
                {error}
              </div>
            )}
            
            <div className="password-actions">
              <button type="button" className="password-cancel" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="password-submit">
                Access Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordPrompt;
