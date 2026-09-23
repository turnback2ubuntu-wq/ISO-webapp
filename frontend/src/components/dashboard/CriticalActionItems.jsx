import React from 'react';
import { useDocument } from '../../context/DocumentContext';
import { AlertCircle, Calendar, ArrowRight, CheckCircle } from 'lucide-react';

export default function CriticalActionItems() {
  const { findings, prodiInfo, setActiveDocId, setActiveTab } = useDocument();

  // Calculate days remaining to auditDate
  const today = new Date('2026-03-23'); // Reference current date in context
  const targetAudit = new Date(prodiInfo.auditDate);
  const diffTime = targetAudit - today;
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const openFindings = findings.filter(f => f.status !== 'Closed');

  const handleResolveAction = (docId) => {
    setActiveDocId(docId);
    setActiveTab('verification');
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title" style={{ color: 'var(--color-danger)' }}>
            <AlertCircle size={18} />
            <span>Tindakan Kritis & Tenggat Waktu Audit</span>
          </h2>
          <p className="card-subtitle">
            Item yang memerlukan penyelesaian segera sebelum audit tahap 1
          </p>
        </div>
      </div>

      {/* Audit Countdown Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(30, 41, 59, 0.6) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '0.875rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)'
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Target Audit Tahap 1 ISO 21001:
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {prodiInfo.auditDate}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60A5FA' }}>
            {daysRemaining} Hari
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Tersisa untuk pemenuhan
          </div>
        </div>
      </div>

      {/* Action Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {openFindings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            color: 'var(--color-success)',
            background: 'var(--color-success-light)',
            borderRadius: 'var(--radius-md)'
          }}>
            <CheckCircle size={32} style={{ margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontWeight: 600 }}>Semua Catatan Temuan Telah Terselesaikan!</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Seluruh instrumen prodi dalam status siap audit.</div>
          </div>
        ) : (
          openFindings.map((finding) => (
            <div
              key={finding.id}
              style={{
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                background: finding.type === 'NCR Mayor' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${finding.type === 'NCR Mayor' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={finding.type === 'NCR Mayor' ? 'badge badge-revision' : 'badge badge-review'}>
                  {finding.type} • {finding.clause}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Jatuh tempo: {finding.dueDate}
                </span>
              </div>

              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {finding.title}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                PIC: {finding.pic}
              </div>

              <div style={{ marginTop: '0.375rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleResolveAction(finding.docId)}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <span>Tindak Lanjut</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
