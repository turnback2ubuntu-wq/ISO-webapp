import React from 'react';
import Modal from '../common/Modal';
import { History, GitCommit, FileText, CheckCircle2 } from 'lucide-react';

export default function VersionHistoryModal({ isOpen, onClose, document }) {
  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Jejak Riwayat Versi: ${document.code}`}
      size="normal"
      footer={
        <button className="btn btn-secondary" onClick={onClose}>
          Tutup
        </button>
      }
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {document.title}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Pemetaan: {document.clause} • PIC: {document.pic}
        </div>
      </div>

      <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-subtle)', marginLeft: '0.5rem' }}>
        {(document.history || []).map((item, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              marginBottom: '1.25rem'
            }}
          >
            {/* Dot marker */}
            <div
              style={{
                position: 'absolute',
                left: '-1.95rem',
                top: '0.2rem',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: idx === 0 ? 'var(--color-primary)' : 'var(--border-subtle)',
                border: '2px solid var(--bg-surface)',
                boxShadow: idx === 0 ? '0 0 8px var(--color-primary)' : 'none'
              }}
            />

            <div style={{
              background: idx === 0 ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${idx === 0 ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <span className="badge badge-version" style={{ fontWeight: 700, fontSize: '0.75rem' }}>
                  {item.version}
                  {idx === 0 && <span style={{ marginLeft: '0.375rem', color: '#60A5FA' }}>(Versi Aktif)</span>}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.date}
                </span>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {item.note}
              </div>

              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                Diterbitkan / diperbarui oleh: <strong>{item.author}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
