import React from 'react';
import { useDocument } from '../../context/DocumentContext';
import RoleSwitcher from './RoleSwitcher';
import {
  ShieldCheck,
  LayoutDashboard,
  FolderKanban,
  FileCheck2,
  Printer,
  RotateCcw,
  Sparkles,
  Cloud
} from 'lucide-react';

export default function Header() {
  const {
    activeTab,
    setActiveTab,
    metrics,
    prodiInfo,
    selectedDept,
    setSelectedDept,
    resetAllData,
    loadingDashboard
  } = useDocument();

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-section">
          <div className="brand-logo-badge">
            <ShieldCheck size={26} />
          </div>
          <div className="brand-info">
            <h1>
              <span>ProdiDoc ISO 21001</span>
              <span className="iso-tag">EOMS 2018</span>
            </h1>
            <p>
              {prodiInfo.program} • {prodiInfo.institution}
            </p>
          </div>
        </div>

        <div className="header-actions">
          {/* Department Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prodi:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#F8FAFC',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="TIF">Teknik Informatika (TIF)</option>
              <option value="TIND">Teknik Industri (TIND)</option>
            </select>
          </div>

          {/* Readiness Score Quick Pill */}
          <div
            className="badge badge-approved"
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('dashboard')}
            title="Klik untuk membuka Dashboard Kesiapan"
          >
            <Sparkles size={14} />
            <span>Kesiapan: <strong>{metrics.readinessScore}%</strong></span>
          </div>

          {/* Reset Demo Data */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={resetAllData}
            disabled={loadingDashboard}
            title="Reset data kesiapan repositori ke standar awal di VPS"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RotateCcw size={13} className={loadingDashboard ? 'spin' : ''} />
            <span>{loadingDashboard ? 'Mereset...' : 'Reset Demo'}</span>
          </button>

          {/* Role Switcher */}
          <RoleSwitcher />
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-tabs-container">
        <button
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={15} />
          <span>Dashboard Kesiapan</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'file_explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('file_explorer')}
        >
          <FolderKanban size={15} />
          <span>Tree Explorer & Berkas</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'checklist_ft' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist_ft')}
        >
          <FileCheck2 size={15} />
          <span>Checklist Poin 7 FT (30 Item)</span>
          <span style={{
            fontSize: '0.6875rem',
            background: '#2563eb',
            color: 'white',
            padding: '1px 6px',
            borderRadius: '10px',
            fontWeight: 700
          }}>
            30
          </span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'perangkat_mk' ? 'active' : ''}`}
          onClick={() => setActiveTab('perangkat_mk')}
        >
          <FolderKanban size={15} />
          <span>Perangkat MK</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'gdrive_import' ? 'active' : ''}`}
          onClick={() => setActiveTab('gdrive_import')}
          style={{
            background: activeTab === 'gdrive_import' ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
            borderColor: activeTab === 'gdrive_import' ? '#2563eb' : 'transparent',
            color: activeTab === 'gdrive_import' ? '#1d4ed8' : 'inherit'
          }}
        >
          <Cloud size={15} />
          <span>Import Google Drive</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'verification' ? 'active' : ''}`}
          onClick={() => setActiveTab('verification')}
        >
          <FileCheck2 size={15} />
          <span>Lembar Verifikasi & NCR</span>
          {metrics.needsRevisionDocs > 0 && (
            <span style={{
              fontSize: '0.6875rem',
              background: 'var(--color-danger)',
              color: 'white',
              padding: '1px 6px',
              borderRadius: '10px',
              fontWeight: 700
            }}>
              {metrics.needsRevisionDocs} NCR
            </span>
          )}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          <Printer size={15} />
          <span>Laporan Kesiapan Resmi</span>
        </button>
      </nav>
    </header>
  );
}
