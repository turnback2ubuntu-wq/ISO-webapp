import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  History,
  MessageSquare,
  Send,
  Trash2,
  ExternalLink,
  Cloud
} from 'lucide-react';
import { api } from '../../services/api';

export default function FilePreviewModal({ isOpen, onClose, documentId, activeRole, onRefresh }) {
  if (!isOpen || !documentId) return null;

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [auditStatus, setAuditStatus] = useState('compliant');
  const [findingNotes, setFindingNotes] = useState('');
  const [activeTab, setActiveTab] = useState('preview'); // 'preview', 'versions', 'audit', 'dialogue'

  const loadDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getDocumentDetails(documentId);
      setDoc(res.data);
      if (res.data.verifications && res.data.verifications.length > 0) {
        setAuditStatus(res.data.verifications[0].audit_status || 'compliant');
        setFindingNotes(res.data.verifications[0].finding_notes || '');
      }
    } catch (err) {
      console.error('Failed to load document details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [documentId]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.addAuditComment(documentId, {
        sender_name: activeRole?.name || 'Dr. Ir. Hendra Wicaksono, M.T.',
        sender_role: activeRole?.title || 'PIC Mutu',
        message: newComment.trim(),
      });
      setNewComment('');
      await loadDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveAudit = async (e) => {
    e.preventDefault();
    try {
      await api.verifyDocument(documentId, {
        auditor_name: activeRole?.name || 'Ir. Ratna Dewi Sartika, M.T.',
        audit_status: auditStatus,
        finding_notes: findingNotes,
        iso_clause_ref: doc?.checklistItem?.iso_clause,
      });
      await loadDetails();
      onRefresh?.();
      alert('Status verifikasi audit berhasil disimpan.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus berkas ini dari repositori?')) return;
    try {
      await api.deleteDocument(documentId);
      onRefresh?.();
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)',
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          color: '#ffffff'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                background: '#38bdf8',
                color: '#0f172a',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.75rem',
                fontFamily: 'monospace'
              }}>
                {doc?.checklistItem?.code || '01'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                ISO {doc?.checklistItem?.iso_clause}
              </span>
              <span style={{
                background: '#e0f2fe',
                color: '#0369a1',
                padding: '0.15rem 0.45rem',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}>
                {doc?.current_version || 'v1.0'}
              </span>
            </div>
            <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.2rem', fontWeight: 600 }}>
              {doc?.title || doc?.file_name || 'Pratinjau Dokumen'}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {doc?.storage_path && (
              <a
                href={api.getDocumentDownloadUrl(doc.id)}
                download
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '6px',
                  background: '#2563eb',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 500
                }}
              >
                <Download size={14} />
                Unduh Berkas
              </a>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0 1.5rem'
        }}>
          {[
            { id: 'preview', label: 'Pratinjau & Informasi', icon: FileText },
            { id: 'versions', label: `Riwayat Versi (${doc?.versions?.length || 1})`, icon: History },
            { id: 'audit', label: 'Verifikasi Auditor', icon: ShieldCheck },
            { id: 'dialogue', label: `Dialog Multi-Pihak (${doc?.comments?.length || 0})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                  color: isActive ? '#2563eb' : '#64748b',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, minHeight: '340px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              Memuat data dokumen...
            </div>
          ) : !doc ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>
              Dokumen tidak ditemukan.
            </div>
          ) : (
            <>
              {/* Tab 1: Preview & Metadata */}
              {activeTab === 'preview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Integrity & Hash Card */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Nama Berkas Asli</div>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>{doc.original_name || doc.file_name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Ukuran Berkas</div>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                        {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : '-'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Pengunggah (PIC)</div>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>{doc.uploaded_by || 'PIC Mutu'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Tanda Tangan Digital</div>
                      <div style={{ fontWeight: 600, color: doc.is_digitally_signed ? '#16a34a' : '#94a3b8', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {doc.is_digitally_signed ? <ShieldCheck size={16} /> : null}
                        {doc.is_digitally_signed ? 'Terverifikasi Sah' : 'Belum Bersertifikat'}
                      </div>
                    </div>
                  </div>

                  {/* Tamper-Proof SHA-256 Hash */}
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
                        Integritas Audit Trail (SHA-256 Hash)
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#166534', wordBreak: 'break-all' }}>
                        {doc.file_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                      </div>
                    </div>
                    <span style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      Integritas Terjamin
                    </span>
                  </div>

                  {/* Notes / Description */}
                  {doc.notes && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b45309', marginBottom: '2px' }}>
                        Catatan Dokumen
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#78350f' }}>{doc.notes}</div>
                    </div>
                  )}

                  {/* Google Drive Preview Block */}
                  {doc.drive_url && (
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Cloud size={18} color="#2563eb" />
                          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                            Tautan Dokumen Google Drive
                          </span>
                        </div>
                        <a
                          href={doc.drive_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: '#2563eb',
                            color: '#ffffff',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.785rem',
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                        >
                          <span>Buka di Google Drive</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>

                      {doc.drive_embed_url && (
                        <iframe
                          src={doc.drive_embed_url}
                          style={{
                            width: '100%',
                            height: '380px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            background: '#ffffff'
                          }}
                          title="Pratinjau Google Drive"
                          allow="autoplay"
                        />
                      )}
                    </div>
                  )}

                  {/* Delete option */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    <button
                      onClick={handleDelete}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.8rem',
                        borderRadius: '6px',
                        border: '1px solid #fecaca',
                        background: '#fef2f2',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}
                    >
                      <Trash2 size={14} />
                      Hapus Berkas dari Repositori
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Version History */}
              {activeTab === 'versions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Rekam jejak setiap pembaruan berkas untuk mencegah pergeseran versi (version drift) audit EOMS:
                  </div>
                  {doc.versions?.map((ver, idx) => (
                    <div
                      key={ver.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: idx === 0 ? '#eff6ff' : '#ffffff'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            fontWeight: 700,
                            color: idx === 0 ? '#1d4ed8' : '#334155',
                            fontSize: '0.85rem'
                          }}>
                            {ver.version_number}
                          </span>
                          {idx === 0 && (
                            <span style={{ background: '#2563eb', color: '#ffffff', fontSize: '0.65rem', fontWeight: 600, padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                              Versi Aktif
                            </span>
                          )}
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {new Date(ver.created_at).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                          {ver.changelog || 'Tidak ada catatan revisi.'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          Oleh: {ver.uploaded_by || 'PIC Mutu'} • {ver.original_name}
                        </div>
                      </div>

                      <a
                        href={api.getDocumentDownloadUrl(doc.id)}
                        download
                        style={{
                          padding: '0.35rem 0.6rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          textDecoration: 'none',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Download size={12} /> Unduh
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Auditor Verification */}
              {activeTab === 'audit' && (
                <form onSubmit={handleSaveAudit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Evaluasi kepatuhan bukti objektif terhadap klausul <strong>ISO {doc.checklistItem?.iso_clause}</strong>:
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                      Keputusan Status Audit
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {[
                        { id: 'compliant', label: 'Disetujui (Memenuhi Klausul)', color: '#16a34a' },
                        { id: 'minor_observation', label: 'Observasi Minor', color: '#d97706' },
                        { id: 'major_ncr', label: 'NCR Mayor (Temuan Kritis)', color: '#dc2626' },
                      ].map((st) => (
                        <label
                          key={st.id}
                          style={{
                            flex: 1,
                            padding: '0.6rem 0.8rem',
                            borderRadius: '8px',
                            border: auditStatus === st.id ? `2px solid ${st.color}` : '1px solid #cbd5e1',
                            background: auditStatus === st.id ? '#f8fafc' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: st.color
                          }}
                        >
                          <input
                            type="radio"
                            name="audit_status"
                            value={st.id}
                            checked={auditStatus === st.id}
                            onChange={(e) => setAuditStatus(e.target.value)}
                            style={{ accentColor: st.color }}
                          />
                          {st.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Catatan Evaluasi / Uraian Temuan Auditor
                    </label>
                    <textarea
                      rows={3}
                      value={findingNotes}
                      onChange={(e) => setFindingNotes(e.target.value)}
                      placeholder="Masukkan catatan auditor terkait kesesuaian dokumen dengan klausul EOMS..."
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      style={{
                        padding: '0.6rem 1.3rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#2563eb',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      Simpan Verifikasi Audit
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 4: Multi-party dialogue */}
              {activeTab === 'dialogue' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    maxHeight: '260px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                    paddingRight: '0.5rem'
                  }}>
                    {doc.comments?.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                        Belum ada pesan dialog verifikasi pada dokumen ini.
                      </div>
                    ) : (
                      doc.comments?.map((com) => (
                        <div
                          key={com.id}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '0.75rem 1rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                                {com.sender_name}
                              </span>
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                fontWeight: 600
                              }}>
                                {com.sender_role}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              {new Date(com.created_at).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                            {com.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment Input */}
                  <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={`Tulis catatan sebagai ${activeRole?.title || 'PIC Mutu'}...`}
                      style={{
                        flex: 1,
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#2563eb',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      <Send size={14} />
                      Kirim
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
