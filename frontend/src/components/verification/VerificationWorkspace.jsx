import React from 'react';
import { useDocument } from '../../context/DocumentContext';
import MultiPartyDialogueHub from './MultiPartyDialogueHub';
import AuditStatusPanel from './AuditStatusPanel';
import FindingRecapTable from './FindingRecapTable';
import StatusBadge from '../common/StatusBadge';
import PillarBadge from '../common/PillarBadge';
import {
  FileText,
  ShieldCheck,
  FolderOpen,
  Calendar,
  User,
  History,
  AlertCircle
} from 'lucide-react';

export default function VerificationWorkspace({ onOpenRevision, onOpenHistory }) {
  const { documents, activeDocId, setActiveDocId } = useDocument();

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Document Picker Bar */}
      <div className="card" style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
            <FolderOpen size={18} style={{ color: 'var(--color-primary)' }} />
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Pilih Instrumen Aktif untuk Ditinjau:
            </label>
            <select
              className="form-select"
              style={{ flex: 1, maxWidth: '500px' }}
              value={activeDoc?.id || ''}
              onChange={(e) => setActiveDocId(e.target.value)}
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  [{doc.code}] {doc.title} ({doc.clause}) — {doc.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenHistory(activeDoc)}
            >
              <History size={13} />
              <span>Riwayat Versi ({activeDoc?.history?.length || 1})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Document Header Card */}
      {activeDoc && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          borderColor: activeDoc.status === 'needs_revision' ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <span className="doc-code" style={{ fontSize: '0.875rem' }}>{activeDoc.code}</span>
                <span className="badge badge-version">{activeDoc.version}</span>
                <PillarBadge pillarId={activeDoc.pillarId} />
                {activeDoc.signedPdf && (
                  <span className="badge badge-signed">
                    <ShieldCheck size={11} />
                    Signed PDF Resmi
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                {activeDoc.title}
              </h2>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div>Sub-Klausul: <strong>{activeDoc.clause}</strong></div>
                <span>•</span>
                <div>PIC: <strong>{activeDoc.pic}</strong></div>
                <span>•</span>
                <div>Tanggal Efektif: <strong>{activeDoc.effectiveDate}</strong></div>
                <span>•</span>
                <div>Ukuran Berkas: <strong>{activeDoc.fileSize || '3.5 MB'}</strong></div>
              </div>
            </div>

            <div>
              <StatusBadge status={activeDoc.status} />
            </div>
          </div>
        </div>
      )}

      {/* Two Column Workspace: Dialogue Hub & Audit Status Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
        <MultiPartyDialogueHub document={activeDoc} />
        <AuditStatusPanel document={activeDoc} onOpenRevision={onOpenRevision} />
      </div>

      {/* Bottom Table: Prodi-wide Findings Matrix */}
      <FindingRecapTable />
    </div>
  );
}
