import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  itemName,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="erp-document relative w-full max-w-md">
        <div className="erp-titlebar flex items-center justify-between pr-2">
          <span>{title}</span>
          <button type="button" onClick={onCancel} className="p-0.5"><X size={16} /></button>
        </div>

        <div className="erp-form-panel">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            <p className="text-sm">{message}</p>
          </div>
          {itemName && (
            <p className="erp-stat-box erp-strong text-sm">{itemName}</p>
          )}
        </div>

        <div className="erp-toolbar flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="erp-btn-ghost">Cancel</button>
          <button type="button" onClick={onConfirm} className="erp-btn-ghost border-red-700 text-red-700 dark:text-red-400">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
