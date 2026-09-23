import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  UserCog,
  ShieldCheck,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info
} from 'lucide-react';

const PRESET_EMOJIS = ['👨‍💼', '🎓', '🔍', '🧑‍🏫', '👩‍💼', '👨‍🔬', '📋', '🏛️', '💼', '👤'];

const BADGE_PRESETS = [
  { value: 'gpm', label: 'Cyan / Biru (GPM)', color: '#06b6d4' },
  { value: 'kaprodi', label: 'Ungu (Kaprodi)', color: '#a855f7' },
  { value: 'auditor', label: 'Amber (Auditor)', color: '#f59e0b' },
  { value: 'emerald', label: 'Hijau (Dosen)', color: '#10b981' },
  { value: 'rose', label: 'Merah (Pimpinan)', color: '#f43f5e' },
];

export default function RoleEditModal({ isOpen, onClose }) {
  const {
    roles,
    activeRoleKey,
    switchRole,
    updateRole,
    addRole,
    deleteRole,
    resetRoles,
  } = useAuth();

  const [selectedRoleKey, setSelectedRoleKey] = useState(activeRoleKey || 'gpm');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    shortTitle: '',
    name: '',
    nip: '',
    department: '',
    badgeClass: 'gpm',
    avatar: '👤',
    permissions: {
      canUpload: false,
      canRevise: false,
      canComment: true,
      canApproveFormal: false,
      canIssueNCR: false,
      canSignReport: false,
    },
  });

  // Sync form data when selected role changes
  useEffect(() => {
    if (!isOpen) return;

    if (isCreatingNew) {
      setFormData({
        title: 'Dosen Pengampu Mata Kuliah',
        shortTitle: 'Dosen',
        name: 'Dr. Ir. Andy Haryoko, M.T.',
        nip: '19820715 200812 1 003',
        department: 'S1 Teknik Informatika',
        badgeClass: 'emerald',
        avatar: '🧑‍🏫',
        permissions: {
          canUpload: true,
          canRevise: true,
          canComment: true,
          canApproveFormal: false,
          canIssueNCR: false,
          canSignReport: false,
        },
      });
      setNewKeyInput('dosen');
    } else {
      const current = roles[selectedRoleKey] || roles[activeRoleKey] || Object.values(roles)[0];
      if (current) {
        setFormData({
          title: current.title || '',
          shortTitle: current.shortTitle || '',
          name: current.name || '',
          nip: current.nip || '',
          department: current.department || '',
          badgeClass: current.badgeClass || 'gpm',
          avatar: current.avatar || '👤',
          permissions: {
            canUpload: !!current.permissions?.canUpload,
            canRevise: !!current.permissions?.canRevise,
            canComment: !!current.permissions?.canComment,
            canApproveFormal: !!current.permissions?.canApproveFormal,
            canIssueNCR: !!current.permissions?.canIssueNCR,
            canSignReport: !!current.permissions?.canSignReport,
          },
        });
      }
    }
  }, [isOpen, selectedRoleKey, isCreatingNew, roles, activeRoleKey]);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handlePermissionToggle = (permKey) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permKey]: !prev.permissions[permKey],
      },
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (isCreatingNew) {
      const key = newKeyInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!key) {
        alert('Masukkan Kode ID Peran yang valid (hanya huruf, angka, atau tanda minus).');
        return;
      }
      if (roles[key]) {
        alert(`Peran dengan kode '${key}' sudah ada. Silakan gunakan kode lain.`);
        return;
      }

      addRole(key, formData);
      setIsCreatingNew(false);
      setSelectedRoleKey(key);
      showToast(`Peran baru '${formData.shortTitle}' berhasil ditambahkan!`);
    } else {
      updateRole(selectedRoleKey, formData);
      showToast(`Data peran '${formData.shortTitle}' berhasil diperbarui!`);
    }
  };

  const handleDelete = () => {
    if (Object.keys(roles).length <= 1) {
      alert('Tidak dapat menghapus peran terakhir.');
      return;
    }

    if (confirm(`Yakin ingin menghapus peran '${formData.shortTitle}'?`)) {
      const deletedKey = selectedRoleKey;
      deleteRole(deletedKey);
      const remainingKeys = Object.keys(roles).filter((k) => k !== deletedKey);
      setSelectedRoleKey(remainingKeys[0] || 'gpm');
      setIsCreatingNew(false);
      showToast(`Peran '${formData.shortTitle}' berhasil dihapus.`);
    }
  };

  const handleReset = () => {
    if (confirm('Kembalikan semua peran dan hak akses ke konfigurasi bawaan (GPM, Kaprodi, Auditor)?')) {
      resetRoles();
      setSelectedRoleKey('gpm');
      setIsCreatingNew(false);
      showToast('Peran berhasil di-reset ke setelan awal sistem.');
    }
  };

  const handleSwitchActive = () => {
    if (!isCreatingNew) {
      switchRole(selectedRoleKey);
      showToast(`Peran aktif dialihkan ke '${formData.shortTitle}'!`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      backdropFilter: 'blur(5px)',
      padding: '1rem',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '920px',
        maxHeight: '92vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.2rem 1.5rem',
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          color: '#ffffff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              padding: '0.6rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UserCog size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#ffffff' }}>
                Simulasi Multi-Peran (RBAC) & Identitas Pejabat
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Kustomisasi nama pejabat, NIP/NIDN, unit kerja, serta matriks wewenang ISO 21001 EOMS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '6px',
              display: 'flex',
            }}
            title="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toast alert */}
        {toastMsg && (
          <div style={{
            background: '#ecfdf5',
            color: '#065f46',
            borderBottom: '1px solid #a7f3d0',
            padding: '0.6rem 1.5rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Content Body: Left Role List, Right Form */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          minHeight: '480px',
        }}>
          {/* Left Sidebar: Roles List */}
          <div style={{
            width: '280px',
            borderRight: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '0.25rem' }}>
                Daftar Peran Tersedia ({Object.keys(roles).length})
              </div>

              {Object.entries(roles).map(([key, r]) => {
                const isSelected = !isCreatingNew && selectedRoleKey === key;
                const isActive = activeRoleKey === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setSelectedRoleKey(key);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 4px rgba(37,99,235,0.1)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{r.avatar || '👤'}</span>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                        <strong style={{ fontSize: '0.85rem', color: isSelected ? '#1d4ed8' : '#1e293b' }}>
                          {r.shortTitle || r.title}
                        </strong>
                        {isActive && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '1px 6px',
                            borderRadius: '999px',
                            whiteSpace: 'nowrap',
                          }}>
                            Aktif
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '2px',
                      }}>
                        {r.name}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Add New Role Button */}
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: isCreatingNew ? '1.5px solid #2563eb' : '1px dashed #cbd5e1',
                  background: isCreatingNew ? '#eff6ff' : '#ffffff',
                  color: '#2563eb',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                }}
              >
                <Plus size={15} />
                <span>Tambah Peran Baru</span>
              </button>
            </div>

            {/* Sidebar Bottom Actions */}
            <div style={{ padding: '0.85rem', borderTop: '1px solid #e2e8f0', background: '#f1f5f9' }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                title="Kembalikan semua peran ke bawaan sistem"
              >
                <RotateCcw size={13} />
                <span>Reset Standar Awal</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Role Edit Form */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            background: '#ffffff',
          }}>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Header Info of selected role */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid #e2e8f0',
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>
                    {isCreatingNew ? 'Form Tambah Peran Baru' : `Pengaturan: ${formData.shortTitle || 'Peran'}`}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {isCreatingNew
                      ? 'Tentukan identitas dan wewenang pengguna baru untuk simulasi sistem EOMS.'
                      : `ID Peran Sistem: [${selectedRoleKey}]`}
                  </p>
                </div>

                {!isCreatingNew && (
                  <button
                    type="button"
                    onClick={handleSwitchActive}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: activeRoleKey === selectedRoleKey ? '1px solid #86efac' : '1px solid #cbd5e1',
                      background: activeRoleKey === selectedRoleKey ? '#f0fdf4' : '#f8fafc',
                      color: activeRoleKey === selectedRoleKey ? '#166534' : '#334155',
                    }}
                  >
                    {activeRoleKey === selectedRoleKey ? (
                      <>
                        <Check size={14} color="#16a34a" />
                        <span>Sedang Digunakan</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} color="#2563eb" />
                        <span>Jadikan Peran Aktif</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* ID Peran (Only when creating new) */}
              {isCreatingNew && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Kode ID Peran * (huruf kecil tanpa spasi)
                  </label>
                  <input
                    type="text"
                    value={newKeyInput}
                    onChange={(e) => setNewKeyInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="contoh: dosen, dekan, asesor, laboran"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              )}

              {/* Section 1: Identitas Pejabat */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UserCog size={16} color="#2563eb" />
                  <span>1. Identitas Pejabat & Jabatan</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                      Nama Lengkap Pejabat & Gelar *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="contoh: Dr. Ir. Andy Haryoko, M.T."
                      required
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                      NIP / NIDN *
                    </label>
                    <input
                      type="text"
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      placeholder="contoh: 19820715 200812 1 003"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                      Nama Jabatan Lengkap (Title) *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="contoh: Dosen Pengampu Mata Kuliah / Koordinator KBK"
                      required
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                      Singkatan (Short Title) *
                    </label>
                    <input
                      type="text"
                      value={formData.shortTitle}
                      onChange={(e) => setFormData({ ...formData, shortTitle: e.target.value })}
                      placeholder="contoh: Dosen"
                      required
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Unit Kerja / Penugasan (Department)
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="contoh: Program Studi S1 Teknik Informatika"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                {/* Avatar and Badge Color */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                      Pilih Emoji Avatar: <span style={{ fontSize: '1.1rem' }}>{formData.avatar}</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {PRESET_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar: emoji })}
                          style={{
                            fontSize: '1.1rem',
                            padding: '0.25rem 0.45rem',
                            borderRadius: '6px',
                            border: formData.avatar === emoji ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            background: formData.avatar === emoji ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                      Warna Badge Indikator
                    </label>
                    <select
                      value={formData.badgeClass}
                      onChange={(e) => setFormData({ ...formData, badgeClass: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        background: '#ffffff',
                      }}
                    >
                      {BADGE_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Matriks Hak Akses RBAC */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={16} color="#059669" />
                    <span>2. Matriks Hak Akses & Wewenang (RBAC Permissions)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Sesuai Standar ISO 21001 EOMS
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {/* canUpload */}
                  <div
                    onClick={() => handlePermissionToggle('canUpload')}
                    style={{
                      background: formData.permissions.canUpload ? '#eff6ff' : '#ffffff',
                      border: formData.permissions.canUpload ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.canUpload}
                      onChange={() => {}}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                        Unggah Dokumen Mutu
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        Izin upload berkas silabus, RPS, instrumen perkuliahan, dan bukti EOMS.
                      </div>
                    </div>
                  </div>

                  {/* canRevise */}
                  <div
                    onClick={() => handlePermissionToggle('canRevise')}
                    style={{
                      background: formData.permissions.canRevise ? '#eff6ff' : '#ffffff',
                      border: formData.permissions.canRevise ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.canRevise}
                      onChange={() => {}}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                        Revisi & Ganti Dokumen
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        Menaikkan nomor versi dokumen (minor/major) dan mengganti file revisi.
                      </div>
                    </div>
                  </div>

                  {/* canComment */}
                  <div
                    onClick={() => handlePermissionToggle('canComment')}
                    style={{
                      background: formData.permissions.canComment ? '#eff6ff' : '#ffffff',
                      border: formData.permissions.canComment ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.canComment}
                      onChange={() => {}}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                        Catatan & Komentar Audit
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        Menulis tanggapan multi-pihak, penjelasan dosen, dan catatan klarifikasi.
                      </div>
                    </div>
                  </div>

                  {/* canApproveFormal */}
                  <div
                    onClick={() => handlePermissionToggle('canApproveFormal')}
                    style={{
                      background: formData.permissions.canApproveFormal ? '#eff6ff' : '#ffffff',
                      border: formData.permissions.canApproveFormal ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.canApproveFormal}
                      onChange={() => {}}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                        Otorisasi Kebijakan & Validasi
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        Otoritas pimpinan mengesahkan kebijakan prodi dan disposisi formal audit.
                      </div>
                    </div>
                  </div>

                  {/* canIssueNCR */}
                  <div
                    onClick={() => handlePermissionToggle('canIssueNCR')}
                    style={{
                      background: formData.permissions.canIssueNCR ? '#eff6ff' : '#ffffff',
                      border: formData.permissions.canIssueNCR ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.canIssueNCR}
                      onChange={() => {}}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                        Penerbitan Temuan NCR / Observasi
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        Wewenang auditor menerbitkan ketidaksesuaian/temuan klausul ISO 21001.
                      </div>
                    </div>
                  </div>

                  {/* canSignReport */}
                  <div
                    onClick={() => handlePermissionToggle('canSignReport')}
                    style={{
                      background: formData.permissions.canSignReport ? '#eff6ff' : '#ffffff',
                      border: formData.permissions.canSignReport ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.canSignReport}
                      onChange={() => {}}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                        Tanda Tangan Digital Laporan
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        Otoritas membubuhkan tanda tangan digital pada Laporan Kesiapan Eksekutif.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Bottom Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #e2e8f0',
              }}>
                <div>
                  {!isCreatingNew && Object.keys(roles).length > 1 && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.55rem 0.9rem',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        background: '#fef2f2',
                        color: '#dc2626',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Hapus Peran</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '0.55rem 1.15rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    style={{
                      padding: '0.55rem 1.25rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                    }}
                  >
                    <Save size={15} />
                    <span>{isCreatingNew ? 'Simpan Peran Baru' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
