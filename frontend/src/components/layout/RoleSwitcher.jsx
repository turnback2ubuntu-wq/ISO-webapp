import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, ShieldCheck, UserCheck, Briefcase, Settings, UserCog } from 'lucide-react';
import RoleEditModal from './RoleEditModal';

export default function RoleSwitcher() {
  const { activeRoleKey, activeRole, switchRole, allRoles } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to describe role permissions
  const getRoleDescription = (key, role) => {
    if (key === 'gpm') return 'Unggah instrumen, perbarui versi, respons temuan';
    if (key === 'kaprodi') return 'Otorisasi kebijakan prodi, disposisi, cetak laporan';
    if (key === 'auditor') return 'Verifikasi bukti objektif, terbitkan NCR/Observasi';

    const p = role.permissions || {};
    const activePerms = [];
    if (p.canUpload) activePerms.push('Unggah Berkas');
    if (p.canApproveFormal) activePerms.push('Otorisasi');
    if (p.canIssueNCR) activePerms.push('Penerbitan NCR');
    if (p.canSignReport) activePerms.push('Tanda Tangan');
    if (p.canComment) activePerms.push('Komentar');

    return activePerms.length > 0 ? activePerms.join(' • ') : 'Akses Read-Only';
  };

  return (
    <>
      <div className="role-switcher-wrapper" ref={dropdownRef}>
        <button
          className="role-switcher-btn"
          onClick={() => setIsOpen(!isOpen)}
          title="Beralih Peran Pengguna (Simulasi RBAC)"
        >
          <span className={`role-dot ${activeRole.badgeClass}`} />
          <span>{activeRole.shortTitle}</span>
          <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>
            ({activeRole.name ? activeRole.name.split(' ')[0] : 'User'})
          </span>
          <ChevronDown size={14} style={{ opacity: 0.7 }} />
        </button>

        {isOpen && (
          <div className="role-dropdown-menu" style={{ width: '330px' }}>
            <div className="role-menu-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Simulasi Multi-Peran (RBAC)</span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsEditModalOpen(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary, #2563eb)',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
                title="Buka form edit profil dan hak akses RBAC"
              >
                <Settings size={13} />
                <span>Edit</span>
              </button>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {Object.entries(allRoles).map(([key, role]) => (
                <button
                  key={key}
                  className={`role-menu-item ${activeRoleKey === key ? 'active' : ''}`}
                  onClick={() => {
                    switchRole(key);
                    setIsOpen(false);
                  }}
                >
                  <div style={{ fontSize: '1.25rem', marginTop: '2px' }}>
                    {role.avatar || '👤'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div className="role-item-title">
                      <span>{role.shortTitle || role.title}</span>
                      {activeRoleKey === key && (
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-primary, #2563eb)', fontWeight: 700 }}>
                          • Aktif
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary, #1e293b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {role.name}
                    </div>
                    <div className="role-item-desc" style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)' }}>
                      {getRoleDescription(key, role)}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Bottom Edit Action */}
            <div style={{
              padding: '0.5rem',
              borderTop: '1px solid var(--color-border, #e2e8f0)',
              background: '#f8fafc',
            }}>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsEditModalOpen(true);
                }}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                  background: '#ffffff',
                  color: '#2563eb',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <UserCog size={14} />
                <span>Kelola & Edit Peran (RBAC)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Edit Modal */}
      <RoleEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}
