import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, FileQuestion } from 'lucide-react';

export default function StatusBadge({ status, size = 'normal' }) {
  if (status === 'approved') {
    return (
      <span className="badge badge-approved" title="Memenuhi Kriteria Klausul ISO 21001">
        <CheckCircle2 size={size === 'small' ? 12 : 14} />
        Approved
      </span>
    );
  }

  if (status === 'under_review') {
    return (
      <span className="badge badge-review" title="Sedang Ditinjau oleh Kaprodi / Auditor">
        <Clock size={size === 'small' ? 12 : 14} />
        Under Review
      </span>
    );
  }

  if (status === 'needs_revision') {
    return (
      <span className="badge badge-revision" title="Memerlukan Tindak Lanjut Perbaikan / NCR">
        <AlertTriangle size={size === 'small' ? 12 : 14} />
        Needs Revision
      </span>
    );
  }

  return (
    <span className="badge badge-pillar">
      <FileQuestion size={size === 'small' ? 12 : 14} />
      {status}
    </span>
  );
}
