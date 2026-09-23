import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Info } from 'lucide-react';

export default function RoleBanner() {
  const { activeRoleKey, activeRole } = useAuth();

  return (
    <div className="role-banner no-print">
      <div className="role-banner-content">
        <span className={`role-dot ${activeRole.badgeClass}`} />
        <div>
          <span>Mode Peran Aktif: <strong>{activeRole.title}</strong></span>
          <span style={{ margin: '0 0.5rem', opacity: 0.4 }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>{activeRole.name} ({activeRole.department})</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        <Info size={13} />
        {activeRoleKey === 'gpm' && <span>Hak Akses: Unggah instrumen, perbarui versi, dan kirim bukti perbaikan</span>}
        {activeRoleKey === 'kaprodi' && <span>Hak Akses: Otorisasi kebijakan akademik, disposisi perbaikan, dan unduh laporan resmi</span>}
        {activeRoleKey === 'auditor' && <span>Hak Akses: Verifikasi bukti objektif, approval formal, dan penerbitan temuan NCR</span>}
        {!['gpm', 'kaprodi', 'auditor'].includes(activeRoleKey) && (
          <span>
            Hak Akses: {Object.entries(activeRole.permissions || {})
              .filter(([_, v]) => v)
              .map(([k]) => {
                if (k === 'canUpload') return 'Unggah Berkas';
                if (k === 'canRevise') return 'Revisi Versi';
                if (k === 'canComment') return 'Komentar Audit';
                if (k === 'canApproveFormal') return 'Otorisasi';
                if (k === 'canIssueNCR') return 'Penerbitan NCR';
                if (k === 'canSignReport') return 'Tanda Tangan';
                return k;
              })
              .join(', ') || 'Read-Only'}
          </span>
        )}
      </div>
    </div>
  );
}
