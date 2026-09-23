import React, { useState } from 'react';
import { useDocument } from '../../context/DocumentContext';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Calendar,
  AlertOctagon,
  ShieldCheck,
  Upload
} from 'lucide-react';

export default function AuditStatusPanel({ document, onOpenRevision }) {
  const { setVerificationStatus } = useDocument();
  const { activeRoleKey, activeRole } = useAuth();

  const [selectedStatus, setSelectedStatus] = useState(document?.status || 'under_review');
  const [findingType, setFindingType] = useState('NCR Mayor');
  const [findingTitle, setFindingTitle] = useState('');
  const [findingDescription, setFindingDescription] = useState('');
  const [findingRecommendation, setFindingRecommendation] = useState('');
  const [dueDate, setDueDate] = useState('2026-03-25');
  const [successMessage, setSuccessMessage] = useState('');

  if (!document) return null;

  const canDetermineAudit = activeRole.permissions.canApproveFormal || activeRole.permissions.canIssueNCR;

  const handleApplyStatus = (e) => {
    e.preventDefault();

    let findingsPayload = null;
    if (selectedStatus === 'needs_revision') {
      findingsPayload = {
        type: findingType,
        title: findingTitle || `Ketidaksesuaian Klausul ${document.clause}`,
        description: findingDescription,
        recommendation: findingRecommendation,
        dueDate
      };
    }

    setVerificationStatus(document.id, selectedStatus, findingsPayload);
    setSuccessMessage(`Status dokumen berhasil diperbarui menjadi ${selectedStatus.toUpperCase()}`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Panel Penetapan Status Verifikasi Audit</span>
          </h3>
          <p className="card-subtitle">
            Otoritas formal penilai kesesuaian klausul standar EOMS ISO 21001:2018
          </p>
        </div>
      </div>

      {successMessage && (
        <div style={{
          background: 'var(--color-success-light)',
          border: '1px solid var(--color-success-border)',
          color: 'var(--color-success)',
          padding: '0.625rem 0.875rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Role Notice */}
      {!canDetermineAudit ? (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1rem',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Mode PIC Mutu (GPM):
          </div>
          Penetapan status formal <strong>Approved</strong> atau <strong>NCR Mayor</strong> adalah kewenangan <strong>Auditor Mutu</strong> dan <strong>Kaprodi</strong>.
          Sebagai PIC Mutu, Anda dapat menanggapi catatan pada thread di samping atau mengunggah revisi versi baru dokumen.
          <div style={{ marginTop: '0.75rem' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onOpenRevision(document)}
            >
              <Upload size={14} />
              <span>Unggah Berkas Revisi Baru</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleApplyStatus}>
          {/* Status Selection Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {/* Approved */}
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                background: selectedStatus === 'approved' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: `2px solid ${selectedStatus === 'approved' ? 'var(--color-success)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '0.8125rem' }}>Approved</span>
                <input
                  type="radio"
                  name="audit-status"
                  value="approved"
                  checked={selectedStatus === 'approved'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                Memenuhi seluruh bukti klausul EOMS
              </span>
            </label>

            {/* Under Review */}
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                background: selectedStatus === 'under_review' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: `2px solid ${selectedStatus === 'under_review' ? 'var(--color-warning)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-warning)', fontSize: '0.8125rem' }}>Under Review</span>
                <input
                  type="radio"
                  name="audit-status"
                  value="under_review"
                  checked={selectedStatus === 'under_review'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                Observasi minor / butuh klarifikasi
              </span>
            </label>

            {/* Needs Revision / NCR */}
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                background: selectedStatus === 'needs_revision' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: `2px solid ${selectedStatus === 'needs_revision' ? 'var(--color-danger)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '0.8125rem' }}>NCR Mayor</span>
                <input
                  type="radio"
                  name="audit-status"
                  value="needs_revision"
                  checked={selectedStatus === 'needs_revision'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                Ketidaksesuaian standar (Blocker)
              </span>
            </label>
          </div>

          {/* If Needs Revision / NCR Selected, show detailed form */}
          {selectedStatus === 'needs_revision' && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.04)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertOctagon size={16} />
                <span>Formulir Penerbitan Temuan Ketidaksesuaian (NCR)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Klasifikasi Temuan</label>
                  <select
                    className="form-select"
                    value={findingType}
                    onChange={(e) => setFindingType(e.target.value)}
                  >
                    <option value="NCR Mayor">NCR Mayor (Gagal Memenuhi Klausul)</option>
                    <option value="Observasi Minor">Observasi Minor (Penyempurnaan)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tenggat Waktu Resolusi *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                  <div className="form-hint">Standar resolusi: &lt; 48 jam kerja</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Judul Temuan / Deskripsi Singkat *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Ketiadaan rubrik asesmen CPL pada lampiran SOP..."
                  value={findingTitle}
                  onChange={(e) => setFindingTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Uraian Bukti Ketidaksesuaian Terhadap Standar</label>
                <textarea
                  className="form-textarea"
                  placeholder="Jelaskan pasal klausul ISO 21001:2018 yang tidak terpenuhi secara objektif..."
                  value={findingDescription}
                  onChange={(e) => setFindingDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Rekomendasi Tindakan Koreksi (PTK)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Tindakan perbaikan yang wajib dilaksanakan tim GPM..."
                  value={findingRecommendation}
                  onChange={(e) => setFindingRecommendation(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary">
              <FileCheck size={16} />
              <span>Terapkan Status & Otorisasi Formal</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
