import React from 'react';
import { Layers } from 'lucide-react';
import { INITIAL_PILLARS } from '../../data/initialMockData';

export default function PillarBadge({ pillarId, showName = false }) {
  const pillar = INITIAL_PILLARS.find(p => p.id === pillarId) || {
    code: `Pilar ${pillarId}`,
    clauses: '',
    name: ''
  };

  return (
    <span className="badge badge-pillar" title={`${pillar.name} (${pillar.clauses})`}>
      <Layers size={11} style={{ opacity: 0.7 }} />
      <span>{pillar.code}</span>
      {showName && <span style={{ opacity: 0.8 }}> • {pillar.name}</span>}
    </span>
  );
}
