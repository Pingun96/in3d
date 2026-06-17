import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  hideCancel?: boolean;
}

interface NotificationContextProps {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showDialog: (options: DialogOptions) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<(ToastOptions & { id: number })[]>([]);
  const [dialog, setDialog] = useState<DialogOptions | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const showDialog = useCallback((options: DialogOptions) => {
    setDialog(options);
  }, []);

  const closeDialog = () => {
    setDialog(null);
  };

  return (
    <NotificationContext.Provider value={{ showToast, showDialog }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md transform transition-all duration-300
              ${toast.type === 'success' ? 'bg-[#00e676]/10 border-[#00e676]/30 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-white' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-white' : ''}
              ${toast.type === 'info' ? 'bg-blue-500/10 border-blue-500/30 text-white' : ''}
            `}
            style={{ animation: 'slideIn 0.3s ease-out forwards' }}
          >
            {/* Icons based on type */}
            {toast.type === 'success' && (
              <svg className="w-5 h-5 text-[#00e676]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.type === 'warning' && (
              <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Dialog Overlay */}
      {dialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="bg-[#1e1e1e] border border-[#333] rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
          >
            <h3 className="text-xl font-bold text-white mb-2">{dialog.title}</h3>
            <p className="text-[#a0a0a0] mb-6 text-sm">{dialog.message}</p>
            <div className="flex gap-3 justify-end mt-auto">
              {!dialog.hideCancel && (
                <button
                  onClick={() => {
                    dialog.onCancel?.();
                    closeDialog();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2a2a2a] text-white hover:bg-[#333] transition-colors text-sm font-medium"
                >
                  {dialog.cancelText || 'Hủy'}
                </button>
              )}
              <button
                onClick={() => {
                  dialog.onConfirm?.();
                  closeDialog();
                }}
                className="px-4 py-2 rounded-xl bg-[#00e676] text-black hover:bg-[#00c853] transition-colors text-sm font-semibold"
              >
                {dialog.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};
