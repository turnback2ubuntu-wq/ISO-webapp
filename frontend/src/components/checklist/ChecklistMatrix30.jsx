import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  Upload,
  Eye,
  Download,
  Search,
  Filter,
  Info
} from 'lucide-react';
import { api } from '../../services/api';

export default function ChecklistMatrix30({ onOpenUpload, onOpenPreview, activeRole }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoot, setSelectedRoot] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getChecklist();
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to load checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleNA = async (item) => {
    const nextStatus = item.status === 'not_applicable' ? 'missing' : 'not_applicable';
    try {
      await api.updateChecklistStatus(item.id, {
        status: nextStatus,
        notes: nextStatus === 'not_applicable' ? 'Dikecualikan sesuai petunjuk checklist' : null,
      });
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedRoot !== 'ALL' && item.root_folder !== selectedRoot) return false;
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDoc = item.document_name.toLowerCase().includes(q);
      const matchClause = item.iso_clause.toLowerCase().includes(q);
      const matchCode = item.code.toLowerCase().includes(q);
      const matchExec = (item.executor || '').toLowerCase().includes(q);
      return matchDoc || matchClause || matchCode || matchExec;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px'
            }}>
              ISO 21001:2018 EOMS
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Dokumen Acuan: Checklist_Poin7_General_ISO21001_FT.xlsx
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>
            Matriks Dokumen Checklist Poin 7 — Fakultas Teknik
          </h2>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: '#cbd5e1' }}>
            Program Studi S1 Teknik Industri (TIND) • Periode Data: Semester Genap 2025/2026 (30 Item Instrumen)
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Instrumen
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>
            30 <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 400 }}>Item</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        background: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '0.45rem 0.75rem',
          flex: '1 1 280px'
        }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Cari nama dokumen, klausul ISO, atau kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* Filter Root Folder */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="#64748b" />
          <select
            value={selectedRoot}
            onChange={(e) => setSelectedRoot(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.85rem',
              color: '#334155'
            }}
          >
            <option value="ALL">Semua Root Folder (5 Kategori)</option>
            <option value="01_Kurikulum">01_Kurikulum</option>
            <option value="02_Skripsi">02_Skripsi</option>
            <option value="03_Wisuda">03_Wisuda</option>
            <option value="04_Evaluasi-dan-Akreditasi">04_Evaluasi-dan-Akreditasi</option>
            <option value="05_Penelitian-dan-PkM">05_Penelitian-dan-PkM</option>
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.85rem',
              color: '#334155'
            }}
          >
            <option value="ALL">Semua Status Audit</option>
            <option value="verified">Disetujui (Approved)</option>
            <option value="submitted">Review (Menunggu)</option>
            <option value="missing">Belum Diunggah</option>
            <option value="not_applicable">Tidak Berlaku (N/A)</option>
            <option value="rejected">NCR / Perlu Revisi</option>
          </select>
        </div>
      </div>

      {/* Main 30-Item Checklist Table */}
      <div style={{
        background: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                <th style={{ padding: '0.75rem 0.6rem', textAlign: 'center', width: '45px' }}>No</th>
                <th style={{ padding: '0.75rem 0.6rem', width: '60px' }}>Kode</th>
                <th style={{ padding: '0.75rem 0.75rem', width: '150px' }}>Root Folder</th>
                <th style={{ padding: '0.75rem 0.75rem', width: '180px' }}>Subfolder</th>
                <th style={{ padding: '0.75rem 1rem' }}>Dokumen (General Checklist Poin 7)</th>
                <th style={{ padding: '0.75rem 0.75rem', width: '110px' }}>Dasar ISO</th>
                <th style={{ padding: '0.75rem 0.75rem', width: '110px' }}>Pelaksana</th>
                <th style={{ padding: '0.75rem 0.75rem', width: '90px' }}>Level</th>
                <th style={{ padding: '0.75rem 0.75rem', width: '110px' }}>Status</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'right', width: '130px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Memuat data checklist instrumen ISO 21001...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Tidak ada item checklist yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: item.status === 'verified' ? '#f0fdf4' : item.status === 'not_applicable' ? '#f8fafc' : '#ffffff',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '0.75rem 0.6rem', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                      {item.item_no}
                    </td>

                    <td style={{ padding: '0.75rem 0.6rem' }}>
                      <span style={{
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        background: '#e2e8f0',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: '#1e293b'
                      }}>
                        {item.code}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem 0.75rem', fontWeight: 500, color: '#1e293b', fontSize: '0.8rem' }}>
                      {item.root_folder}
                    </td>

                    <td style={{ padding: '0.75rem 0.75rem', color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      {item.subfolder}
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {item.document_name}
                      </div>
                      {item.instructions && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          marginTop: '0.25rem',
                          fontSize: '0.75rem',
                          color: '#b45309',
                          background: '#fef3c7',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px'
                        }}>
                          <Info size={11} />
                          {item.instructions}
                        </div>
                      )}
                      {item.is_per_course && (
                        <span style={{
                          marginLeft: '0.5rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: '#e0e7ff',
                          color: '#3730a3',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}>
                          Per-MK
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.75rem 0.75rem', color: '#2563eb', fontWeight: 600, fontSize: '0.75rem' }}>
                      {item.iso_clause}
                    </td>

                    <td style={{ padding: '0.75rem 0.75rem', color: '#475569', fontSize: '0.8rem' }}>
                      {item.executor}
                    </td>

                    <td style={{ padding: '0.75rem 0.75rem', color: '#64748b', fontSize: '0.8rem' }}>
                      {item.level}
                    </td>

                    <td style={{ padding: '0.75rem 0.75rem' }}>
                      {renderChecklistStatus(item.status)}
                    </td>

                    <td style={{ padding: '0.75rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        {item.document ? (
                          <button
                            onClick={() => onOpenPreview(item.document)}
                            title="Pratinjau Berkas"
                            style={{
                              padding: '0.35rem 0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#1e293b',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Eye size={13} />
                          </button>
                        ) : null}

                        <button
                          onClick={() => onOpenUpload({ item })}
                          title="Unggah Dokumen"
                          style={{
                            padding: '0.35rem 0.5rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#2563eb',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Upload size={13} />
                        </button>

                        {/* Toggle N/A option */}
                        <button
                          onClick={() => handleToggleNA(item)}
                          title={item.status === 'not_applicable' ? 'Batalkan N/A' : 'Tandai Tidak Berlaku (N/A)'}
                          style={{
                            padding: '0.35rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: item.status === 'not_applicable' ? '#f1f5f9' : '#ffffff',
                            color: item.status === 'not_applicable' ? '#ef4444' : '#64748b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Ban size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function renderChecklistStatus(status) {
  switch (status) {
    case 'verified':
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.2rem 0.5rem',
          borderRadius: '999px',
          background: '#dcfce7',
          color: '#15803d',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}>
          <CheckCircle2 size={12} /> Disetujui
        </span>
      );
    case 'submitted':
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.2rem 0.5rem',
          borderRadius: '999px',
          background: '#fef3c7',
          color: '#b45309',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}>
          <Clock size={12} /> Review
        </span>
      );
    case 'rejected':
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.2rem 0.5rem',
          borderRadius: '999px',
          background: '#fee2e2',
          color: '#b91c1c',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}>
          <AlertTriangle size={12} /> NCR
        </span>
      );
    case 'not_applicable':
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.2rem 0.5rem',
          borderRadius: '999px',
          background: '#f1f5f9',
          color: '#64748b',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}>
          <Ban size={12} /> N/A
        </span>
      );
    case 'missing':
    default:
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.2rem 0.5rem',
          borderRadius: '999px',
          background: '#fef2f2',
          color: '#dc2626',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}>
          Belum Ada
        </span>
      );
  }
}
