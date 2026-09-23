import React from 'react';
import { useDocument } from '../../context/DocumentContext';
import { History, Activity } from 'lucide-react';

export default function AuditTrailFeed() {
  const { auditTrail } = useDocument();

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Activity size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Jejak Audit Real-time (Audit Trail)</span>
          </h2>
          <p className="card-subtitle">
            Log aktivitas verifikasi, revisi versi, dan otorisasi kebijakan
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '340px', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {auditTrail.map((log) => (
          <div
            key={log.id}
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              borderLeft: `3px solid ${
                log.type === 'danger' ? 'var(--color-danger)' :
                log.type === 'success' ? 'var(--color-success)' :
                log.type === 'purple' ? 'var(--color-purple)' :
                log.type === 'warning' ? 'var(--color-warning)' : 'var(--color-primary)'
              }`,
              borderTop: '1px solid rgba(255, 255, 255, 0.04)',
              borderRight: '1px solid rgba(255, 255, 255, 0.04)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
              fontSize: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {log.action}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                {log.timestamp}
              </span>
            </div>

            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              {log.target}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
              <span>Oleh: <strong>{log.actor}</strong> ({log.role})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
