import React from 'react';
import { useDocument } from '../../context/DocumentContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../common/StatusBadge';
import PillarBadge from '../common/PillarBadge';
import {
  FileText,
  History,
  FileCheck2,
  Download,
  Edit3,
  Eye,
  ShieldCheck
} from 'lucide-react';

export default function DocumentTable({
  onSelectDoc,
  onOpenHistory,
  onOpenRevision,
  onOpenDetail
}) {
  const { filteredDocuments, setActiveDocId, setActiveTab } = useDocument();
  const { activeRole } = useAuth();

  const handleStartReview = (docId) => {
    setActiveDocId(docId);
    setActiveTab('verification');
  };

  return (
    <div className="card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kode Registrasi</th>
              <th>Judul Dokumen & Klausul EOMS</th>
              <th>Pilar</th>
              <th>Versi</th>
              <th>Tanggal Efektif</th>
              <th>PIC Pengunggah</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Aksi Cepat</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  Tidak ditemukan instrumen yang sesuai dengan kata kunci pencarian atau filter.
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => (
                <tr key={doc.id}>
                  {/* Kode Registrasi */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span className="doc-code">{doc.code}</span>
                      {doc.signedPdf && (
                        <span title="Bertanda tangan digital resmi" style={{ color: 'var(--color-success)', display: 'inline-flex' }}>
                          <ShieldCheck size={14} />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Judul & Klausul */}
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '380px' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                      Sub-Klausul: <strong>{doc.clause}</strong> • {doc.category}
                    </div>
                  </td>

                  {/* Pilar */}
                  <td>
                    <PillarBadge pillarId={doc.pillarId} />
                  </td>

                  {/* Versi */}
                  <td>
                    <button
                      className="badge badge-version"
                      style={{ cursor: 'pointer', background: 'transparent' }}
                      onClick={() => onOpenHistory(doc)}
                      title="Klik untuk melihat riwayat versi dokumen"
                    >
                      <History size={11} />
                      <span>{doc.version}</span>
                    </button>
                  </td>

                  {/* Tanggal */}
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {doc.effectiveDate}
                  </td>

                  {/* PIC */}
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {doc.pic.split(',')[0]}
                  </td>

                  {/* Status */}
                  <td>
                    <StatusBadge status={doc.status} size="small" />
                  </td>

                  {/* Aksi Cepat */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => onOpenDetail(doc)}
                        title="Pratinjau Rincian Dokumen"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => handleStartReview(doc.id)}
                        title="Buka di Lembar Verifikasi & Temuan"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        <FileCheck2 size={13} />
                      </button>

                      {activeRole.permissions.canUpload && (
                        <button
                          className="btn btn-secondary btn-icon"
                          onClick={() => onOpenRevision(doc)}
                          title="Unggah Revisi Versi Baru"
                          style={{ color: 'var(--color-warning)' }}
                        >
                          <Edit3 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
