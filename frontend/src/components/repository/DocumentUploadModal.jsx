import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useDocument } from '../../context/DocumentContext';
import { useAuth } from '../../context/AuthContext';
import { UploadCloud, FileCheck, AlertCircle, FileText, Check } from 'lucide-react';
import { INITIAL_PILLARS } from '../../data/initialMockData';

export default function DocumentUploadModal({ isOpen, onClose, editingDoc = null }) {
  const { uploadDocument, updateDocumentVersion } = useDocument();
  const { activeRole } = useAuth();

  const isRevising = Boolean(editingDoc);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    pillarId: 1,
    clause: '',
    category: 'Operasional Pendidikan',
    version: 'v1.0',
    effectiveDate: new Date().toISOString().substring(0, 10),
    pic: activeRole.name,
    reviewer: 'auditor',
    updateType: 'Minor',
    signedPdf: true,
    fileSize: '3.5 MB',
    summary: '',
    changeNote: ''
  });

  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (editingDoc) {
      // Propose bumped version e.g. v2.3 -> v2.4
      let nextVer = 'v1.1';
      if (editingDoc.version.startsWith('v')) {
        const parts = editingDoc.version.substring(1).split('.');
        if (parts.length >= 2) {
          nextVer = `v${parts[0]}.${parseInt(parts[1], 10) + 1}`;
        }
      }

      setFormData({
        title: editingDoc.title,
        code: editingDoc.code,
        pillarId: editingDoc.pillarId,
        clause: editingDoc.clause,
        category: editingDoc.category,
        version: nextVer,
        effectiveDate: new Date().toISOString().substring(0, 10),
        pic: activeRole.name,
        reviewer: 'auditor',
        updateType: 'Minor',
        signedPdf: true,
        fileSize: '3.8 MB',
        summary: editingDoc.summary || '',
        changeNote: ''
      });
      setUploadedFileName(`${editingDoc.code}_${nextVer}_Signed.pdf`);
    } else {
      const generatedCode = `DOC-ISO21-KL${formData.pillarId}-00${Math.floor(Math.random() * 90) + 10}`;
      setFormData({
        title: '',
        code: generatedCode,
        pillarId: 1,
        clause: 'Klausul 4.1',
        category: 'Kebijakan & Tata Kelola',
        version: 'v1.0',
        effectiveDate: new Date().toISOString().substring(0, 10),
        pic: activeRole.name,
        reviewer: 'auditor',
        updateType: 'Mayor',
        signedPdf: true,
        fileSize: '3.2 MB',
        summary: '',
        changeNote: 'Terbitan dokumen instrumen baru'
      });
      setUploadedFileName('');
    }
  }, [editingDoc, isOpen, activeRole.name]);

  const handlePillarChange = (newPillarId) => {
    const id = parseInt(newPillarId, 10);
    const pillar = INITIAL_PILLARS.find(p => p.id === id);
    setFormData(prev => ({
      ...prev,
      pillarId: id,
      clause: pillar?.clauses.split('&')[0].trim() || 'Klausul EOMS'
    }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      setFormData(prev => ({
        ...prev,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        signedPdf: file.name.toLowerCase().endsWith('.pdf')
      }));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setFormData(prev => ({
        ...prev,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        signedPdf: file.name.toLowerCase().endsWith('.pdf')
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Mohon isi Judul Dokumen.');
      return;
    }

    if (isRevising) {
      updateDocumentVersion(editingDoc.id, {
        version: formData.version,
        date: formData.effectiveDate,
        changeNote: formData.changeNote || 'Revisi berkas tindak lanjut audit',
        signedPdf: formData.signedPdf
      });
    } else {
      uploadDocument({
        title: formData.title,
        code: formData.code,
        pillarId: formData.pillarId,
        clause: formData.clause,
        category: formData.category,
        version: formData.version,
        effectiveDate: formData.effectiveDate,
        pic: formData.pic,
        signedPdf: formData.signedPdf,
        fileSize: formData.fileSize,
        summary: formData.summary,
        changeNote: formData.changeNote
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRevising ? `Unggah Revisi Versi Baru: ${editingDoc.code}` : 'Unggah Instrumen ISO 21001:2018 Baru'}
      size="large"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            <Check size={16} />
            <span>{isRevising ? 'Simpan Revisi & Kirim ke Review' : 'Unggah & Daftarkan Instrumen'}</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Pilar EOMS */}
          <div className="form-group">
            <label className="form-label">Pilar Klausul EOMS ISO 21001 *</label>
            <select
              className="form-select"
              value={formData.pillarId}
              onChange={(e) => handlePillarChange(e.target.value)}
              disabled={isRevising}
            >
              {INITIAL_PILLARS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code}: {p.name} ({p.clauses})
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Klausul */}
          <div className="form-group">
            <label className="form-label">Pemetaan Spesifik Sub-Klausul *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: 8.5.1 / 6.1.2"
              value={formData.clause}
              onChange={(e) => setFormData({ ...formData, clause: e.target.value })}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
          {/* Kode Registrasi */}
          <div className="form-group">
            <label className="form-label">Kode Registrasi Dokumen *</label>
            <input
              type="text"
              className="form-input"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              readOnly={isRevising}
              required
            />
            <div className="form-hint">Format baku: DOC-ISO21-KL[Pilar]-[No]</div>
          </div>

          {/* Judul Dokumen */}
          <div className="form-group">
            <label className="form-label">Judul Dokumen / Instrumen Sahih *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: RPS OBE Pemrograman Web & Mobile..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              readOnly={isRevising}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          {/* Nomor Versi */}
          <div className="form-group">
            <label className="form-label">Nomor Versi Terbitan *</label>
            <input
              type="text"
              className="form-input"
              placeholder="v1.0 / v2.1"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              required
            />
          </div>

          {/* Tanggal Efektif */}
          <div className="form-group">
            <label className="form-label">Tanggal Efektif Berlaku *</label>
            <input
              type="date"
              className="form-input"
              value={formData.effectiveDate}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              required
            />
          </div>

          {/* Tipe Pembaruan */}
          <div className="form-group">
            <label className="form-label">Tipe Pembaruan</label>
            <select
              className="form-select"
              value={formData.updateType}
              onChange={(e) => setFormData({ ...formData, updateType: e.target.value })}
            >
              <option value="Minor">Minor (Redaksional / Lampiran)</option>
              <option value="Mayor">Mayor (Perubahan Substansi)</option>
            </select>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div className="form-group">
          <label className="form-label">Unggah Berkas Bukti Objektif (Maks. 25MB)</label>
          <div
            className={`dropzone ${isDragOver ? 'dragover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <input
              id="file-upload-input"
              type="file"
              accept=".pdf,.docx,.xlsx"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <UploadCloud className="dropzone-icon" />
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {uploadedFileName ? (
                <span style={{ color: 'var(--color-primary)' }}>Berkas Terpilih: {uploadedFileName} ({formData.fileSize})</span>
              ) : (
                'Tarik & lepas berkas PDF / Word / Excel di sini, atau klik untuk memilih'
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Mendukung PDF bertanda tangan digital resmi, DOCX, XLSX (Batas 25MB)
            </div>
          </div>
        </div>

        {/* Signed PDF Checkbox */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <input
            type="checkbox"
            id="signed-pdf-check"
            checked={formData.signedPdf}
            onChange={(e) => setFormData({ ...formData, signedPdf: e.target.checked })}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="signed-pdf-check" style={{ cursor: 'pointer', fontSize: '0.8125rem' }}>
            <strong>Dokumen Bertanda Tangan Digital Resmi (Signed PDF)</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Prioritas bukti sahih yang telah disahkan Dekanat / Kaprodi / Lembaga Penjaminan Mutu
            </div>
          </label>
        </div>

        {/* Change Note or Summary */}
        <div className="form-group">
          <label className="form-label">{isRevising ? 'Catatan Perubahan Versi (Changelog) *' : 'Deskripsi Ringkas Dokumen & Catatan Pengantar Mutu'}</label>
          <textarea
            className="form-textarea"
            placeholder={isRevising ? 'Jelaskan perbaikan apa saja yang telah dilakukan untuk memenuhi catatan auditor...' : 'Ringkasan isi instrumen dan tujuan pemenuhan standar...'}
            value={formData.changeNote}
            onChange={(e) => setFormData({ ...formData, changeNote: e.target.value })}
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
