import React from 'react';
import { useDocument } from '../../context/DocumentContext';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Calendar
} from 'lucide-react';

export default function FindingRecapTable({ onSelectDoc }) {
  const { findings, updateFindingStatus, setActiveDocId } = useDocument();
  const { activeRole } = useAuth();

  const handleStatusChange = (findingId, newStatus) => {
    const note = prompt(`Masukkan catatan resolusi penutupan temuan ${findingId}:`, 'Telah ditindaklanjuti dan disetujui');
    if (note !== null) {
      updateFindingStatus(findingId, newStatus, note);
    }
  };

  const handleRowClick = (docId) => {
    setActiveDocId(docId);
  };

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <ShieldAlert size={18} style={{ color: 'var(--color-danger)' }} />
            <span>Matriks Rekapitulasi Temuan Audit Prodi (NCR & Observasi)</span>
          </h3>
          <p className="card-subtitle">
            Monitoring tindak lanjut penyelesaian ketidaksesuaian standar ISO 21001:2018
          </p>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. Temuan</th>
              <th>Klausul & Dokumen</th>
              <th>Jenis Temuan</th>
              <th>Uraian Ketidaksesuaian & Rekomendasi</th>
              <th>PIC</th>
              <th>Tenggat Waktu</th>
              <th>Status Tindak Lanjut</th>
              <th style={{ textAlign: 'right' }}>Aksi Status</th>
            </tr>
          </thead>
          <tbody>
            {findings.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-success)' }}>
                  Tidak ada temuan ketidaksesuaian aktif pada instrumen program studi.
                </td>
              </tr>
            ) : (
              findings.map((f) => (
                <tr key={f.id} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(f.docId)}>
                  {/* ID */}
                  <td>
                    <span className="doc-code">{f.id}</span>
                  </td>

                  {/* Klausul & Doc */}
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {f.clause}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {f.code}
                    </div>
                  </td>

                  {/* Jenis */}
                  <td>
                    <span className={f.type === 'NCR Mayor' ? 'badge badge-revision' : 'badge badge-review'}>
                      {f.type}
                    </span>
                  </td>

                  {/* Deskripsi & Rekomendasi */}
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      {f.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      💡 {f.recommendation || f.description}
                    </div>
                    {f.resolutionNotes && (
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-success)', marginTop: '0.2rem' }}>
                        ✓ {f.resolutionNotes}
                      </div>
                    )}
                  </td>

                  {/* PIC */}
                  <td style={{ fontSize: '0.75rem' }}>
                    {f.pic.split('(')[0]}
                  </td>

                  {/* Tenggat Waktu */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                      <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                      <span>{f.dueDate}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    {f.status === 'Closed' && (
                      <span className="badge badge-approved">
                        <CheckCircle2 size={12} />
                        Closed
                      </span>
                    )}
                    {f.status === 'In Progress' && (
                      <span className="badge badge-review">
                        <Clock size={12} />
                        In Progress
                      </span>
                    )}
                    {f.status === 'Open' && (
                      <span className="badge badge-revision">
                        <AlertTriangle size={12} />
                        Open
                      </span>
                    )}
                  </td>

                  {/* Aksi Ubah Status (Auditor / Kaprodi) */}
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <select
                      className="form-select"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                      value={f.status}
                      onChange={(e) => handleStatusChange(f.id, e.target.value)}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed (Selesai)</option>
                    </select>
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
