import React from 'react';
import {
  X,
  BookOpen,
  User,
  Award,
  Layers,
  FlaskConical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ban,
  Upload,
  Eye,
  Download,
  Edit,
  Trash2,
  Cloud
} from 'lucide-react';
import { api } from '../../services/api';

export default function CourseDetailModal({
  isOpen,
  onClose,
  courseData,
  onOpenUpload,
  onOpenPreview,
  onEditCourse,
  onDeleteCourse,
}) {
  if (!isOpen || !courseData) return null;

  const { course, completion_percent, items } = courseData;

  const handleDownloadZip = () => {
    const url = api.getZipExportUrl({ courseId: course.id });
    window.open(url, '_blank');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
            <CheckCircle2 size={13} />
            Disetujui
          </span>
        );
      case 'submitted':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
            <Clock size={13} />
            Menunggu Review
          </span>
        );
      case 'rejected':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
            <AlertTriangle size={13} />
            Perlu Revisi / NCR
          </span>
        );
      case 'not_applicable':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
            <Ban size={13} />
            Tidak Berlaku (N/A)
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f8fafc', color: '#94a3b8', border: '1px dashed #cbd5e1', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
            Belum Diunggah
          </span>
        );
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '820px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'fadeIn 0.15s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            padding: '1.25rem 1.75rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  background: '#4f46e5',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  letterSpacing: '0.04em',
                }}
              >
                {course.code}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#c7d2fe' }}>
                {course.credits} SKS • Semester {course.semester}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: course.has_practicum ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                  color: course.has_practicum ? '#93c5fd' : '#e2e8f0',
                }}
              >
                {course.has_practicum ? 'Teori + Praktikum' : 'Teori Non-Praktikum'}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>
              {course.name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={14} />
              <span>Dosen Pengampu: <strong>{course.lecturer_name}</strong></span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress & Quick Stats Bar */}
        <div
          style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '1rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              <span>Kelengkapan Audit Dokumen ISO 21001</span>
              <span style={{ color: completion_percent >= 80 ? '#16a34a' : completion_percent >= 50 ? '#d97706' : '#dc2626', fontWeight: 700 }}>
                {completion_percent}%
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${completion_percent}%`,
                  height: '100%',
                  background: completion_percent >= 80 ? '#16a34a' : completion_percent >= 50 ? '#d97706' : '#dc2626',
                  borderRadius: '999px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={handleDownloadZip}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Download size={14} />
              Ekspor ZIP MK
            </button>
            <button
              type="button"
              onClick={() => { onClose(); onEditCourse?.(course); }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #818cf8',
                background: '#eef2ff',
                color: '#3730a3',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Edit size={14} />
              Edit MK
            </button>
            <button
              type="button"
              onClick={() => { onClose(); onDeleteCourse?.(course); }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #fca5a5',
                background: '#fef2f2',
                color: '#991b1b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Trash2 size={14} />
              Hapus MK
            </button>
          </div>
        </div>

        {/* 9 Required Documents Table */}
        <div style={{ overflowY: 'auto', padding: '1.25rem 1.75rem', flex: 1 }}>
          <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
            Daftar 9 Instrumen Perangkat Pembelajaran Wajib (Klausul 8.1.2 & 8.3.4.3)
          </h4>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.65rem 0.85rem', width: '50px' }}>Kode</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Nama Dokumen & Subfolder</th>
                  <th style={{ padding: '0.65rem 0.85rem', width: '150px' }}>Status Audit</th>
                  <th style={{ padding: '0.65rem 0.85rem', width: '160px', textAlign: 'right' }}>Aksi Berkas</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const doc = it.document;
                  const isDrive = Boolean(doc?.drive_url);

                  return (
                    <tr key={it.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5' }}>
                          {it.code}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {it.document_name}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>Folder: <code>{it.subfolder}</code></span>
                          {doc && (
                            <>
                              <span>•</span>
                              <span>Versi {doc.current_version}</span>
                              {isDrive && (
                                <span style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                  <Cloud size={11} /> Google Drive
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        {getStatusBadge(it.status)}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {doc ? (
                            <>
                              <button
                                type="button"
                                onClick={() => { onClose(); onOpenPreview?.(doc); }}
                                title="Lihat pratinjau dan riwayat audit"
                                style={{
                                  padding: '0.35rem 0.6rem',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  color: '#334155',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.75rem',
                                }}
                              >
                                <Eye size={13} />
                                Lihat
                              </button>
                              <button
                                type="button"
                                onClick={() => { onClose(); onOpenUpload?.({ item: it, course }); }}
                                title="Unggah versi baru"
                                style={{
                                  padding: '0.35rem 0.6rem',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: '#f8fafc',
                                  color: '#334155',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.75rem',
                                }}
                              >
                                <Upload size={13} />
                                Ganti
                              </button>
                            </>
                          ) : it.status !== 'not_applicable' ? (
                            <button
                              type="button"
                              onClick={() => { onClose(); onOpenUpload?.({ item: it, course }); }}
                              style={{
                                padding: '0.35rem 0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #2563eb',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              <Upload size={13} />
                              Upload
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            background: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
