/**
 * ProdiDoc ISO 21001 — Master Initial Dataset
 * Program Studi: S1 Teknik Informatika (Fakultas Ilmu Komputer)
 * Standar Acuan: ISO 21001:2018 (EOMS) & SPMI Dikti / IABEE
 */

export const INITIAL_PILLARS = [
  {
    id: 1,
    code: 'PILAR-1',
    clauses: 'Klausul 4 & 5',
    name: 'Tata Kelola & Kebijakan',
    description: 'Konteks organisasi, ruang lingkup EOMS, kepemimpinan, komitmen pimpinan, dan kebijakan mutu pendidikan prodi.',
    color: 'blue'
  },
  {
    id: 2,
    code: 'PILAR-2',
    clauses: 'Klausul 6',
    name: 'Analisis Konteks, Risiko & Peluang',
    description: 'Analisis SWOT/PESTLE prodi, matriks harapan pemangku kepentingan, risk register laboratorium/kurikulum, dan sasaran mutu tahunan.',
    color: 'purple'
  },
  {
    id: 3,
    code: 'PILAR-3',
    clauses: 'Klausul 8',
    name: 'Operasional Pendidikan & Pembelajaran OBE',
    description: 'Perencanaan kurikulum CPL/OBE, RPS terintegrasi, SOP perkuliahan, rubrik asesmen capstone, inklusivitas disabilitas, dan pedoman MBKM.',
    color: 'green'
  },
  {
    id: 4,
    code: 'PILAR-4',
    clauses: 'Klausul 7',
    name: 'Sumber Daya, Sarpras & Kompetensi SDM',
    description: 'Beban kerja dosen (BKD), sertifikasi kompetensi industri, log pemeliharaan lab jaringan & AI, serta pelatihan tenaga kependidikan.',
    color: 'cyan'
  },
  {
    id: 5,
    code: 'PILAR-5',
    clauses: 'Klausul 9 & 10',
    name: 'Evaluasi Kinerja, AMI & Tinjauan Manajemen',
    description: 'Laporan Audit Mutu Internal (AMI), notula Rapat Tinjauan Manajemen (RTM), survei kepuasan stakeholder, dan PTK (Tindakan Koreksi).',
    color: 'amber'
  }
];

export const INITIAL_ROLES = {
  gpm: {
    id: 'gpm',
    title: 'Gugus Penjaminan Mutu (GPM / PIC Mutu)',
    shortTitle: 'PIC Mutu',
    name: 'Dr. Ir. Hendra Wicaksono, M.Kom.',
    nip: '19850412 201012 1 002',
    department: 'GPM S1 Teknik Informatika',
    badgeClass: 'gpm',
    avatar: '👨‍💼',
    permissions: {
      canUpload: true,
      canRevise: true,
      canComment: true,
      canApproveFormal: false,
      canIssueNCR: false,
      canSignReport: true
    }
  },
  kaprodi: {
    id: 'kaprodi',
    title: 'Ketua Program Studi (Kaprodi)',
    shortTitle: 'Kaprodi',
    name: 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
    nip: '19760815 200212 1 001',
    department: 'Ketua Program Studi S1 Teknik Informatika',
    badgeClass: 'kaprodi',
    avatar: '🎓',
    permissions: {
      canUpload: true,
      canRevise: false,
      canComment: true,
      canApproveFormal: true, // Otorisasi Kebijakan & Disposisi
      canIssueNCR: false,
      canSignReport: true
    }
  },
  auditor: {
    id: 'auditor',
    title: 'Auditor Mutu (Internal / Eksternal ISO 21001)',
    shortTitle: 'Auditor Mutu',
    name: 'Ir. Ratna Dewi Sartika, M.T., Lead Auditor ISO',
    nip: '19810325 200501 2 003',
    department: 'Lembaga Penjaminan Mutu Universitas (LPMU) / Lead Auditor',
    badgeClass: 'auditor',
    avatar: '🔍',
    permissions: {
      canUpload: false,
      canRevise: false,
      canComment: true,
      canApproveFormal: true, // Lead Auditor Approval
      canIssueNCR: true,
      canSignReport: true
    }
  }
};

export const INITIAL_DOCUMENTS = [
  // --- PILAR 1: TATA KELOLA & KEBIJAKAN (Kl 4 & 5) ---
  {
    id: 'doc-01',
    code: 'DOC-ISO21-KL4-001',
    pillarId: 1,
    clause: '4.1 & 4.3',
    title: 'Manual Mutu EOMS & Ruang Lingkup Sistem Manajemen Pendidikan Prodi TI',
    category: 'Kebijakan & Tata Kelola',
    version: 'v2.2',
    effectiveDate: '2026-01-15',
    pic: 'Dr. Ir. Hendra Wicaksono, M.Kom.',
    status: 'approved', // 'approved' | 'under_review' | 'needs_revision'
    signedPdf: true,
    fileSize: '4.8 MB',
    summary: 'Dokumen panduan induk EOMS Prodi S1 Teknik Informatika yang mendefinisikan ruang lingkup pendidikan sarjana reguler dan MBKM.',
    history: [
      { version: 'v2.2', date: '2026-01-15', author: 'Hendra Wicaksono', note: 'Penyesuaian terminologi OBE & klausul inklusivitas 4.3' },
      { version: 'v2.1', date: '2025-08-10', author: 'Hendra Wicaksono', note: 'Integrasi kurikulum 2024' },
      { version: 'v1.0', date: '2024-02-01', author: 'Tim GPM', note: 'Terbitan perdana' }
    ],
    dialogue: [
      {
        id: 'msg-01',
        authorRole: 'auditor',
        authorName: 'Ir. Ratna Dewi Sartika, M.T.',
        type: 'Otorisasi Kebijakan Prodi',
        timestamp: '2026-01-18 10:15',
        text: 'Ruang lingkup pada bab 2.4 telah mencakup seluruh laboratorium komputasi cerdas dan software engineering. Dinyatakan memenuhi kriteria klausul 4.1 dan 4.3.'
      }
    ]
  },
  {
    id: 'doc-02',
    code: 'DOC-ISO21-KL5-002',
    pillarId: 1,
    clause: '5.1 & 5.2',
    title: 'Pakta Integritas, Visi Keilmuan & Kebijakan Pendidikan Prodi S1 TI',
    category: 'Kebijakan & Tata Kelola',
    version: 'v2.0',
    effectiveDate: '2026-02-01',
    pic: 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
    status: 'approved',
    signedPdf: true,
    fileSize: '2.1 MB',
    summary: 'Komitmen kepemimpinan prodi terhadap pencapaian standar mutu internasional dan etika akademik bebas plagiarisme.',
    history: [
      { version: 'v2.0', date: '2026-02-01', author: 'Satria Ramadhan', note: 'Penetapan visi keilmuan menuju kecerdasan artifisial terapan' },
      { version: 'v1.0', date: '2024-03-12', author: 'Satria Ramadhan', note: 'Dokumen inisial' }
    ],
    dialogue: [
      {
        id: 'msg-02',
        authorRole: 'kaprodi',
        authorName: 'Prof. Dr. Eng. Satria Ramadhan',
        type: 'Otorisasi Kebijakan Prodi',
        timestamp: '2026-02-02 14:00',
        text: 'Kebijakan pendidikan ini telah disosialisasikan pada rapat pleno dosen pada 28 Januari 2026 dan ditandatangani secara digital.'
      }
    ]
  },
  {
    id: 'doc-03',
    code: 'DOC-ISO21-KL5-003',
    pillarId: 1,
    clause: '5.3',
    title: 'Struktur Organisasi & Uraian Tugas (Job Description) Gugus Mutu Prodi',
    category: 'Kebijakan & Tata Kelola',
    version: 'v1.3',
    effectiveDate: '2026-01-20',
    pic: 'Dr. Ir. Hendra Wicaksono, M.Kom.',
    status: 'approved',
    signedPdf: true,
    fileSize: '1.7 MB',
    summary: 'Bagan tata kelola penjaminan mutu tingkat prodi beserta matriks wewenang otorisasi kurikulum dan penilaian.',
    history: [
      { version: 'v1.3', date: '2026-01-20', author: 'Hendra Wicaksono', note: 'Penambahan koordinator laboratorium cyber security' }
    ],
    dialogue: []
  },

  // --- PILAR 2: ANALISIS KONTEKS, RISIKO & PELUANG (Kl 6) ---
  {
    id: 'doc-04',
    code: 'DOC-ISO21-KL6-001',
    pillarId: 2,
    clause: '6.1.1',
    title: 'Risk Register & Mitigasi Risiko Operasional Laboratorium Komputer & Server',
    category: 'Manajemen Risiko',
    version: 'v2.1',
    effectiveDate: '2026-02-10',
    pic: 'Ahmad Fauzi, M.T. (PIC Lab)',
    status: 'under_review',
    signedPdf: true,
    fileSize: '3.4 MB',
    summary: 'Pemetaan risiko kegagalan listrik, serangan keamanan jaringan, dan kehilangan data praktikum mahasiswa beserta protokol mitigasi.',
    history: [
      { version: 'v2.1', date: '2026-02-10', author: 'Ahmad Fauzi', note: 'Penambahan skenario kegagalan UPS sentral ruang server' },
      { version: 'v2.0', date: '2025-06-15', author: 'Ahmad Fauzi', note: 'Update analisis malware' }
    ],
    dialogue: [
      {
        id: 'msg-03',
        authorRole: 'auditor',
        authorName: 'Ir. Ratna Dewi Sartika, M.T.',
        type: 'Temuan Observasi (Klausul 6.1)',
        timestamp: '2026-03-01 09:30',
        text: 'Perlu dicantumkan frekuensi simulasi pemulihan bencana (disaster recovery test) untuk server nilai online prodi.'
      },
      {
        id: 'msg-04',
        authorRole: 'gpm',
        authorName: 'Dr. Ir. Hendra Wicaksono, M.Kom.',
        type: 'Tindak Lanjut Bukti',
        timestamp: '2026-03-02 11:15',
        text: 'Sedang disinkronkan dengan UPT TIK Fakultas. Rencana uji coba terjadwal pada 15 April 2026.'
      }
    ]
  },
  {
    id: 'doc-05',
    code: 'DOC-ISO21-KL6-002',
    pillarId: 2,
    clause: '6.2',
    title: 'Sasaran Mutu Tahunan & Rencana Aksi Kinerja Prodi Teknik Informatika 2026',
    category: 'Manajemen Risiko',
    version: 'v1.0',
    effectiveDate: '2026-01-05',
    pic: 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
    status: 'approved',
    signedPdf: true,
    fileSize: '1.9 MB',
    summary: 'Target kuantitatif kelulusan tepat waktu 80%, masa tunggu kerja < 3 bulan, dan rasio dosen bersertifikasi internasional.',
    history: [
      { version: 'v1.0', date: '2026-01-05', author: 'Satria Ramadhan', note: 'Pengesahan Sasaran Mutu 2026' }
    ],
    dialogue: []
  },

  // --- PILAR 3: OPERASIONAL PENDIDIKAN & PEMBELAJARAN (Kl 8) ---
  {
    id: 'doc-06',
    code: 'DOC-ISO21-KL8-001',
    pillarId: 3,
    clause: '8.1 & 8.5',
    title: 'RPS OBE & Rubrik Asesmen Portofolio: Rekayasa Perangkat Lunak Terdistribusi',
    category: 'Operasional Pendidikan',
    version: 'v3.0',
    effectiveDate: '2026-02-15',
    pic: 'Dr. Ir. Hendra Wicaksono, M.Kom.',
    status: 'approved',
    signedPdf: true,
    fileSize: '5.2 MB',
    summary: 'Rencana Pembelajaran Semester lengkap dengan integrasi CPL (Capaian Pembelajaran Lulusan) IABEE dan rubrik penilaian coding standard.',
    history: [
      { version: 'v3.0', date: '2026-02-15', author: 'Hendra Wicaksono', note: 'Integrasi kriteria Clean Code & Git flow evaluation' }
    ],
    dialogue: []
  },
  {
    id: 'doc-07',
    code: 'DOC-ISO21-KL8-002',
    pillarId: 3,
    clause: '8.2.2 & 8.5.1',
    title: 'SOP Pelaksanaan Sidang Tugas Akhir, Ujian Skripsi & Asesmen Capstone Project',
    category: 'Operasional Pendidikan',
    version: 'v2.3',
    effectiveDate: '2026-02-28',
    pic: 'Sekretaris Prodi TI',
    status: 'needs_revision', // Status NCR Mayor
    signedPdf: false,
    fileSize: '3.1 MB',
    summary: 'Standar operasional prosedur pengujian tugas akhir, validasi anti-plagiarisme (Turnitin < 20%), dan rubrik penguji independen.',
    history: [
      { version: 'v2.3', date: '2026-02-28', author: 'Sekretaris Prodi', note: 'Draft penyesuaian regulasi sidang online/hybrid' }
    ],
    dialogue: [
      {
        id: 'msg-05',
        authorRole: 'auditor',
        authorName: 'Ir. Ratna Dewi Sartika, M.T.',
        type: 'Temuan Observasi (Klausul 8.5.1)',
        timestamp: '2026-03-05 14:20',
        text: '[NCR Mayor - Klausul 8.5.1]: Tidak ditemukan bukti form rubrik asesmen khusus mahasiswa berkebutuhan khusus (inklusivitas pendidikan) serta belum ada tanda tangan digital pengesahan Dekanat pada lampiran 3.'
      },
      {
        id: 'msg-06',
        authorRole: 'kaprodi',
        authorName: 'Prof. Dr. Eng. Satria Ramadhan',
        type: 'Otorisasi Kebijakan Prodi',
        timestamp: '2026-03-06 08:45',
        text: 'Disposisi PIC Mutu: Segera lengkapi rubrik asesmen inklusif sesuai klausul 8.5.1.3 EOMS dan lakukan resubmit berkas sebelum tanggal 12 Maret.'
      },
      {
        id: 'msg-07',
        authorRole: 'gpm',
        authorName: 'Dr. Ir. Hendra Wicaksono, M.Kom.',
        type: 'Tindak Lanjut Bukti',
        timestamp: '2026-03-07 10:00',
        text: 'Tim GPM telah menyusun draf adendum inklusivitas dan sedang meminta tandatangan Dekan. Revisi v2.4 akan diunggah sore ini.'
      }
    ]
  },
  {
    id: 'doc-08',
    code: 'DOC-ISO21-KL8-003',
    pillarId: 3,
    clause: '8.4',
    title: 'Pedoman Program Magang Industri, Capstone MBKM & Rekognisi SKS',
    category: 'Operasional Pendidikan',
    version: 'v2.0',
    effectiveDate: '2026-01-10',
    pic: 'Koordinator MBKM TI',
    status: 'approved',
    signedPdf: true,
    fileSize: '4.1 MB',
    summary: 'Panduan pelaksanaan magang bersertifikat, kriteria mitra industri teknologi, logbook mahasiswa, dan formulir konversi 20 SKS.',
    history: [
      { version: 'v2.0', date: '2026-01-10', author: 'Koordinator MBKM', note: 'Sinkronisasi MBKM Mandiri dan MSIB Batch 7' }
    ],
    dialogue: []
  },
  {
    id: 'doc-09',
    code: 'DOC-ISO21-KL8-004',
    pillarId: 3,
    clause: '8.5.1.3',
    title: 'SOP Pelayanan & Fasilitas Pembelajaran Inklusif bagi Mahasiswa Berkebutuhan Khusus',
    category: 'Operasional Pendidikan',
    version: 'v1.1',
    effectiveDate: '2026-02-20',
    pic: 'Dr. Ir. Hendra Wicaksono, M.Kom.',
    status: 'under_review',
    signedPdf: true,
    fileSize: '2.5 MB',
    summary: 'Akomodasi layar pembaca (screen reader) di lab, pendampingan asisten praktikum, dan modifikasi durasi ujian coding.',
    history: [
      { version: 'v1.1', date: '2026-02-20', author: 'Hendra Wicaksono', note: 'Penambahan pedoman lab audio-assistive' }
    ],
    dialogue: [
      {
        id: 'msg-08',
        authorRole: 'auditor',
        authorName: 'Ir. Ratna Dewi Sartika, M.T.',
        type: 'Temuan Observasi (Klausul 8.5.1.3)',
        timestamp: '2026-03-08 16:30',
        text: 'Observasi Minor: Mohon lampirkan form permohonan akomodasi khusus mahasiswa pada formulir F-INK-02.'
      }
    ]
  },

  // --- PILAR 4: SUMBER DAYA, SARPRAS & SDM (Kl 7) ---
  {
    id: 'doc-10',
    code: 'DOC-ISO21-KL7-001',
    pillarId: 4,
    clause: '7.1.5 & 7.2',
    title: 'Matriks Pemetaan Kompetensi Dosen & Sertifikasi Profesional Internasional',
    category: 'Sumber Daya & SDM',
    version: 'v2.0',
    effectiveDate: '2026-01-30',
    pic: 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
    status: 'approved',
    signedPdf: true,
    fileSize: '3.8 MB',
    summary: 'Rekapitulasi sertifikasi keahlian dosen (AWS Solution Architect, TensorFlow Developer, Cisco CCNA, Certified Ethical Hacker).',
    history: [
      { version: 'v2.0', date: '2026-01-30', author: 'Satria Ramadhan', note: 'Update sertifikasi 8 dosen pengampu lab' }
    ],
    dialogue: []
  },
  {
    id: 'doc-11',
    code: 'DOC-ISO21-KL7-002',
    pillarId: 4,
    clause: '7.1.3 & 7.1.4',
    title: 'Log Kalibrasi, Perawatan Berkala & Inventarisasi Perangkat Laboratorium TI',
    category: 'Sumber Daya & SDM',
    version: 'v1.5',
    effectiveDate: '2026-02-18',
    pic: 'Ahmad Fauzi, M.T. (PIC Lab)',
    status: 'approved',
    signedPdf: true,
    fileSize: '4.6 MB',
    summary: 'Daftar cek fisik 120 unit PC Core i7/RTX, 8 switch layer-3 Cisco, server rack cloud, dan pendingin ruangan presisi.',
    history: [
      { version: 'v1.5', date: '2026-02-18', author: 'Ahmad Fauzi', note: 'Pencatatan hasil maintenance rutin semester genap' }
    ],
    dialogue: []
  },

  // --- PILAR 5: EVALUASI KINERJA, AMI & RTM (Kl 9 & 10) ---
  {
    id: 'doc-12',
    code: 'DOC-ISO21-KL9-001',
    pillarId: 5,
    clause: '9.2',
    title: 'Laporan Komprehensif Audit Mutu Internal (AMI) Siklus XI S1 Teknik Informatika',
    category: 'Evaluasi & Peningkatan Mutu',
    version: 'v1.0',
    effectiveDate: '2026-02-25',
    pic: 'Ir. Ratna Dewi Sartika, M.T.',
    status: 'approved',
    signedPdf: true,
    fileSize: '6.5 MB',
    summary: 'Laporan audit kepatuhan kurikulum, evaluasi RPS, kecukupan fasilitas, dan hasil rekapitulasi temuan audit internal universitas.',
    history: [
      { version: 'v1.0', date: '2026-02-25', author: 'Auditor Team', note: 'Laporan resmi AMI ditandatangani Ketua LPMU' }
    ],
    dialogue: []
  },
  {
    id: 'doc-13',
    code: 'DOC-ISO21-KL9-002',
    pillarId: 5,
    clause: '9.3',
    title: 'Risalah & Notula Rapat Tinjauan Manajemen (RTM) Kesiapan Akreditasi EOMS',
    category: 'Evaluasi & Peningkatan Mutu',
    version: 'v1.0',
    effectiveDate: '2026-03-01',
    pic: 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
    status: 'approved',
    signedPdf: true,
    fileSize: '2.8 MB',
    summary: 'Keputusan pimpinan prodi mengenai alokasi anggaran upgrade perangkat lab, tindak lanjut evaluasi dosen oleh mahasiswa (EDOM).',
    history: [
      { version: 'v1.0', date: '2026-03-01', author: 'Satria Ramadhan', note: 'Notula pleno RTM tingkat fakultas' }
    ],
    dialogue: []
  },
  {
    id: 'doc-14',
    code: 'DOC-ISO21-KL10-003',
    pillarId: 5,
    clause: '10.1 & 10.2',
    title: 'Matriks Permintaan Tindakan Koreksi (PTK / Corrective Action Plan) Siklus 2026',
    category: 'Evaluasi & Peningkatan Mutu',
    version: 'v1.2',
    effectiveDate: '2026-03-04',
    pic: 'Dr. Ir. Hendra Wicaksono, M.Kom.',
    status: 'under_review',
    signedPdf: true,
    fileSize: '2.4 MB',
    summary: 'Rencana perbaikan terukur terhadap seluruh catatan observasi dan NCR dari siklus audit internal sebelumnya.',
    history: [
      { version: 'v1.2', date: '2026-03-04', author: 'Hendra Wicaksono', note: 'Pembaharuan status closed pada temuan sarana server' }
    ],
    dialogue: [
      {
        id: 'msg-09',
        authorRole: 'auditor',
        authorName: 'Ir. Ratna Dewi Sartika, M.T.',
        type: 'Temuan Observasi (Klausul 10.2)',
        timestamp: '2026-03-06 11:30',
        text: 'Perlu ditambahkan verifikasi bukti akar masalah (Root Cause Analysis - 5 Whys) pada baris PTK-TI-04.'
      }
    ]
  }
];

export const INITIAL_FINDINGS = [
  {
    id: 'FND-001',
    docId: 'doc-07',
    code: 'DOC-ISO21-KL8-002',
    clause: '8.5.1',
    pillarId: 3,
    type: 'NCR Mayor', // 'NCR Mayor' | 'Observasi Minor'
    title: 'Ketiadaan Rubrik Asesmen Inklusif Mahasiswa Disabilitas & Otorisasi Lampiran 3',
    description: 'SOP Sidang Tugas Akhir belum mengakomodasi prosedur asesmen inklusivitas pendidikan (EOMS 8.5.1.3) serta lampiran 3 belum ditandatangani pejabat berwenang.',
    recommendation: 'Lengkapi pasal klausul inklusivitas, sediakan form rubrik alternatif, dan unggah berkas signed PDF resmi.',
    auditor: 'Ir. Ratna Dewi Sartika, M.T.',
    pic: 'Dr. Ir. Hendra Wicaksono, M.Kom. (GPM)',
    dueDate: '2026-03-12',
    status: 'In Progress', // 'Open' | 'In Progress' | 'Closed'
    resolutionNotes: 'Draf rubrik inklusif telah disusun bersama tim psikolog universitas. Menunggu tandatangan Dekan.'
  },
  {
    id: 'FND-002',
    docId: 'doc-04',
    code: 'DOC-ISO21-KL6-001',
    clause: '6.1.1',
    pillarId: 2,
    type: 'Observasi Minor',
    title: 'Jadwal Simulasi Disaster Recovery Lab Server Belum Tercatat Eksplisit',
    description: 'Risk register telah mencakup mitigasi insiden siber namun tanggal pelaksanaan simulasi failover berkala belum dicantumkan di SOP.',
    recommendation: 'Tetapkan kalender simulasi minimal 1 kali per semester pada kalender operasional prodi.',
    auditor: 'Ir. Ratna Dewi Sartika, M.T.',
    pic: 'Ahmad Fauzi, M.T.',
    dueDate: '2026-03-18',
    status: 'In Progress',
    resolutionNotes: 'Disepakati simulasi failover dijadwalkan pada 15 April 2026.'
  },
  {
    id: 'FND-003',
    docId: 'doc-09',
    code: 'DOC-ISO21-KL8-004',
    clause: '8.5.1.3',
    pillarId: 3,
    type: 'Observasi Minor',
    title: 'Lampiran Formulir Permohonan Akomodasi Khusus (F-INK-02) Belum Terpasang',
    description: 'SOP menyebutkan mahasiswa dapat mengajukan perpanjangan waktu praktikum dengan formulir F-INK-02, namun form belum dilampirkan.',
    recommendation: 'Lampirkan template formulir resmi pada bab lampiran SOP.',
    auditor: 'Ir. Ratna Dewi Sartika, M.T.',
    pic: 'Dr. Ir. Hendra Wicaksono, M.Kom.',
    dueDate: '2026-03-20',
    status: 'Open',
    resolutionNotes: ''
  }
];

export const INITIAL_AUDIT_TRAIL = [
  {
    id: 'log-01',
    timestamp: '2026-03-08 16:30',
    actor: 'Ir. Ratna Dewi Sartika, M.T.',
    role: 'Auditor Mutu',
    action: 'Menerbitkan Observasi Minor',
    target: 'DOC-ISO21-KL8-004 (SOP Pelayanan Inklusif)',
    type: 'warning'
  },
  {
    id: 'log-02',
    timestamp: '2026-03-07 10:00',
    actor: 'Dr. Ir. Hendra Wicaksono, M.Kom.',
    role: 'PIC Mutu (GPM)',
    action: 'Menanggapi Thread Verifikasi & Rencana Aksi',
    target: 'DOC-ISO21-KL8-002 (SOP Sidang Tugas Akhir)',
    type: 'info'
  },
  {
    id: 'log-03',
    timestamp: '2026-03-06 08:45',
    actor: 'Prof. Dr. Eng. Satria Ramadhan',
    role: 'Ketua Program Studi',
    action: 'Memberikan Disposisi Percepatan Revisi',
    target: 'DOC-ISO21-KL8-002 (SOP Sidang Tugas Akhir)',
    type: 'purple'
  },
  {
    id: 'log-04',
    timestamp: '2026-03-05 14:20',
    actor: 'Ir. Ratna Dewi Sartika, M.T.',
    role: 'Auditor Mutu',
    action: 'Menetapkan Status: NCR Mayor',
    target: 'DOC-ISO21-KL8-002 (Klausul 8.5.1)',
    type: 'danger'
  },
  {
    id: 'log-05',
    timestamp: '2026-03-01 10:00',
    actor: 'Prof. Dr. Eng. Satria Ramadhan',
    role: 'Ketua Program Studi',
    action: 'Menandatangani Digital Notula RTM',
    target: 'DOC-ISO21-KL9-002 (Risalah RTM)',
    type: 'success'
  }
];

export const PRODI_INFO = {
  institution: 'Fakultas Ilmu Komputer — Universitas Negeri Teknologi Indonesia',
  program: 'Program Studi S1 Teknik Informatika',
  degree: 'Sarjana Komputer (S.Kom.)',
  isoTarget: 'Sertifikasi ISO 21001:2018 (EOMS) — Tahap 1',
  auditDate: '2026-04-06', // 14 hari kerja menuju audit eksternal
  leadAuditor: 'Ir. Ratna Dewi Sartika, M.T., Lead Auditor EOMS',
  kaprodi: 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
  ketuaGpm: 'Dr. Ir. Hendra Wicaksono, M.Kom.',
  totalInstrumentsTarget: 14
};
