import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  Eye,
  RefreshCw,
  HardDrive,
  Search,
  X
} from 'lucide-react';
import { api } from '../../services/api';

function findFolderInTree(folders, id) {
  if (!folders || !folders.length) return null;
  for (const f of folders) {
    if (f.id === id) return f;
    if (f.children && f.children.length) {
      const found = findFolderInTree(f.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default function FolderTreeExplorer({
  onOpenUpload,
  onOpenPreview,
  activeRole,
  selectedDept: propDept = 'TIF',
  onSelectDept,
  onDataRefresh,
}) {
  const [internalDept, setInternalDept] = useState(propDept);
  const selectedDept = onSelectDept ? propDept : internalDept;
  const setSelectedDept = onSelectDept || setInternalDept;

  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedNodes, setExpandedNodes] = useState({
    '01_Kurikulum': true,
    'Perangkat-Perkuliahan': true,
  });

  const loadTree = async (dept = selectedDept) => {
    try {
      setLoading(true);
      const res = await api.getFolderTree(dept);
      setTreeData(res.data);
      if (res.data.root_folders && res.data.root_folders.length > 0) {
        setSelectedFolder((prev) => {
          if (!prev) return res.data.root_folders[0];
          const found = findFolderInTree(res.data.root_folders, prev.id);
          return found || res.data.root_folders[0];
        });
      }
    } catch (err) {
      console.error('Error loading folder tree:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree(selectedDept);
  }, [selectedDept]);

  const toggleExpand = (name) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleDownloadZip = (rootFolder = null) => {
    const url = api.getZipExportUrl({ rootFolder, dept: selectedDept });
    window.open(url, '_blank');
  };

  const handleScaffold = async () => {
    try {
      setLoading(true);
      await api.scaffoldFolders(selectedDept);
      await loadTree(selectedDept);
      onDataRefresh?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Find files that belong to this folder or match its path
  const getFolderFiles = () => {
    if (!treeData || !selectedFolder) return [];
    const allDocs = treeData.documents || [];

    // Filter documents matching selected folder path or name
    return allDocs.filter((doc) => {
      // 1. Direct folder_id match
      if (doc.folder_id && doc.folder_id === selectedFolder.id) {
        return true;
      }

      // 2. Course-level match
      if (selectedFolder.course_id) {
        if (doc.course_id !== selectedFolder.course_id) {
          return false;
        }

        // Check if selected folder is one of the 9 subfolders (e.g. a_Silabus)
        const subfolderName = doc.checklistItem?.subfolder ? doc.checklistItem.subfolder.split('/').pop() : '';
        if (subfolderName && selectedFolder.name === subfolderName) {
          return true;
        }

        // If selected folder is the course folder itself
        if (selectedFolder.children?.length > 0 || selectedFolder.name.includes(doc.course?.code || '')) {
          return true;
        }

        return false;
      }

      // 3. General non-course match
      if (doc.storage_path && selectedFolder.path) {
        return doc.storage_path.includes(selectedFolder.name) || selectedFolder.path.includes(doc.checklistItem?.root_folder);
      }
      return doc.checklistItem?.root_folder === selectedFolder.name;
    });
  };

  const folderFiles = getFolderFiles();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top action bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--color-surface, #ffffff)',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid var(--color-border, #e2e8f0)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            padding: '0.6rem',
            borderRadius: '10px',
            color: '#fff',
            display: 'flex'
          }}>
            <HardDrive size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-main, #0f172a)' }}>
              Struktur Repositori Berkas Digital EOMS
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Pohon direktori terstandardisasi berdasarkan 5 Root Folder & Checklist Poin 7 FT
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Department Switcher */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '8px',
            gap: '3px',
            border: '1px solid #cbd5e1'
          }}>
            <button
              type="button"
              onClick={() => { setSelectedDept('TIF'); setSearchFilter(''); }}
              style={{
                background: selectedDept === 'TIF' ? '#ffffff' : 'transparent',
                color: selectedDept === 'TIF' ? '#1e1b4b' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: selectedDept === 'TIF' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Teknik Informatika
            </button>
            <button
              type="button"
              onClick={() => { setSelectedDept('TIND'); setSearchFilter(''); }}
              style={{
                background: selectedDept === 'TIND' ? '#ffffff' : 'transparent',
                color: selectedDept === 'TIND' ? '#1e1b4b' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: selectedDept === 'TIND' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Teknik Industri
            </button>
          </div>

          <button
            onClick={() => handleDownloadZip(selectedFolder?.name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#334155',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            <Download size={16} />
            Unduh Folder (ZIP)
          </button>

          <button
            onClick={() => handleDownloadZip()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: '#047857',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            <Download size={16} />
            Unduh Semua Berkas (ZIP)
          </button>

          <button
            onClick={handleScaffold}
            title="Sinkronkan struktur folder fisik"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Explorer Workspace */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '1.25rem',
        minHeight: '520px'
      }}>
        {/* Left Navigation: Folder Tree */}
        <div style={{
          background: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          overflowY: 'auto',
          maxHeight: '680px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.6rem',
            paddingLeft: '0.25rem'
          }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b'
            }}>
              Katalog Dokumen Mutu ({selectedDept})
            </span>
          </div>

          {/* Quick Search in Tree */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '0.35rem 0.6rem',
            marginBottom: '0.75rem',
          }}>
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Cari folder / mata kuliah..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.775rem',
                color: '#1e293b'
              }}
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              Memuat struktur folder...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {treeData?.root_folders?.map((rf) => (
                <div key={rf.id}>
                  {/* Root Folder Item */}
                  <div
                    onClick={() => {
                      setSelectedFolder(rf);
                      toggleExpand(rf.name);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.6rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: selectedFolder?.id === rf.id ? '#eff6ff' : 'transparent',
                      color: selectedFolder?.id === rf.id ? '#1d4ed8' : '#334155',
                      fontWeight: selectedFolder?.id === rf.id ? 600 : 500,
                      fontSize: '0.9rem'
                    }}
                  >
                    {rf.children?.length > 0 ? (
                      expandedNodes[rf.name] || searchFilter ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    ) : (
                      <span style={{ width: 16 }} />
                    )}
                    {expandedNodes[rf.name] || searchFilter ? (
                      <FolderOpen size={18} color="#2563eb" />
                    ) : (
                      <Folder size={18} color="#3b82f6" />
                    )}
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rf.name}
                    </span>
                  </div>

                  {/* Subfolders Level 1 */}
                  {(expandedNodes[rf.name] || searchFilter) && rf.children?.map((sub1) => {
                    const courses = sub1.children || [];
                    const filteredCourses = searchFilter.trim()
                      ? courses.filter(c => c.name.toLowerCase().includes(searchFilter.toLowerCase().trim()))
                      : courses;

                    return (
                      <div key={sub1.id} style={{ paddingLeft: '1.25rem' }}>
                        <div
                          onClick={() => {
                            setSelectedFolder(sub1);
                            toggleExpand(sub1.name);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: selectedFolder?.id === sub1.id ? '#eff6ff' : 'transparent',
                            color: selectedFolder?.id === sub1.id ? '#1d4ed8' : '#475569',
                            fontSize: '0.85rem'
                          }}
                        >
                          {courses.length > 0 ? (
                            expandedNodes[sub1.name] || searchFilter ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                          ) : (
                            <span style={{ width: 14 }} />
                          )}
                          <Folder size={16} color="#60a5fa" />
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {sub1.name} {courses.length > 0 ? `(${courses.length})` : ''}
                          </span>
                        </div>

                        {/* Course Folders Level 2 */}
                        {(expandedNodes[sub1.name] || searchFilter) && filteredCourses.map((courseFld) => (
                          <div key={courseFld.id} style={{ paddingLeft: '1.25rem' }}>
                            <div
                              onClick={() => {
                                setSelectedFolder(courseFld);
                                toggleExpand(courseFld.name);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.35rem 0.5rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: selectedFolder?.id === courseFld.id ? '#eff6ff' : 'transparent',
                                color: selectedFolder?.id === courseFld.id ? '#1d4ed8' : '#64748b',
                                fontSize: '0.8rem'
                              }}
                            >
                              {courseFld.children?.length > 0 ? (
                                expandedNodes[courseFld.name] ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                              ) : (
                                <span style={{ width: 12 }} />
                              )}
                              <Folder size={14} color="#93c5fd" />
                              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {courseFld.name}
                              </span>
                            </div>

                          {/* 9 Sub-items per course */}
                          {expandedNodes[courseFld.name] && courseFld.children?.map((itemFld) => (
                            <div
                              key={itemFld.id}
                              onClick={() => setSelectedFolder(itemFld)}
                              style={{
                                paddingLeft: '2rem',
                                paddingRight: '0.5rem',
                                paddingTop: '0.25rem',
                                paddingBottom: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                background: selectedFolder?.id === itemFld.id ? '#dbeafe' : 'transparent',
                                color: selectedFolder?.id === itemFld.id ? '#1e40af' : '#64748b',
                                fontSize: '0.75rem'
                              }}
                            >
                              <Folder size={12} color="#bfdbfe" />
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {itemFld.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Content Area: Folder Detail & Files Table */}
        <div style={{
          background: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          {/* Breadcrumb Path */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: '#64748b' }}>
              <span>{selectedDept === 'TIF' ? 'S1 Teknik Informatika' : 'S1 Teknik Industri'}</span>
              <ChevronRight size={14} />
              <span>Genap 2025/2026</span>
              <ChevronRight size={14} />
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {selectedFolder?.name || 'Pilih Folder'}
              </span>
            </div>

            <button
              onClick={() => onOpenUpload({ folder: selectedFolder })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.85rem'
              }}
            >
              <Upload size={15} />
              Unggah ke Folder Ini
            </button>
          </div>

          {/* Files List in Selected Folder */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Nama Dokumen / Berkas</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Kode & Klausul</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Versi</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Ukuran</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Status Audit</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {folderFiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                      <FileText size={36} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.5 }} />
                      Belum ada berkas yang diunggah ke dalam folder ini.
                      <div style={{ marginTop: '0.5rem' }}>
                        <button
                          onClick={() => onOpenUpload({ folder: selectedFolder })}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#2563eb',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          + Tambah Berkas Sekarang
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  folderFiles.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <FileText size={18} color="#dc2626" />
                          <div>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>
                              {doc.title || doc.file_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {doc.original_name || doc.file_name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: '#f1f5f9',
                          color: '#475569',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {doc.checklistItem?.code || '01'}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          ISO {doc.checklistItem?.iso_clause}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '999px',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}>
                          {doc.current_version || 'v1.0'}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>
                        {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : '-'}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        {renderStatusBadge(doc.status)}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => onOpenPreview(doc)}
                            title="Pratinjau Berkas"
                            style={{
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem'
                            }}
                          >
                            <Eye size={13} />
                            Preview
                          </button>

                          {doc.storage_path && (
                            <a
                              href={api.getDocumentDownloadUrl(doc.id)}
                              download
                              title="Unduh Berkas Asli"
                              style={{
                                padding: '0.35rem 0.6rem',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                textDecoration: 'none'
                              }}
                            >
                              <Download size={13} />
                              Unduh
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderStatusBadge(status) {
  switch (status) {
    case 'verified':
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '999px',
          background: '#dcfce7',
          color: '#15803d',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}>
          <CheckCircle2 size={13} /> Disetujui
        </span>
      );
    case 'submitted':
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '999px',
          background: '#fef3c7',
          color: '#b45309',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}>
          <Clock size={13} /> Review
        </span>
      );
    case 'rejected':
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '999px',
          background: '#fee2e2',
          color: '#b91c1c',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}>
          <AlertTriangle size={13} /> NCR
        </span>
      );
    case 'not_applicable':
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '999px',
          background: '#f1f5f9',
          color: '#64748b',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}>
          <Ban size={13} /> N/A
        </span>
      );
    case 'missing':
    default:
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '999px',
          background: '#fef2f2',
          color: '#dc2626',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}>
          Belum Diunggah
        </span>
      );
  }
}
