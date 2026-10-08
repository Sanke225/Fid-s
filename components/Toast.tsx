'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckIcon, CloseIcon } from './Icons';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = 'toast_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          bottom: '32px',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
          maxWidth: '90vw'
        }}
      >
        {toasts.map(toast => {
          const iconBg =
            toast.type === 'success'
              ? 'var(--success)'
              : toast.type === 'error'
              ? 'var(--danger)'
              : toast.type === 'warning'
              ? 'var(--warning)'
              : 'var(--color-accent)';

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px 12px 14px',
                borderRadius: '999px',
                background: 'var(--color-text)',
                color: 'var(--color-bg)',
                boxShadow: 'var(--shadow-float)',
                fontSize: '14px',
                fontWeight: 600,
                backdropFilter: 'blur(16px)',
                whiteSpace: 'nowrap',
                animation: 'rise .3s cubic-bezier(.2,.8,.2,1)'
              }}
            >
              <span
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: iconBg,
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  flex: 'none'
                }}
              >
                {toast.type === 'error' ? <CloseIcon size={14} color="#fff" /> : <CheckIcon size={14} color="#fff" />}
              </span>
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
