import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle2, ShieldCheck, Link2, ExternalLink, Download, Cloud } from 'lucide-react';
import { api } from '../../services/api';

export default function FileUploadModal({ isOpen, onClose, uploadContext, onSuccess, activeRole }) {
  if (!isOpen) return null;

  const item = uploadContext?.item;
  const course = uploadContext?.course;
  const folder = uploadContext?.folder;

  // Upload Mode: 'file' | 'drive'
  const [uploadMode, setUploadMode] = useState('drive');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);

  // Google Drive State
  const [driveUrl, setDriveUrl] = useState('');
  const [shouldDownload, setShouldDownload] = useState(false);
  const [syncToGit, setSyncToGit] = useState(true);

  // Shared metadata
  const [title, setTitle] = useState(
    course ? `${course.code} - ${item?.document_name || 'Perangkat Perkuliahan'}` : (item?.document_name || '')
  );
  const [notes, setNotes] = useState('');
  const [isSigned, setIsSigned] = useState(true);
  const [versionType, setVersionType] = useState('minor');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset form when opened or context changes
  useEffect(() => {
    if (!isOpen) return;

    const defaultTitle = course
      ? `${course.code} - ${item?.document_name || 'Perangkat Perkuliahan'}`
      : (item?.document_name || folder?.name || '');

    setTitle(defaultTitle);
    setDriveUrl(item?.document?.drive_url || '');
    setSelectedFile(null);
    setNotes(item?.document?.notes || '');
    setErrorMsg('');
    setSubmitting(false);

    if (item?.document?.drive_url || item?.document?.source_type?.includes('drive')) {
      setUploadMode('drive');
    } else {
      setUploadMode('drive');
    }
  }, [isOpen, uploadContext]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!title) {
        setTitle(e.target.files[0].name);
      }
    }
  };

  // Google Drive detection helper
  const detectDriveType = (url) => {
    if (!url) return null;
    if (url.includes('/file/d/')) return { type: 'File Drive (PDF/Doc/dll)', icon: '📄' };
    if (url.includes('/folders/')) return { type: 'Folder Drive', icon: '📁' };
    if (url.includes('/spreadsheets/d/')) return { type: 'Google Sheets', icon: '📊' };
    if (url.includes('/document/d/')) return { type: 'Google Docs', icon: '📝' };
    if (url.startsWith('http')) return { type: 'Tautan Dokumen Cloud', icon: '🔗' };
    return null;
  };

  const driveTypeInfo = detectDriveType(driveUrl);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const checklistItemId = item?.checklist_item_id || item?.id || 1;

    if (uploadMode === 'file') {
      if (!selectedFile) {
        setErrorMsg('Silakan pilih berkas PDF, Word, atau Excel terlebih dahulu.');
        return;
      }

      try {
        setSubmitting(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('checklist_item_id', checklistItemId);
        if (course?.id) {
          formData.append('course_id', course.id);
        }
        if (course?.department_id) {
          formData.append('department_id', course.department_id);
        }
        if (course?.department?.code) {
          formData.append('department_code', course.department.code);
        }
        formData.append('title', title || (course ? `${course.code} - ${item?.document_name}` : ''));
        formData.append('notes', notes);
        formData.append('is_digitally_signed', isSigned ? '1' : '0');
        formData.append('version_type', versionType);
        formData.append('uploaded_by', activeRole?.name || 'Dr. Ir. Andy Haryoko, M.T.');

        await api.uploadDocument(formData);
        onSuccess?.();
        onClose();
      } catch (err) {
        setErrorMsg(err.message || 'Gagal mengunggah berkas.');
      } finally {
        setSubmitting(false);
      }
    } else {
      // Google Drive link mode
      if (!driveUrl || !driveUrl.startsWith('http')) {
        setErrorMsg('Silakan masukkan tautan Google Drive yang valid (awali dengan https://).');
        return;
      }

      try {
        setSubmitting(true);
        await api.uploadDriveLink({
          checklist_item_id: checklistItemId,
          course_id: course?.id || null,
          department_id: course?.department_id || null,
          department_code: course?.department?.code || 'TIF',
          drive_url: driveUrl,
          title: title || (course ? `${course.code} - ${item?.document_name}` : ''),
          notes: notes,
          is_digitally_signed: isSigned,
          uploaded_by: activeRole?.name || 'Dosen Pengampu',
          should_download: shouldDownload,
          sync_to_git: syncToGit,
        });

        onSuccess?.();
        onClose();
      } catch (err) {
        setErrorMsg(err.message || 'Gagal menautkan link Google Drive.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)',
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '580px',
        maxHeight: '92vh',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
          color: '#ffffff'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>
              Pengumpulan Dokumen Mutu ISO 21001
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#bfdbfe', marginTop: '2px' }}>
              {item ? `[${item.code}] ${item.document_name}` : folder?.name || 'Dokumen Mutu'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher: Link Drive vs File Upload */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          padding: '0.35rem',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <button
            type="button"
            onClick={() => setUploadMode('drive')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              border: 'none',
              background: uploadMode === 'drive' ? '#ffffff' : 'transparent',
              color: uploadMode === 'drive' ? '#1d4ed8' : '#64748b',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: uploadMode === 'drive' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Link2 size={16} />
            <span>Tautan Google Drive (Rekomendasi)</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              border: 'none',
              background: uploadMode === 'file' ? '#ffffff' : 'transparent',
              color: uploadMode === 'file' ? '#1d4ed8' : '#64748b',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: uploadMode === 'file' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Upload size={16} />
            <span>Unggah Berkas Komputer</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflowY: 'auto'
        }}>
          {errorMsg && (
            <div style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Context Info */}
          {course && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '0.6rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#1e40af',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                Mata Kuliah: <strong>{course.code} – {course.name}</strong>
              </div>
              <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e3a8a', padding: '2px 8px', borderRadius: '12px' }}>
                Semester Gasal
              </span>
            </div>
          )}

          {/* MODE 1: GOOGLE DRIVE LINK */}
          {uploadMode === 'drive' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Link Berkas / Folder Google Drive *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/... atau https://docs.google.com/..."
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  />
                  {driveUrl && (
                    <a
                      href={driveUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#2563eb'
                      }}
                      title="Buka link di tab baru"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>

                {/* Detected Drive Link Type */}
                {driveTypeInfo && (
                  <div style={{
                    marginTop: '0.4rem',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: '#059669',
                    fontWeight: 500
                  }}>
                    <span>{driveTypeInfo.icon}</span>
                    <span>Terdeteksi: <strong>{driveTypeInfo.type}</strong></span>
                  </div>
                )}
              </div>

              {/* Privacy & Download Options */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={shouldDownload}
                    onChange={(e) => setShouldDownload(e.target.checked)}
                    style={{ marginTop: '3px' }}
                  />
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                    <div style={{ fontWeight: 600 }}>Unduh Salinan Berkas Fisik ke Server & Git</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      Jika dicentang, server akan mengunduh berkas fisik (PDF/Doc) dari Google Drive dan menyalinnya ke repositori Git prodi.
                    </div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={syncToGit}
                    onChange={(e) => setSyncToGit(e.target.checked)}
                    style={{ marginTop: '3px' }}
                  />
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                    <div style={{ fontWeight: 600 }}>Sinkronkan Metadata ke Repositori Git (`Dokumen-ISO`)</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      Membuat catatan tautan resmi di folder `01_Kurikulum/Perangkat-Perkuliahan/...` repositori GitHub.
                    </div>
                  </div>
                </label>

                <div style={{ fontSize: '0.725rem', color: '#475569', background: '#e0f2fe', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                  🔒 <strong>Prinsip Privasi (UU PDP):</strong> Menyimpan tautan Google Drive berizin akses internal lebih direkomendasikan untuk berkas bernilai/berdata pribadi daripada mengekspos berkas mentah.
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: LOCAL FILE UPLOAD */}
          {uploadMode === 'file' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Pilih Berkas (PDF, DOCX, XLSX, max 50MB) *
              </label>
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: selectedFile ? '#f8fafc' : '#ffffff',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('file-upload-input').click()}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Upload size={28} color="#64748b" style={{ margin: '0 auto 0.5rem auto' }} />
                {selectedFile ? (
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#334155' }}>
                      Klik untuk memilih berkas dari komputer Anda
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      Format yang didukung: PDF, DOCX, XLSX
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Judul Dokumen */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Judul / Deskripsi Singkat Dokumen
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: RPS Pemrograman Dasar Gasal 2026/2027 Disahkan"
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Catatan / Keterangan */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Catatan Validasi / Review
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan untuk auditor atau verifikator..."
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.875rem',
                resize: 'none'
              }}
            />
          </div>

          {/* Sign check */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="is-signed"
              checked={isSigned}
              onChange={(e) => setIsSigned(e.target.checked)}
            />
            <label htmlFor="is-signed" style={{ fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
              Dokumen telah disahkan / ditandatangani secara resmi (Validasi Mutu)
            </label>
          </div>

          {/* Submit Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              {submitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{uploadMode === 'drive' ? 'Simpan Link Drive' : 'Unggah Berkas'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
