'use client';
import { createContext, useContext, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext({ show: () => {} });

export function AdminToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const value = useMemo(() => ({
    show(message, type = "success") {
      const id = `${Date.now()}-${Math.random()}`;
      setItems((old) => [...old, { id, message, type }]);
      window.setTimeout(() => {
        setItems((old) => old.filter((item) => item.id !== id));
      }, 3200);
    },
  }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="adminToastContainer" aria-live="polite">
        {items.map((item) => (
          <div className={`adminToast ${item.type}`} key={item.id}>
            {item.type === "error" ? <AlertCircle /> : item.type === "info" ? <Info /> : <CheckCircle2 />}
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useAdminToast = () => useContext(ToastContext);
