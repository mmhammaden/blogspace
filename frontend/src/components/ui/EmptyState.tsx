import { ReactNode } from "react";
import { FileText } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-gray-300 dark:text-gray-600 mb-4">
        {icon || <FileText className="w-16 h-16" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
