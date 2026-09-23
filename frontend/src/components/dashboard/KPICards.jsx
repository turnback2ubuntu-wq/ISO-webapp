import React from 'react';
import { useDocument } from '../../context/DocumentContext';
import { ShieldCheck, FileCheck, Clock, AlertOctagon } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

export default function KPICards() {
  const { metrics } = useDocument();
  const { readinessScore, totalDocs, approvedDocs, underReviewDocs, needsRevisionDocs } = metrics;

  return (
    <div className="grid-kpi">
      {/* 1. Readiness Score */}
      <div className="card kpi-card blue">
        <div className="kpi-header">
          <span className="kpi-label">Audit Readiness Score</span>
          <div className="kpi-icon-wrapper blue">
            <ShieldCheck size={20} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{readinessScore}%</span>
          <span className="kpi-target-tag">Target: ≥ 90%</span>
        </div>
        <ProgressBar value={readinessScore} height={6} />
        <div className="kpi-footer">
          <span>{readinessScore >= 90 ? '🟢 Siap Audit Tahap 1' : '🟡 Memerlukan penyelesaian revisi'}</span>
        </div>
      </div>

      {/* 2. Approved Documents */}
      <div className="card kpi-card green">
        <div className="kpi-header">
          <span className="kpi-label">Dokumen Approved (Sah)</span>
          <div className="kpi-icon-wrapper green">
            <FileCheck size={20} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{approvedDocs}</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>/ {totalDocs} Berkas</span>
        </div>
        <ProgressBar value={totalDocs > 0 ? (approvedDocs / totalDocs) * 100 : 0} colorScheme="green" height={6} />
        <div className="kpi-footer">
          <span>Lolos verifikasi bukti klausul ISO 21001</span>
        </div>
      </div>

      {/* 3. Under Review Documents */}
      <div className="card kpi-card amber">
        <div className="kpi-header">
          <span className="kpi-label">Menunggu Review</span>
          <div className="kpi-icon-wrapper amber">
            <Clock size={20} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{underReviewDocs}</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Instrumen</span>
        </div>
        <ProgressBar value={totalDocs > 0 ? (underReviewDocs / totalDocs) * 100 : 0} colorScheme="amber" height={6} />
        <div className="kpi-footer">
          <span>Antrean tinjauan Kaprodi & Auditor Mutu</span>
        </div>
      </div>

      {/* 4. Critical / Needs Revision */}
      <div className="card kpi-card red">
        <div className="kpi-header">
          <span className="kpi-label">Temuan Kritis & NCR</span>
          <div className="kpi-icon-wrapper red">
            <AlertOctagon size={20} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{needsRevisionDocs}</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-danger)' }}>Blocker Audit</span>
        </div>
        <ProgressBar value={totalDocs > 0 ? (needsRevisionDocs / totalDocs) * 100 : 0} colorScheme="amber" height={6} />
        <div className="kpi-footer">
          <span>Target resolusi tindakan koreksi &lt; 48 jam</span>
        </div>
      </div>
    </div>
  );
}
