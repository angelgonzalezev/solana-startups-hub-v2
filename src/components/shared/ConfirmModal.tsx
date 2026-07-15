'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Blocking confirmation for destructive actions.
const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, confirmLabel, busy, onConfirm, onCancel }) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [busy, onCancel]);

  // Portal to <body> so ancestors with transforms cannot trap the fixed
  // overlay inside their own box.
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !busy && onCancel()}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md space-y-6 rounded-[30px] border border-red-500/25 bg-[#0A0A0A] p-8 text-center">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <p className="text-white/70">{message}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <button
            onClick={onConfirm}
            disabled={busy}
            className="btn btn-md w-full border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-50 sm:flex-1">
            {confirmLabel}
          </button>
          <button onClick={onCancel} disabled={busy} className="btn btn-white-dark btn-md w-full sm:flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmModal;
