import React, { useState, useEffect } from 'react';
import { X, BookOpen, Layers, User, Award, CheckCircle2, FlaskConical, AlertCircle, Save } from 'lucide-react';
import { api } from '../../services/api';

export default function CourseModal({ isOpen, onClose, course = null, currentDept = 'TIF', onSuccess }) {
  if (!isOpen) return null;

  const isEdit = Boolean(course && course.id);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    semester: 1,
    lecturer_name: '',
    has_practicum: false,
    department_code: currentDept,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (course) {
      setFormData({
        code: course.code || '',
        name: course.name || '',
        credits: course.credits || 3,
        semester: course.semester || 1,
        lecturer_name: course.lecturer_name || '',
        has_practicum: Boolean(course.has_practicum),
        department_code: currentDept,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        credits: 3,
        semester: 1,
        lecturer_name: '',
        has_practicum: false,
        department_code: currentDept,
      });
    }
    setErrorMsg('');
  }, [course, currentDept, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.code.trim()) {
      setErrorMsg('Kode Mata Kuliah wajib diisi.');
      return;
    }
    if (!formData.name.trim()) {
      setErrorMsg('Nama Mata Kuliah wajib diisi.');
      return;
    }
    if (!formData.lecturer_name.trim()) {
      setErrorMsg('Nama Dosen Pengampu wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await api.updateCourse(course.id, {
          code: formData.code.trim().toUpperCase(),
          name: formData.name.trim(),
          credits: parseInt(formData.credits, 10),
          semester: parseInt(formData.semester, 10),
          lecturer_name: formData.lecturer_name.trim(),
          has_practicum: Boolean(formData.has_practicum),
        });
      } else {
        await api.createCourse({
          code: formData.code.trim().toUpperCase(),
          name: formData.name.trim(),
          credits: parseInt(formData.credits, 10),
          semester: parseInt(formData.semester, 10),
          lecturer_name: formData.lecturer_name.trim(),
          has_practicum: Boolean(formData.has_practicum),
          department_code: formData.department_code,
        });
      }

      onSuccess?.(isEdit ? 'Data mata kuliah berhasil diperbarui!' : 'Mata kuliah baru berhasil ditambahkan!');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses data');
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
          maxWidth: '560px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'fadeIn 0.15s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            padding: '1.25rem 1.5rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span
                style={{
                  background: '#4f46e5',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                {isEdit ? 'EDIT MATA KULIAH' : 'TAMBAH MATA KULIAH'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#c7d2fe' }}>
                {formData.department_code === 'TIF' ? 'S1 Teknik Informatika' : 'S1 Teknik Industri'}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
              {isEdit ? `Edit: ${course?.code} - ${course?.name}` : 'Tambah Mata Kuliah Baru'}
            </h3>
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Department Choice (If Create) */}
          {!isEdit && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Program Studi
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, department_code: 'TIF' })}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: formData.department_code === 'TIF' ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: formData.department_code === 'TIF' ? '#eef2ff' : '#f8fafc',
                    color: formData.department_code === 'TIF' ? '#312e81' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <BookOpen size={14} />
                  Teknik Informatika (TIF)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, department_code: 'TIND' })}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: formData.department_code === 'TIND' ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: formData.department_code === 'TIND' ? '#eef2ff' : '#f8fafc',
                    color: formData.department_code === 'TIND' ? '#312e81' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <BookOpen size={14} />
                  Teknik Industri (TIND)
                </button>
              </div>
            </div>
          )}

          {/* Kode MK & Bobot SKS Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Kode Mata Kuliah *
              </label>
              <input
                type="text"
                placeholder="Cth: IF1404"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: '#1e293b',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Bobot SKS *
              </label>
              <select
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  color: '#1e293b',
                  background: '#ffffff',
                  boxSizing: 'border-box',
                }}
              >
                <option value={1}>1 SKS</option>
                <option value={2}>2 SKS</option>
                <option value={3}>3 SKS</option>
                <option value={4}>4 SKS</option>
                <option value={6}>6 SKS</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  color: '#1e293b',
                  background: '#ffffff',
                  boxSizing: 'border-box',
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nama Mata Kuliah */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Nama Lengkap Mata Kuliah *
            </label>
            <input
              type="text"
              placeholder="Cth: Algoritma dan Pemrograman Dasar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                color: '#1e293b',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          {/* Dosen Pengampu */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Dosen Pengampu *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Cth: Dr. Ir. Hendra Wicaksono, M.Kom."
                value={formData.lecturer_name}
                onChange={(e) => setFormData({ ...formData, lecturer_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  color: '#1e293b',
                  boxSizing: 'border-box',
                }}
                required
              />
              <User size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          {/* Praktikum Status Card */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Jenis Mata Kuliah & Praktikum
            </label>
            <div
              onClick={() => setFormData({ ...formData, has_practicum: !formData.has_practicum })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: formData.has_practicum ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                background: formData.has_practicum ? '#eff6ff' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: formData.has_practicum ? '#dbeafe' : '#f1f5f9',
                    color: formData.has_practicum ? '#2563eb' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FlaskConical size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: formData.has_practicum ? '#1e40af' : '#1e293b' }}>
                    {formData.has_practicum ? 'Mata Kuliah Teori + Praktikum' : 'Mata Kuliah Teori Saja (Non-Praktikum)'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    {formData.has_practicum
                      ? 'Dokumen 01h (Pedoman Praktikum) WAJIB dilengkapi untuk audit'
                      : 'Dokumen 01h otomatis berstatus Tidak Berlaku (N/A)'}
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '24px',
                  borderRadius: '12px',
                  background: formData.has_practicum ? '#2563eb' : '#cbd5e1',
                  position: 'relative',
                  transition: 'background 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '3px',
                    left: formData.has_practicum ? '21px' : '3px',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Scaffolding notice */}
          <div
            style={{
              padding: '0.65rem 0.85rem',
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: '#64748b',
              lineHeight: 1.4,
            }}
          >
            ℹ️ Sistem akan otomatis mengalokasikan direktori <strong>01_Kurikulum/Perangkat-Perkuliahan/{formData.code || '[Kode]'}</strong> beserta 9 subfolder ISO 21001 di penyimpanan berkas.
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
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
              type="submit"
              disabled={loading}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)',
              }}
            >
              <Save size={15} />
              {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Mata Kuliah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
