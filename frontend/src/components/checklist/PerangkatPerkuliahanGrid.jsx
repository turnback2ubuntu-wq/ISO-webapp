import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Ban,
  AlertTriangle,
  Upload,
  Download,
  ToggleLeft,
  ToggleRight,
  Eye,
  Layers,
  Cloud,
  Search,
  X,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { api } from '../../services/api';
import CourseModal from './CourseModal';
import CourseDetailModal from './CourseDetailModal';
import DeleteCourseConfirmModal from './DeleteCourseConfirmModal';

export default function PerangkatPerkuliahanGrid({
  onOpenUpload,
  onOpenPreview,
  selectedDept: propDept = 'TIF',
  onSelectDept,
  onDataRefresh,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [internalDept, setInternalDept] = useState(propDept);
  const selectedDept = onSelectDept ? propDept : internalDept;
  const setSelectedDept = onSelectDept || setInternalDept;
  const [searchQuery, setSearchQuery] = useState('');

  // CRUD Modal States
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailCourseData, setDetailCourseData] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const [toastMessage, setToastMessage] = useState('');

  const loadMatrix = async (dept = selectedDept) => {
    try {
      setLoading(true);
      const res = await api.getCoursePerangkatMatrix(dept);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load perangkat matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix(selectedDept);
  }, [selectedDept]);

  const handleTogglePracticum = async (courseId) => {
    try {
      await api.toggleCoursePracticum(courseId);
      await loadMatrix(selectedDept);
      onDataRefresh?.();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadCourseZip = (courseId) => {
    const url = api.getZipExportUrl({ courseId });
    window.open(url, '_blank');
  };

  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleOpenDetail = (courseRow) => {
    setDetailCourseData(courseRow);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleCrudSuccess = (msg) => {
    setToastMessage(msg);
    loadMatrix(selectedDept);
    onDataRefresh?.();
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const filteredMatrix = data?.matrix?.filter(({ course }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      course.code?.toLowerCase().includes(q) ||
      course.name?.toLowerCase().includes(q) ||
      (course.lecturer_name && course.lecturer_name.toLowerCase().includes(q))
    );
  }) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        color: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(30, 27, 75, 0.15)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{
              background: '#4f46e5',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px'
            }}>
              Klausul 8.1.2 & 8.3.4.3 EOMS
            </span>
            <span style={{ fontSize: '0.85rem', color: '#c7d2fe' }}>
              Subfolder: Perangkat-Perkuliahan ({selectedDept === 'TIF' ? 'Teknik Informatika - 27 MK' : 'Teknik Industri - 6 MK'})
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>
            Matriks Perangkat Perkuliahan per Mata Kuliah
          </h2>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: '#e0e7ff' }}>
            Pemantauan kelengkapan 9 dokumen pembelajaran wajib untuk setiap mata kuliah {selectedDept === 'TIF' ? 'S1 Teknik Informatika' : 'S1 Teknik Industri'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Department Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.15)',
            padding: '4px',
            borderRadius: '8px',
            gap: '4px'
          }}>
            <button
              type="button"
              onClick={() => { setSelectedDept('TIF'); setSearchQuery(''); }}
              style={{
                background: selectedDept === 'TIF' ? '#ffffff' : 'transparent',
                color: selectedDept === 'TIF' ? '#1e1b4b' : '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Teknik Informatika
            </button>
            <button
              type="button"
              onClick={() => { setSelectedDept('TIND'); setSearchQuery(''); }}
              style={{
                background: selectedDept === 'TIND' ? '#ffffff' : 'transparent',
                color: selectedDept === 'TIND' ? '#1e1b4b' : '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Teknik Industri
            </button>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#c7d2fe', textTransform: 'uppercase' }}>Total MK</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {data?.matrix?.length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Table Card */}
      <div style={{
        background: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        {/* Table Search & Filter Toolbar */}
        <div style={{
          padding: '0.75rem 1.25rem',
          background: '#f8fafc',
          borderBottom: '1px solid var(--color-border, #e2e8f0)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0.4rem 0.75rem',
            minWidth: '280px',
            maxWidth: '420px',
            flex: 1
          }}>
            <Search size={15} color="#64748b" />
            <input
              type="text"
              placeholder="Cari Kode MK (cth: IF1404, UNV5104) atau Nama MK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.8rem',
                color: '#1e293b'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
                title="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Menampilkan <strong style={{ color: '#1e1b4b' }}>{filteredMatrix.length}</strong> dari {data?.matrix?.length || 0} Mata Kuliah
            </div>

            <button
              type="button"
              onClick={handleOpenAddCourse}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 0.95rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={15} />
              Tambah Mata Kuliah
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                <th style={{ padding: '0.75rem 0.75rem', width: '110px', textAlign: 'center' }}>Kode MK</th>
                <th style={{ padding: '0.75rem 1rem', minWidth: '200px' }}>Nama Mata Kuliah & Pengampu</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '85px' }}>Praktikum?</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '65px' }} title="01a: Silabus">Silabus</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '65px' }} title="01b: RPS">RPS</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '65px' }} title="01c: Daftar Hadir">Absensi</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '65px' }} title="01d: Jurnal Perkuliahan">Jurnal</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '65px' }} title="01e: Kontrak Belajar">Kontrak</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '65px' }} title="01f: Materi Perkuliahan">Materi</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '75px' }} title="01g: Soal UTS/UAS & Form Verifikasi">Soal+Verif</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '75px' }} title="01h: Pedoman Praktikum (N/A bila teori)">Praktikum</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '65px' }} title="01i: Bukti Penilaian">Nilai</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', width: '95px' }}>Progress</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', width: '145px' }}>Aksi / Kelola</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={14} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Memuat matriks perangkat perkuliahan...
                  </td>
                </tr>
              ) : filteredMatrix.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Tidak ada mata kuliah yang cocok dengan kata kunci pencarian "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredMatrix.map(({ course, completion_percent, items }) => (
                  <tr key={course.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {/* 1. Dedicated Kode MK Column */}
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: '#312e81',
                        background: '#e0e7ff',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid #c7d2fe',
                        display: 'inline-block',
                        letterSpacing: '0.03em',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                      }}>
                        {course.code}
                      </span>
                    </td>

                    {/* 2. Course Name & Details */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                        {course.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '3px', fontSize: '0.75rem', color: '#64748b' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4338ca' }}>
                          {course.code}
                        </span>
                        <span>•</span>
                        <span>{course.credits} SKS</span>
                        <span>•</span>
                        <span>{course.lecturer_name}</span>
                      </div>
                    </td>

                    {/* Practicum Toggle */}
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleTogglePracticum(course.id)}
                        title={course.has_practicum ? 'MK memiliki praktikum (Klik untuk set non-praktikum)' : 'MK teori non-praktikum (Klik untuk set ada praktikum)'}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          color: course.has_practicum ? '#2563eb' : '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {course.has_practicum ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                    </td>

                    {/* 9 Document Items */}
                    {items.map((it) => (
                      <td key={it.code} style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                          {renderMiniItemIcon(it, course, onOpenUpload, onOpenPreview)}
                        </div>
                      </td>
                    ))}

                    {/* Completion Gauge */}
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: completion_percent >= 80 ? '#16a34a' : completion_percent >= 50 ? '#d97706' : '#dc2626' }}>
                          {completion_percent}%
                        </span>
                        <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${completion_percent}%`,
                            height: '100%',
                            background: completion_percent >= 80 ? '#16a34a' : completion_percent >= 50 ? '#d97706' : '#dc2626',
                            borderRadius: '999px'
                          }} />
                        </div>
                      </div>
                    </td>

                    {/* Course Actions: Detail, Edit, Delete, ZIP */}
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                        <button
                          onClick={() => handleOpenDetail({ course, completion_percent, items })}
                          title={`Lihat rincian & 9 dokumen ${course.code}`}
                          style={{
                            padding: '0.35rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEditCourse(course)}
                          title={`Edit data ${course.code}`}
                          style={{
                            padding: '0.35rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#2563eb',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(course)}
                          title={`Hapus mata kuliah ${course.code}`}
                          style={{
                            padding: '0.35rem',
                            borderRadius: '6px',
                            border: '1px solid #fee2e2',
                            background: '#fef2f2',
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDownloadCourseZip(course.id)}
                          title={`Unduh seluruh berkas ${course.name} (ZIP)`}
                          style={{
                            padding: '0.35rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#334155',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            fontSize: '0.725rem',
                          }}
                        >
                          <Download size={12} />
                          ZIP
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#1e1b4b',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            zIndex: 99999,
            animation: 'fadeIn 0.2s ease-out',
            border: '1px solid #4338ca',
          }}
        >
          <CheckCircle2 size={18} color="#4ade80" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CRUD Modals */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        course={editingCourse}
        currentDept={selectedDept}
        onSuccess={handleCrudSuccess}
      />

      <CourseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        courseData={detailCourseData}
        onOpenUpload={onOpenUpload}
        onOpenPreview={onOpenPreview}
        onEditCourse={handleOpenEditCourse}
        onDeleteCourse={handleOpenDelete}
      />

      <DeleteCourseConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        course={courseToDelete}
        onSuccess={handleCrudSuccess}
      />
    </div>
  );
}

function renderMiniItemIcon(item, course, onOpenUpload, onOpenPreview) {
  if (item.status === 'not_applicable') {
    return (
      <span
        title={`${item.document_name}: Tidak Berlaku (N/A)`}
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: '#f1f5f9',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 700
        }}
      >
        <Ban size={13} />
      </span>
    );
  }

  const isDrive = Boolean(item.document?.drive_url);

  if (item.status === 'verified') {
    return (
      <button
        onClick={() => onOpenPreview(item.document)}
        title={`${item.document_name}: Disetujui ${isDrive ? '(Tautan Google Drive)' : ''} (Klik untuk melihat)`}
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: '#dcfce7',
          color: '#16a34a',
          border: isDrive ? '1.5px solid #2563eb' : 'none',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <CheckCircle2 size={15} />
        {isDrive && (
          <span style={{
            position: 'absolute',
            bottom: '-3px',
            right: '-3px',
            background: '#2563eb',
            color: '#fff',
            borderRadius: '50%',
            width: '12px',
            height: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cloud size={8} />
          </span>
        )}
      </button>
    );
  }

  if (item.status === 'submitted') {
    return (
      <button
        onClick={() => onOpenPreview(item.document)}
        title={`${item.document_name}: Menunggu Review ${isDrive ? '(Tautan Google Drive)' : ''} (Klik untuk melihat)`}
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: '#fef3c7',
          color: '#d97706',
          border: isDrive ? '1.5px solid #2563eb' : 'none',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <Clock size={15} />
        {isDrive && (
          <span style={{
            position: 'absolute',
            bottom: '-3px',
            right: '-3px',
            background: '#2563eb',
            color: '#fff',
            borderRadius: '50%',
            width: '12px',
            height: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cloud size={8} />
          </span>
        )}
      </button>
    );
  }

  if (item.status === 'rejected') {
    return (
      <button
        onClick={() => onOpenPreview(item.document)}
        title={`${item.document_name}: Perlu Revisi / NCR ${isDrive ? '(Tautan Google Drive)' : ''} (Klik untuk melihat)`}
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#dc2626',
          border: isDrive ? '1.5px solid #2563eb' : 'none',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <AlertTriangle size={15} />
        {isDrive && (
          <span style={{
            position: 'absolute',
            bottom: '-3px',
            right: '-3px',
            background: '#2563eb',
            color: '#fff',
            borderRadius: '50%',
            width: '12px',
            height: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cloud size={8} />
          </span>
        )}
      </button>
    );
  }

  // Missing / Belum diunggah
  return (
    <button
      onClick={() => onOpenUpload({ item, course })}
      title={`${item.document_name}: Belum diunggah (Klik untuk upload)`}
      style={{
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        background: '#f8fafc',
        border: '1px dashed #cbd5e1',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
    >
      <Upload size={12} />
    </button>
  );
}
