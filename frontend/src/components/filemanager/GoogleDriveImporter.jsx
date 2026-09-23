import React, { useState, useEffect } from 'react';
import {
  Cloud,
  FileSpreadsheet,
  Link2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Download,
  GitBranch,
  RefreshCw,
  FolderPlus,
  Play,
  Copy,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';

export default function GoogleDriveImporter({ activeRole, onRefreshData }) {
  const [activeSubTab, setActiveSubTab] = useState('bulk_sheets'); // 'bulk_sheets' | 'single_quick' | 'git_status'
  const [selectedDept, setSelectedDept] = useState('TIF');

  // Bulk Sheets State
  const [sheetUrl, setSheetUrl] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzedRows, setAnalyzedRows] = useState([]);
  const [shouldDownloadPhysical, setShouldDownloadPhysical] = useState(false);
  const [syncToGit, setSyncToGit] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Single Quick Upload State
  const [quickCourseId, setQuickCourseId] = useState('');
  const [quickItemId, setQuickItemId] = useState('5'); // Default 01b (RPS)
  const [quickDriveUrl, setQuickDriveUrl] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickNotes, setQuickNotes] = useState('');
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickSuccessMsg, setQuickSuccessMsg] = useState('');
  const [quickErrorMsg, setQuickErrorMsg] = useState('');

  // Course & Checklist Item list
  const [courses, setCourses] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Git Sync Status
  const [isSyncingGit, setIsSyncingGit] = useState(false);
  const [gitSyncMsg, setGitSyncMsg] = useState('');

  // Load initial courses and checklist items
  useEffect(() => {
    loadMetadata();
  }, [selectedDept]);

  const loadMetadata = async () => {
    try {
      setIsLoadingMetadata(true);
      const [resChecklist, resPerangkat] = await Promise.all([
        api.getChecklist(selectedDept),
        api.getCoursePerangkatMatrix(selectedDept)
      ]);

      if (resChecklist?.data?.items) {
        setChecklistItems(resChecklist.data.items);
      }
      if (resPerangkat?.data?.courses) {
        setCourses(resPerangkat.data.courses);
        if (resPerangkat.data.courses.length > 0 && !quickCourseId) {
          setQuickCourseId(resPerangkat.data.courses[0].id);
        }
      }
    } catch (err) {
      console.error('Gagal memuat metadata mata kuliah:', err);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  // Sample CSV Data for TIF Gasal 2026-2027
  const loadSampleCsv = () => {
    const sample = `Kode MK, Dokumen, Link Google Drive, Dosen Pengampu, Catatan
IF1404, RPS, https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view, Dosen TIF, RPS Algoritma Gasal 2026/2027 Disahkan
IF1404, Silabus, https://drive.google.com/file/d/1c7-SampleSilabusIF1404Algo/view, Dosen TIF, Silabus lengkap semester 1
IF1404, Kontrak Belajar, https://drive.google.com/file/d/1d8-KontrakBelajarIF1404/view, Dosen TIF, Ditandatangani ketua kelas
IF1302, RPS, https://drive.google.com/file/d/1e9-RPSPengantarTI-IF1302/view, Dosen TIF, RPS Pengantar Teknologi Informasi
IF1405, RPS, https://drive.google.com/file/d/1f0-RPSBasisData-IF1405/view, Dosen TIF, RPS Basis Data & Praktikum SQL
IF1405, Pedoman Praktikum, https://drive.google.com/file/d/1g1-PedomanPraktikumBasisData/view, Dosen TIF, Modul Lab Basis Data
IF330124, RPS, https://drive.google.com/file/d/1h2-RPSSPK-IF330124/view, Dosen TIF, Sistem Pendukung Keputusan
IF340224, RPS, https://drive.google.com/file/d/1i3-RPSJava-IF340224/view, Dosen TIF, Pemrograman Java & OOP
IF360424, RPS, https://drive.google.com/file/d/1j4-RPSKonsepAI-IF360424/view, Dosen TIF, Konsep AI & Machine Learning
IF640424, RPS, https://drive.google.com/file/d/1k5-RPSStatistikTeknik/view, Dosen TIF, Statistik Teknik Industri & Informatika
UNV5101, RPS, https://drive.google.com/file/d/1l6-RPSPancasila/view, Dosen MKU, Mata Kuliah Universitas
UNV5104, RPS, https://drive.google.com/file/d/1m7-RPSKewarganegaraan/view, Dosen MKU, Modul & RPS Kewarganegaraan`;

    setCsvContent(sample);
    setSheetUrl('');
  };

  // Analyze Spreadsheet
  const handleAnalyzeSpreadsheet = async () => {
    if (!csvContent.trim() && !sheetUrl.trim()) {
      alert('Silakan masukkan URL Google Sheets atau tempel teks data CSV terlebih dahulu.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setImportResult(null);
      const res = await api.parseSpreadsheet({
        csv_content: csvContent,
        sheet_url: sheetUrl,
        department_code: selectedDept
      });

      setAnalysisResult(res);
      setAnalyzedRows(res.data || []);
    } catch (err) {
      alert(err.message || 'Gagal menganalisis spreadsheet');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Execute Bulk Import
  const handleExecuteBulkImport = async () => {
    const validRows = analyzedRows.filter((r) => r.can_import);
    if (validRows.length === 0) {
      alert('Tidak ada baris yang valid untuk diimpor. Mohon periksa kembali kolom Kode MK dan Link Drive.');
      return;
    }

    try {
      setIsImporting(true);
      const res = await api.bulkImportDrive({
        rows: validRows,
        department_code: selectedDept,
        should_download: shouldDownloadPhysical,
        sync_to_git: syncToGit
      });

      setImportResult(res);
      onRefreshData?.();
    } catch (err) {
      alert(err.message || 'Gagal mengeksekusi impor massal');
    } finally {
      setIsImporting(false);
    }
  };

  // Quick Single Upload Submit
  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    setQuickErrorMsg('');
    setQuickSuccessMsg('');

    if (!quickDriveUrl || !quickDriveUrl.startsWith('http')) {
      setQuickErrorMsg('Silakan masukkan URL Google Drive yang valid.');
      return;
    }

    try {
      setQuickSubmitting(true);
      await api.uploadDriveLink({
        checklist_item_id: quickItemId,
        course_id: quickCourseId,
        drive_url: quickDriveUrl,
        title: quickTitle,
        notes: quickNotes,
        is_digitally_signed: true,
        uploaded_by: activeRole?.name || 'Dosen Pengampu',
        should_download: shouldDownloadPhysical,
        sync_to_git: syncToGit,
        department_code: selectedDept
      });

      setQuickSuccessMsg('Berhasil menautkan dokumen Google Drive ke mata kuliah terpilih!');
      setQuickDriveUrl('');
      setQuickTitle('');
      setQuickNotes('');
      onRefreshData?.();
    } catch (err) {
      setQuickErrorMsg(err.message || 'Gagal menyimpan tautan Google Drive');
    } finally {
      setQuickSubmitting(false);
    }
  };

  // Trigger Git Repo Sync
  const handleGitSync = async () => {
    try {
      setIsSyncingGit(true);
      setGitSyncMsg('');
      const res = await api.syncGitRepo(selectedDept);
      setGitSyncMsg(res.message || 'Sinkronisasi ke repositori Git berhasil.');
    } catch (err) {
      setGitSyncMsg('Gagal sinkronisasi: ' + err.message);
    } finally {
      setIsSyncingGit(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
        borderRadius: '16px',
        padding: '1.75rem 2rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        boxShadow: '0 10px 20px -5px rgba(15, 23, 42, 0.3)'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(59, 130, 246, 0.25)',
            border: '1px solid rgba(147, 197, 253, 0.3)',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#bfdbfe',
            marginBottom: '0.75rem'
          }}>
            <Cloud size={14} />
            <span>Integrasi Cloud & Repositori EOMS ISO 21001</span>
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Aplikasi Pengunggah Link Google Drive & Rekap Dosen
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            Impor otomatis pengumpulan perangkat perkuliahan (RPS, Silabus, Kontrak Belajar, Soal UTS/UAS, dan Nilai) dari formulir respon Google Form atau Google Sheets dosen langsung ke struktur ISO 21001 dan repositori Git.
          </p>
        </div>

        {/* Prodi Switcher */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 600 }}>PILIH PROGRAM STUDI:</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setSelectedDept('TIF')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: selectedDept === 'TIF' ? '#2563eb' : 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Teknik Informatika (27 MK)
            </button>
            <button
              onClick={() => setSelectedDept('TIND')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: selectedDept === 'TIND' ? '#2563eb' : 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Teknik Industri (6 MK)
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '0.25rem'
      }}>
        <button
          onClick={() => setActiveSubTab('bulk_sheets')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeSubTab === 'bulk_sheets' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'bulk_sheets' ? '#1d4ed8' : '#64748b',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: activeSubTab === 'bulk_sheets' ? '3px solid #2563eb' : 'none'
          }}
        >
          <FileSpreadsheet size={16} />
          <span>Bulk Import Google Sheets / CSV Rekap Dosen</span>
        </button>

        <button
          onClick={() => setActiveSubTab('single_quick')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeSubTab === 'single_quick' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'single_quick' ? '#1d4ed8' : '#64748b',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: activeSubTab === 'single_quick' ? '3px solid #2563eb' : 'none'
          }}
        >
          <Link2 size={16} />
          <span>Tautkan Link Cepat Per-MK</span>
        </button>

        <button
          onClick={() => setActiveSubTab('git_status')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeSubTab === 'git_status' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'git_status' ? '#1d4ed8' : '#64748b',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: activeSubTab === 'git_status' ? '3px solid #2563eb' : 'none'
          }}
        >
          <GitBranch size={16} />
          <span>Status Repositori GitHub (`Dokumen-ISO`)</span>
        </button>
      </div>

      {/* SUB-TAB 1: BULK IMPORT GOOGLE SHEETS / CSV */}
      {activeSubTab === 'bulk_sheets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Input Panel */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>
                  1. Masukkan Tautan Google Sheets atau Tempel Data Rekap
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Format kolom yang didukung: <strong>Kode MK, Kategori Dokumen (RPS/Silabus/dll), Link Google Drive, Dosen Pengampu</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={loadSampleCsv}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb' }}
              >
                <Copy size={14} />
                <span>Gunakan Contoh Rekap Dosen Gasal 2026-2027</span>
              </button>
            </div>

            {/* Google Sheets URL input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                Opsi A: URL Berbagi Google Sheets (Akses Publik / Siapa Saja Memiliki Link)
              </label>
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1abc.../edit?usp=sharing"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* CSV / Table paste area */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                Opsi B: Tempel Tabel CSV / Salinan Kolom dari Excel atau Google Sheets
              </label>
              <textarea
                rows={6}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="Kode MK, Dokumen, Link Google Drive, Dosen&#10;IF1404, RPS, https://drive.google.com/file/d/..., Dosen TIF&#10;IF1302, Silabus, https://drive.google.com/file/d/..., Dosen TIF"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontFamily: 'monospace',
                  background: '#f8fafc'
                }}
              />
            </div>

            {/* Analyze Button */}
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleAnalyzeSpreadsheet}
                disabled={isAnalyzing}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem' }}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>Menganalisis Spreadsheet...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Analisis & Petakan Kolom Otomatis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis / Preview Mapping Table */}
          {analysisResult && (
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>
                    2. Hasil Analisis Pemetaan Dokumen Mutu
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.825rem' }}>
                    <span>Total Baris: <strong>{analysisResult.total_rows}</strong></span>
                    <span style={{ color: '#16a34a' }}>Siap Diimpor: <strong>{analysisResult.valid_rows_count}</strong></span>
                    <span style={{ color: '#dc2626' }}>
                      Perlu Periksa: <strong>{analysisResult.total_rows - analysisResult.valid_rows_count}</strong>
                    </span>
                  </div>
                </div>

                {/* Import Options */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={shouldDownloadPhysical}
                      onChange={(e) => setShouldDownloadPhysical(e.target.checked)}
                    />
                    <span>Unduh Berkas Fisik ke Server</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={syncToGit}
                      onChange={(e) => setSyncToGit(e.target.checked)}
                    />
                    <span>Sinkronkan ke Git (`Dokumen-ISO`)</span>
                  </label>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '0.65rem 0.75rem', width: '40px' }}>No</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Mata Kuliah Terdeteksi</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Kategori Dokumen ISO</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Tautan Google Drive</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Dosen / PIC</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyzedRows.map((row, idx) => (
                      <tr key={idx} style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: row.can_import ? '#ffffff' : '#fff1f2'
                      }}>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>{row.raw_line_no}</td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          {row.matched_course_code ? (
                            <div>
                              <strong style={{ color: '#1e40af' }}>{row.matched_course_code}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.matched_course_name}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#dc2626', fontWeight: 600 }}>{row.course_input || 'Tidak terdeteksi'}</span>
                          )}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          {row.matched_item_name ? (
                            <div>
                              <span style={{
                                background: '#e0f2fe',
                                color: '#0369a1',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.725rem',
                                fontWeight: 600
                              }}>
                                {row.matched_item_code}
                              </span>
                              <div style={{ marginTop: '2px', color: '#334155' }}>{row.matched_item_name}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#dc2626' }}>{row.item_input || 'Item tidak cocok'}</span>
                          )}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', maxWidth: '280px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <a
                              href={row.link_input}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: '#2563eb',
                                textDecoration: 'none',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'inline-block',
                                maxWidth: '240px'
                              }}
                              title={row.link_input}
                            >
                              {row.link_input}
                            </a>
                            <ExternalLink size={12} color="#2563eb" />
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            Tipe: {row.drive_type}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>
                          {row.lecturer}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          {row.can_import ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.725rem',
                              fontWeight: 600
                            }}>
                              <CheckCircle2 size={12} />
                              <span>Siap Impor</span>
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.725rem',
                              fontWeight: 600
                            }}>
                              <AlertCircle size={12} />
                              <span>Periksa</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Execution Action */}
              <div style={{
                marginTop: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #f1f5f9'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Dokumen akan otomatis diverifikasi ke dalam modul Checklist Poin 7 dan Perangkat Perkuliahan.
                </div>

                <button
                  type="button"
                  onClick={handleExecuteBulkImport}
                  disabled={isImporting || analysisResult.valid_rows_count === 0}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.75rem',
                    fontSize: '0.9rem'
                  }}
                >
                  {isImporting ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>Mengimpor ke Sistem...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Eksekusi Impor {analysisResult.valid_rows_count} Dokumen ke ISO 21001</span>
                    </>
                  )}
                </button>
              </div>

              {/* Import Result Notification */}
              {importResult && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem 1.25rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  color: '#166534'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={18} color="#16a34a" />
                    <span>{importResult.message}</span>
                  </div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.825rem', color: '#15803d' }}>
                    Dokumen berhasil dicatat. Anda dapat melihat progres kesiapan pada tab <strong>Dashboard</strong> atau <strong>Checklist Poin 7 FT</strong>.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: SINGLE QUICK LINK UPLOAD */}
      {activeSubTab === 'single_quick' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          maxWidth: '700px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 600, color: '#1e293b' }}>
            Tautkan Google Drive ke Mata Kuliah Tertentu
          </h3>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.825rem', color: '#64748b' }}>
            Gunakan form ini untuk dosen yang ingin mengumpulkan satu berkas spesifik (misal RPS atau Soal Ujian) menggunakan link Google Drive.
          </p>

          {quickSuccessMsg && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={16} />
              <span>{quickSuccessMsg}</span>
            </div>
          )}

          {quickErrorMsg && (
            <div style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {quickErrorMsg}
            </div>
          )}

          <form onSubmit={handleQuickSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Mata Kuliah Select */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Pilih Mata Kuliah ({selectedDept}):
              </label>
              <select
                value={quickCourseId}
                onChange={(e) => setQuickCourseId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} – {c.name} (Semester {c.semester})
                  </option>
                ))}
              </select>
            </div>

            {/* Checklist Item Select */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Jenis Perangkat Perkuliahan / Dokumen Mutu:
              </label>
              <select
                value={quickItemId}
                onChange={(e) => setQuickItemId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              >
                {checklistItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.code}] {item.document_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Google Drive URL */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Tautan Google Drive (Berkas / Folder / Google Docs / Sheets) *
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/... atau https://docs.google.com/..."
                value={quickDriveUrl}
                onChange={(e) => setQuickDriveUrl(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* Judul Dokumen */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Keterangan / Judul (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: RPS Revisi Terverifikasi Gasal 2026/2027"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* Options */}
            <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={shouldDownloadPhysical}
                  onChange={(e) => setShouldDownloadPhysical(e.target.checked)}
                />
                <span>Unduh salinan fisik berkas ke server</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={syncToGit}
                  onChange={(e) => setSyncToGit(e.target.checked)}
                />
                <span>Catat tautan ke repositori Git (`Dokumen-ISO`)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={quickSubmitting}
              className="btn btn-primary"
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.75rem'
              }}
            >
              {quickSubmitting ? <span>Menyimpan...</span> : <span>Simpan Tautan Google Drive</span>}
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: GIT STATUS */}
      {activeSubTab === 'git_status' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.5rem', borderRadius: '10px' }}>
              <GitBranch size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#1e293b' }}>
                Sinkronisasi Repositori GitHub (`turnback2ubuntu-wq/Dokumen-ISO`)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
                Pengelolaan berkas dan metadata ISO 21001 Poin 7 Fakultas Teknik
              </p>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>REPOSITORI REMOTE:</div>
                <div style={{ marginTop: '4px' }}>
                  <a
                    href="https://github.com/turnback2ubuntu-wq/Dokumen-ISO"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <span>turnback2ubuntu-wq/Dokumen-ISO</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>BRANCH AKTIF:</div>
                <div style={{ marginTop: '4px', fontWeight: 600, color: '#0f172a' }}>
                  <code>main</code> & <code>gasal-2026-2027</code>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>LOKASI STRUKTUR:</div>
                <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#334155' }}>
                  <code>prodi/teknik-informatika/01_Kurikulum/Perangkat-Perkuliahan/</code>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handleGitSync}
              disabled={isSyncingGit}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
            >
              {isSyncingGit ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>Menyinkronkan...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>Sinkronkan Metadata ke Folder Git Lokal</span>
                </>
              )}
            </button>
          </div>

          {gitSyncMsg && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#15803d'
            }}>
              {gitSyncMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
