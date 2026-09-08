import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast, hideToast } = useAuth();

  if (!toast || !toast.show) return null;

  const icons = {
    success: <CheckCircle2 size={20} className="toast-icon text-emerald" style={{ color: '#10B981' }} />,
    error: <AlertCircle size={20} className="toast-icon text-rose" style={{ color: '#F43F5E' }} />,
    info: <Info size={20} className="toast-icon text-indigo" style={{ color: '#818CF8' }} />
  };

  const bgColors = {
    success: 'rgba(16, 185, 129, 0.15)',
    error: 'rgba(244, 63, 94, 0.15)',
    info: 'rgba(99, 102, 241, 0.15)'
  };

  const borderColors = {
    success: 'rgba(16, 185, 129, 0.4)',
    error: 'rgba(244, 63, 94, 0.4)',
    info: 'rgba(99, 102, 241, 0.4)'
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        background: bgColors[toast.type] || bgColors.info,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${borderColors[toast.type] || borderColors.info}`,
        borderRadius: '14px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        color: '#FFFFFF',
        fontSize: '0.92rem',
        fontWeight: '500',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '90vw'
      }}
    >
      {icons[toast.type] || icons.info}
      <span>{toast.message}</span>
      <button
        onClick={hideToast}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '0.2rem',
          marginLeft: '0.5rem'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
