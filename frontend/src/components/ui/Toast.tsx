import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Toast, ToastType } from "../../types";

const icons: Record<ToastType, JSX.Element> = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
};

const styles: Record<ToastType, string> = {
  success: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  error: "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  info: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-5 ${styles[toast.type]}`}
        >
          <span className="shrink-0 mt-0.5">{icons[toast.type]}</span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button onClick={() => onRemove(toast.id)} className="shrink-0 opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
