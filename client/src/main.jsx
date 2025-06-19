import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ToasterProvider } from './components/Toaster';
import { setToasterInstance } from './api/axios';
import { useToaster } from './components/Toaster';
import './index.css';

const queryClient = new QueryClient();

export function ToasterBridge({ children }) {
  return (
    <ToasterProvider>
      <ToasterContextConsumer />
      {children}
    </ToasterProvider>
  );
}

function ToasterContextConsumer() {
  const { showToast } = useToaster();
  React.useEffect(() => {
    setToasterInstance(showToast);
  }, [showToast]);
  return null;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToasterBridge>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </ToasterBridge>
    </QueryClientProvider>
  </React.StrictMode>
); 