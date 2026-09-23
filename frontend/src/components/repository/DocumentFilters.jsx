import React from 'react';
import { useDocument } from '../../context/DocumentContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Filter, RotateCcw } from 'lucide-react';
import { INITIAL_PILLARS } from '../../data/initialMockData';

export default function DocumentFilters({ onOpenUploadModal }) {
  const {
    searchQuery,
    setSearchQuery,
    selectedPillarFilter,
    setSelectedPillarFilter,
    selectedStatusFilter,
    setSelectedStatusFilter
  } = useDocument();

  const { activeRole } = useAuth();

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedPillarFilter('ALL');
    setSelectedStatusFilter('ALL');
  };

  const hasActiveFilters = searchQuery !== '' || selectedPillarFilter !== 'ALL' || selectedStatusFilter !== 'ALL';

  return (
    <div className="filter-bar">
      <div className="search-input-wrapper">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="form-input search-input"
          placeholder="Cari kode dokumen (DOC-ISO21-...), judul, klausul, atau nama PIC..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filter-selects">
        {/* Pillar Filter */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={selectedPillarFilter}
          onChange={(e) => setSelectedPillarFilter(e.target.value)}
        >
          <option value="ALL">Semua 5 Pilar EOMS</option>
          {INITIAL_PILLARS.map((p) => (
            <option key={p.id} value={p.id.toString()}>
              {p.code}: {p.clauses}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '160px' }}
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
        >
          <option value="ALL">Semua Status Berkas</option>
          <option value="approved">Approved (Lolos)</option>
          <option value="under_review">Under Review (Tinjauan)</option>
          <option value="needs_revision">Needs Revision (NCR)</option>
        </select>

        {hasActiveFilters && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleClearFilters}
            title="Reset Filter"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}

        {/* Upload Button (Available for GPM and Kaprodi) */}
        {activeRole.permissions.canUpload && (
          <button
            className="btn btn-primary"
            onClick={onOpenUploadModal}
          >
            <Plus size={16} />
            <span>Unggah Instrumen</span>
          </button>
        )}
      </div>
    </div>
  );
}
