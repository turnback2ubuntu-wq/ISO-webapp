import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import PillarBadge from '../common/PillarBadge';
import {
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  User,
  History,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DocumentDetailModal({
  isOpen,
  onClose,
  document,
  onOpenVerification,
  onOpenRevision,
  onOpenHistory
}) {
  const { activeRole } = useAuth();
  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rincian Instrumen Mutu EOMS"
      size="large"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              onClose();
              onOpenHistory(document);
            }}
          >
            <History size={15} />
            <span>Lihat Riwayat Versi ({document.history?.length || 1})</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {activeRole.permissions.canUpload && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  onClose();
                  onOpenRevision(document);
                }}
              >
                <span>Unggah Revisi</span>
              </button>
            )}

            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onOpenVerification(document.id);
              }}
            >
              <span>Buka di Lembar Verifikasi</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header Metadata Block */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="doc-code" style={{ fontSize: '0.9375rem' }}>{document.code}</span>
              <span className="badge badge-version">{document.version}</span>
              {document.signedPdf && (
                <span className="badge badge-signed">
                  <ShieldCheck size={12} />
                  Signed PDF
                </span>
              )}
            </div>
            <StatusBadge status={document.status} />
          </div>

          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {document.title}
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <PillarBadge pillarId={document.pillarId} showName />
            </div>
            <span>•</span>
            <div>Sub-Klausul: <strong>{document.clause}</strong></div>
            <span>•</span>
            <div>Kategori: <strong>{document.category}</strong></div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ padding: '0.875rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Calendar size={13} />
              Tanggal Efektif
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {document.effectiveDate}
            </div>
          </div>

          <div className="card" style={{ padding: '0.875rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <User size={13} />
              PIC Pengunggah
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {document.pic}
            </div>
          </div>

          <div className="card" style={{ padding: '0.875rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <FileText size={13} />
              Ukuran & Format
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {document.fileSize || '3.5 MB'} (PDF Resmi)
            </div>
          </div>
        </div>

        {/* Summary / Description */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Deskripsi & Relevansi Pemenuhan Standar:
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {document.summary || 'Dokumen instrumen penjaminan mutu yang telah disinkronkan dengan persyaratan standar EOMS ISO 21001:2018 dan Capaian Pembelajaran Lulusan (CPL) Program Studi S1 Teknik Informatika.'}
          </p>
        </div>

        {/* File Preview Box */}
        <div style={{
          border: '1px dashed var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#F87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                {document.code}_{document.version}_Signed.pdf
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tanda tangan digital terverifikasi (Dekanat & LPMU)
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => alert(`Mengunduh berkas sahih ${document.code}_${document.version}_Signed.pdf`)}
          >
            <Download size={14} />
            <span>Unduh Berkas</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
