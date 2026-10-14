import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAccounting();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none no-print">
      <AnimatePresence>
        {toasts.map(toast => {
          const icon = {
            success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
            error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
            info: <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />,
          }[toast.type];

          const bgBorder = {
            success: 'border-emerald-200 bg-white',
            warning: 'border-amber-200 bg-white',
            error: 'border-rose-200 bg-white',
            info: 'border-teal-200 bg-white',
          }[toast.type];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg ${bgBorder} flex items-start gap-3`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-semibold text-[#14161A] leading-tight">{toast.title}</h5>
                <p className="text-xs text-[#535862] mt-0.5 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#717680] hover:text-[#14161A] p-0.5 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
