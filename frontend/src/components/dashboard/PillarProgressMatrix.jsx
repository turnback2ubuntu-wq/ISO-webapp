import React from 'react';
import { useDocument } from '../../context/DocumentContext';
import ProgressBar from '../common/ProgressBar';
import { ChevronRight, Layers, ArrowUpRight } from 'lucide-react';

export default function PillarProgressMatrix() {
  const { metrics, setSelectedPillarFilter, setActiveTab } = useDocument();
  const { pillarStats } = metrics;

  const handlePillarClick = (pillarId) => {
    setSelectedPillarFilter(pillarId.toString());
    setActiveTab('repository');
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Layers size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Matriks Kesiapan 5 Pilar Klausul EOMS ISO 21001</span>
          </h2>
          <p className="card-subtitle">
            Klik pilar untuk memfilter repositori dokumen terkait secara langsung
          </p>
        </div>
      </div>

      <div className="pillar-list">
        {pillarStats.map((pillar) => (
          <div
            key={pillar.id}
            className="pillar-card"
            onClick={() => handlePillarClick(pillar.id)}
            title={`Lihat instrumen ${pillar.name}`}
          >
            <div className="pillar-card-header">
              <div>
                <span className="badge badge-pillar" style={{ marginRight: '0.5rem' }}>
                  {pillar.code} • {pillar.clauses}
                </span>
                <span className="pillar-title-text">{pillar.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: pillar.score >= 90 ? 'var(--color-success)' : pillar.score >= 60 ? 'var(--color-primary)' : 'var(--color-warning)'
                }}>
                  {pillar.score}%
                </span>
                <ArrowUpRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>

            <ProgressBar value={pillar.score} height={6} />

            <div className="pillar-stats-row">
              <span style={{ color: 'var(--text-secondary)' }}>
                Total: <strong>{pillar.total} Dokumen</strong>
              </span>
              <span>•</span>
              <span style={{ color: 'var(--color-success)' }}>
                {pillar.approved} Approved
              </span>
              <span>•</span>
              <span style={{ color: 'var(--color-warning)' }}>
                {pillar.review} Review
              </span>
              {pillar.revision > 0 && (
                <>
                  <span>•</span>
                  <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                    {pillar.revision} NCR/Revisi
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
