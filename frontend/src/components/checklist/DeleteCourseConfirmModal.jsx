import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';

export default function DeleteCourseConfirmModal({ isOpen, onClose, course, onSuccess }) {
  if (!isOpen || !course) return null;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDelete = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await api.deleteCourse(course.id);
      onSuccess?.(`Mata kuliah ${course.code} (${course.name}) berhasil dihapus.`);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menghapus mata kuliah');
    } finally {
      setLoading(false);
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
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: '#fef2f2',
            borderBottom: '1px solid #fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#991b1b' }}>
                Konfirmasi Hapus Mata Kuliah
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#b91c1c' }}>
                Tindakan ini tidak dapat dibatalkan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#991b1b',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
            >
              {errorMsg}
            </div>
          )}

          <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
            Apakah Anda yakin ingin menghapus data mata kuliah berikut dari matriks audit ISO 21001?
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  background: '#fee2e2',
                  color: '#991b1b',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                }}
              >
                {course.code}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                • {course.credits} SKS • Semester {course.semester}
              </span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.925rem', color: '#0f172a' }}>
              {course.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Pengampu: {course.lecturer_name}
            </div>
          </div>

          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.775rem',
              color: '#92400e',
              lineHeight: 1.4,
            }}
          >
            ⚠️ Menghapus mata kuliah ini akan membersihkan repositori berkas perangkat perkuliahan yang terhubung, riwayat verifikasi audit, dan direktori penyimpanan terkait.
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
              }}
            >
              <Trash2 size={15} />
              {loading ? 'Menghapus...' : 'Ya, Hapus Mata Kuliah'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
