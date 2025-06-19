import React, { createContext, useContext, useState, useCallback } from 'react';

const ToasterContext = createContext();

export function ToasterProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, message, type }]);
    setTimeout(() => {
      setToasts(ts => ts.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToasterContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            marginBottom: 12,
            padding: '12px 24px',
            borderRadius: 6,
            background: t.type === 'error' ? '#ffdddd' : '#e6ffe6',
            color: t.type === 'error' ? '#a00' : '#070',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            minWidth: 200,
            fontWeight: 500,
          }}>{t.message}</div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
}

export function useToaster() {
  return useContext(ToasterContext);
} 