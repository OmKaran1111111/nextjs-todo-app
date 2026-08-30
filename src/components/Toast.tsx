"use client";

import { Icon } from "@/components/ui/Icon";

interface ToastProps {
  message?: string | null;
  onDismiss: () => void;
}

const Toast = ({ message, onDismiss }: ToastProps) => {
  if (!message) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-danger text-white py-3 px-4 rounded-[10px] shadow-popover max-w-[min(420px,90vw)] text-sm"
      role="alert"
    >
      <span className="flex-1">{message}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="bg-transparent border-0 text-white cursor-pointer leading-none opacity-85 hover:opacity-100"
        aria-label="Dismiss"
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  );
};

export default Toast;