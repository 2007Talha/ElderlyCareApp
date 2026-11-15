'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: React.ReactNode;
}

/** Accessible modal dialog with focus trap and escape-to-close. */
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="bg-surface border border-gray-700 rounded-2xl p-0 w-full max-w-lg backdrop:bg-black/60"
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 id="modal-title" className="text-lg font-bold text-white">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 text-gray-200">{children}</div>
    </dialog>
  );
}
