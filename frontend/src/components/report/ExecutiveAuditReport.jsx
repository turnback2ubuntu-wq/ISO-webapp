import React from 'react';
import { useDocument } from '../../context/DocumentContext';
import { Printer, ShieldCheck, CheckCircle2, FileText, ArrowLeft } from 'lucide-react';

export default function ExecutiveAuditReport({ onBackToDashboard }) {
  const { metrics, prodiInfo, documents, findings } = useDocument();

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Action Bar (Hidden in print) */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        background: 'var(--bg-card)',
        padding: '0.875rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <button className="btn btn-secondary btn-sm" onClick={onBackToDashboard}>
          <ArrowLeft size={14} />
          <span>Kembali ke Dashboard</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Format siap cetak / Simpan sebagai PDF resmi
          </span>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Cetak Dokumen Laporan</span>
          </button>
        </div>
      </div>

      {/* Official Printable Report Sheet */}
      <div className="print-report-container" style={{
        background: '#ffffff',
        color: '#111827',
        padding: '2.5rem 3rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Kop Surat Resmi */}
        <div style={{
          borderBottom: '3px double #111827',
          paddingBottom: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '2px solid #1E40AF',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1E40AF',
              fontWeight: 800,
              fontSize: '1.5rem'
            }}>
              TI
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827' }}>
                UNIVERSITAS NEGERI TEKNOLOGI INDONESIA
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1E40AF' }}>
                FAKULTAS ILMU KOMPUTER — PROGRAM STUDI S1 TEKNIK INFORMATIKA
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                Gedung Graha Sains Lt. 3, Kampus Terpadu • Email: informatika@inti.ac.id • Web: if.inti.ac.id
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-block',
              padding: '0.25rem 0.6rem',
              border: '1px solid #1E40AF',
              borderRadius: '4px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#1E40AF'
            }}>
              FORMULIR: LPMU-EOMS-04
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: '0.25rem' }}>
              Klasifikasi: Rahasia Terbatas
            </div>
          </div>
        </div>

        {/* Title of Document */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#111827' }}>
            LAPORAN KESIAPAN AUDIT SISTEM MANAJEMEN ORGANISASI PENDIDIKAN
          </h2>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#4B5563', marginTop: '0.25rem' }}>
            STANDAR INTERNASIONAL ISO 21001:2018 (EOMS) — TAHAP 1
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '0.25rem' }}>
            Nomor Registrasi: 042/EOMS-TI/LPMU/III/2026 • Tanggal Terbit: {todayStr}
          </div>
        </div>

        {/* Executive Summary Box */}
        <div style={{
          border: '1px solid #D1D5DB',
          borderRadius: '6px',
          padding: '1.25rem',
          backgroundColor: '#F9FAFB',
          marginBottom: '1.75rem'
        }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            1. Ringkasan Eksekutif Kesiapan (Executive Readiness Summary)
          </h4>
          <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            Berdasarkan hasil evaluasi verifikasi bukti objektif tripartit (PIC Mutu, Kaprodi, dan Auditor Internal),
            Program Studi S1 Teknik Informatika telah menyusun dan memvalidasi portofolio instrumen EOMS
            untuk persiapan audit sertifikasi ISO 21001:2018 dengan rincian capaian kuantitatif sebagai berikut:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: 600 }}>READINESS SCORE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E40AF' }}>{metrics.readinessScore}%</div>
              <div style={{ fontSize: '0.6875rem', color: '#059669', fontWeight: 600 }}>Target: ≥ 90%</div>
            </div>

            <div style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: 600 }}>DOKUMEN APPROVED</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>{metrics.approvedDocs}</div>
              <div style={{ fontSize: '0.6875rem', color: '#6B7280' }}>dari {metrics.totalDocs} Instrumen</div>
            </div>

            <div style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: 600 }}>UNDER REVIEW</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706' }}>{metrics.underReviewDocs}</div>
              <div style={{ fontSize: '0.6875rem', color: '#6B7280' }}>Menunggu Validasi</div>
            </div>

            <div style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: 600 }}>TEMUAN NCR AKTIF</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#DC2626' }}>{metrics.needsRevisionDocs}</div>
              <div style={{ fontSize: '0.6875rem', color: '#DC2626', fontWeight: 600 }}>Tindak Lanjut Segera</div>
            </div>
          </div>
        </div>

        {/* Pillar Fulfillment Table */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            2. Matriks Capaian Pemenuhan 5 Pilar Klausul ISO 21001:2018
          </h4>

          <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ background: '#F3F4F6' }}>
                <th style={{ border: '1px solid #9CA3AF', padding: '0.5rem', textAlign: 'left' }}>Pilar Klausul EOMS</th>
                <th style={{ border: '1px solid #9CA3AF', padding: '0.5rem', textAlign: 'left' }}>Lingkup Pemenuhan</th>
                <th style={{ border: '1px solid #9CA3AF', padding: '0.5rem', textAlign: 'center' }}>Total</th>
                <th style={{ border: '1px solid #9CA3AF', padding: '0.5rem', textAlign: 'center' }}>Approved</th>
                <th style={{ border: '1px solid #9CA3AF', padding: '0.5rem', textAlign: 'center' }}>Review</th>
                <th style={{ border: '1px solid #9CA3AF', padding: '0.5rem', textAlign: 'center' }}>Kesiapan</th>
              </tr>
            </thead>
            <tbody>
              {metrics.pillarStats.map((pillar) => (
                <tr key={pillar.id}>
                  <td style={{ border: '1px solid #D1D5DB', padding: '0.5rem', fontWeight: 600 }}>
                    {pillar.code} ({pillar.clauses})
                  </td>
                  <td style={{ border: '1px solid #D1D5DB', padding: '0.5rem' }}>
                    <strong>{pillar.name}</strong><br />
                    <span style={{ color: '#4B5563', fontSize: '0.6875rem' }}>{pillar.description}</span>
                  </td>
                  <td style={{ border: '1px solid #D1D5DB', padding: '0.5rem', textAlign: 'center' }}>{pillar.total}</td>
                  <td style={{ border: '1px solid #D1D5DB', padding: '0.5rem', textAlign: 'center', color: '#059669', fontWeight: 600 }}>{pillar.approved}</td>
                  <td style={{ border: '1px solid #D1D5DB', padding: '0.5rem', textAlign: 'center', color: '#D97706' }}>{pillar.review + pillar.revision}</td>
                  <td style={{ border: '1px solid #D1D5DB', padding: '0.5rem', textAlign: 'center', fontWeight: 700 }}>
                    {pillar.score}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Findings Matrix Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            3. Rekapitulasi Temuan Ketidaksesuaian (NCR) & Rencana Tindakan Koreksi
          </h4>

          {findings.filter(f => f.status !== 'Closed').length === 0 ? (
            <div style={{ padding: '0.75rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '4px', color: '#065F46', fontSize: '0.75rem' }}>
              ✓ Seluruh temuan audit internal telah selesai ditindaklanjuti dan diverifikasi (Status: Closed).
            </div>
          ) : (
            <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ background: '#F3F4F6' }}>
                  <th style={{ border: '1px solid #9CA3AF', padding: '0.4rem', textAlign: 'left' }}>No.</th>
                  <th style={{ border: '1px solid #9CA3AF', padding: '0.4rem', textAlign: 'left' }}>Klausul</th>
                  <th style={{ border: '1px solid #9CA3AF', padding: '0.4rem', textAlign: 'left' }}>Jenis</th>
                  <th style={{ border: '1px solid #9CA3AF', padding: '0.4rem', textAlign: 'left' }}>Uraian & Rekomendasi Auditor</th>
                  <th style={{ border: '1px solid #9CA3AF', padding: '0.4rem', textAlign: 'center' }}>Jatuh Tempo</th>
                  <th style={{ border: '1px solid #9CA3AF', padding: '0.4rem', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {findings.filter(f => f.status !== 'Closed').map((f) => (
                  <tr key={f.id}>
                    <td style={{ border: '1px solid #D1D5DB', padding: '0.4rem', fontWeight: 600 }}>{f.id}</td>
                    <td style={{ border: '1px solid #D1D5DB', padding: '0.4rem' }}>{f.clause}</td>
                    <td style={{ border: '1px solid #D1D5DB', padding: '0.4rem', color: f.type === 'NCR Mayor' ? '#DC2626' : '#D97706', fontWeight: 600 }}>
                      {f.type}
                    </td>
                    <td style={{ border: '1px solid #D1D5DB', padding: '0.4rem' }}>
                      <strong>{f.title}</strong><br />
                      <span style={{ color: '#4B5563' }}>{f.recommendation || f.description}</span>
                    </td>
                    <td style={{ border: '1px solid #D1D5DB', padding: '0.4rem', textAlign: 'center' }}>{f.dueDate}</td>
                    <td style={{ border: '1px solid #D1D5DB', padding: '0.4rem', textAlign: 'center', fontWeight: 600 }}>{f.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Signatures */}
        <div className="signature-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          marginTop: '3rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.8125rem', color: '#4B5563', marginBottom: '4rem' }}>
              Mengetahui dan Mengesahkan,<br />
              <strong>Ketua Program Studi S1 Teknik Informatika</strong>
            </div>
            <div style={{ borderTop: '1px solid #111827', paddingTop: '0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>
              {prodiInfo.kaprodi}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              NIP: 19760815 200212 1 001
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8125rem', color: '#4B5563', marginBottom: '4rem' }}>
              Dibuat Oleh,<br />
              <strong>Ketua Gugus Penjaminan Mutu (GPM)</strong>
            </div>
            <div style={{ borderTop: '1px solid #111827', paddingTop: '0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>
              {prodiInfo.ketuaGpm}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              NIP: 19850412 201012 1 002
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
