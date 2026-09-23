import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_DOCUMENTS,
  INITIAL_FINDINGS,
  INITIAL_AUDIT_TRAIL,
  INITIAL_PILLARS,
  PRODI_INFO
} from '../data/initialMockData';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const DocumentContext = createContext();

export function DocumentProvider({ children }) {
  const { activeRole } = useAuth();

  // Active Department (TIF / TIND)
  const [selectedDept, setSelectedDept] = useState(() => {
    return localStorage.getItem('prodidoc_selected_dept') || 'TIF';
  });

  // Real backend dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Documents (local cache / fallback)
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('prodidoc_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  // Findings / NCR Matrix
  const [findings, setFindings] = useState(() => {
    const saved = localStorage.getItem('prodidoc_findings');
    return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
  });

  // Audit Trail
  const [auditTrail, setAuditTrail] = useState(() => {
    const saved = localStorage.getItem('prodidoc_audit_trail');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_TRAIL;
  });

  // Active Document for Verification Workspace
  const [activeDocId, setActiveDocId] = useState(() => documents[0]?.id || 'doc-01');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillarFilter, setSelectedPillarFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Active Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch real backend dashboard data
  const fetchDashboardData = useCallback(async (dept = selectedDept) => {
    try {
      setLoadingDashboard(true);
      const res = await api.getDashboard(dept);
      if (res?.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.warn('Backend dashboard unavailable, using fallback mock data:', err);
    } finally {
      setLoadingDashboard(false);
    }
  }, [selectedDept]);

  useEffect(() => {
    fetchDashboardData(selectedDept);
    localStorage.setItem('prodidoc_selected_dept', selectedDept);
  }, [selectedDept, fetchDashboardData]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('prodidoc_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('prodidoc_findings', JSON.stringify(findings));
  }, [findings]);

  useEffect(() => {
    localStorage.setItem('prodidoc_audit_trail', JSON.stringify(auditTrail));
  }, [auditTrail]);

  // Helper to add audit trail entry
  const logAudit = (action, target, type = 'info') => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 16);
    const newLog = {
      id: 'log-' + Date.now(),
      timestamp,
      actor: activeRole.name,
      role: activeRole.shortTitle,
      action,
      target,
      type
    };
    setAuditTrail(prev => [newLog, ...prev]);
  };

  // Upload New Document
  const uploadDocument = (docData) => {
    const newId = 'doc-' + Date.now();
    const newDoc = {
      ...docData,
      id: newId,
      status: 'under_review',
      dialogue: []
    };
    setDocuments(prev => [newDoc, ...prev]);
    logAudit('Mengunggah Dokumen Baru', `${newDoc.code} - ${newDoc.title}`, 'info');
    fetchDashboardData(selectedDept);
    return newDoc;
  };

  // Update Document Version
  const updateDocumentVersion = (docId, newVersionData) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      const updatedHistory = [
        {
          version: newVersionData.version,
          date: new Date().toISOString().split('T')[0],
          author: activeRole.name,
          note: newVersionData.note
        },
        ...(doc.history || [])
      ];

      return {
        ...doc,
        version: newVersionData.version,
        fileSize: newVersionData.fileSize || doc.fileSize,
        effectiveDate: new Date().toISOString().split('T')[0],
        history: updatedHistory,
        status: 'under_review'
      };
    }));

    const targetDoc = documents.find(d => d.id === docId);
    logAudit(`Memperbarui Versi (${newVersionData.version})`, `${targetDoc?.code || docId} - ${newVersionData.note}`, 'warning');
    fetchDashboardData(selectedDept);
  };

  // Set Verification Status
  const setVerificationStatus = (docId, newStatus, feedbackNotes = '') => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;

      let dialogueEntry = null;
      if (feedbackNotes) {
        dialogueEntry = {
          id: 'msg-' + Date.now(),
          authorRole: activeRole.id,
          authorName: activeRole.name,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: newStatus === 'approved' ? 'Otorisasi Formal' : newStatus === 'needs_revision' ? 'Permintaan Revisi (NCR)' : 'Tinjauan Berkas',
          text: feedbackNotes
        };
      }

      return {
        ...doc,
        status: newStatus,
        dialogue: dialogueEntry ? [...(doc.dialogue || []), dialogueEntry] : (doc.dialogue || [])
      };
    }));

    const targetDoc = documents.find(d => d.id === docId);
    const label = newStatus === 'approved' ? 'Menyetujui Dokumen (Approved)' : newStatus === 'needs_revision' ? 'Menerbitkan NCR / Perlu Revisi' : 'Mengubah Status Tinjauan';
    const type = newStatus === 'approved' ? 'success' : newStatus === 'needs_revision' ? 'danger' : 'info';
    logAudit(label, `${targetDoc?.code || docId}`, type);
    fetchDashboardData(selectedDept);
  };

  // Add Dialogue / Audit Discussion Message
  const addDialogueMessage = (docId, messageData) => {
    const newMessage = {
      id: 'msg-' + Date.now(),
      authorRole: activeRole.id,
      authorName: activeRole.name,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: messageData.type,
      text: messageData.text
    };

    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        dialogue: [...(doc.dialogue || []), newMessage]
      };
    }));

    const targetDoc = documents.find(d => d.id === docId);
    logAudit('Mengirim Catatan Verifikasi', `${targetDoc?.code || docId} (${messageData.type})`, 'info');
  };

  // Update Finding Status
  const updateFindingStatus = (findingId, newStatus, notes = '') => {
    setFindings(prev => prev.map(f => {
      if (f.id !== findingId) return f;
      return {
        ...f,
        status: newStatus,
        resolutionNotes: notes || f.resolutionNotes
      };
    }));

    const finding = findings.find(f => f.id === findingId);
    logAudit(`Memperbarui Status Temuan: ${newStatus}`, `${finding?.id || findingId} - ${finding?.title || ''}`, newStatus === 'Closed' ? 'success' : 'warning');
  };

  // Reset to default data (Both VPS Backend and Local State)
  const resetAllData = async () => {
    const deptName = selectedDept === 'TIF' ? 'Teknik Informatika (TIF)' : 'Teknik Industri (TIND)';
    if (window.confirm(`Reset data repositori dan kesiapan ISO 21001 untuk program studi ${deptName} ke standar awal di VPS?`)) {
      try {
        setLoadingDashboard(true);
        await api.resetDemo(selectedDept);
        localStorage.removeItem('prodidoc_documents');
        localStorage.removeItem('prodidoc_findings');
        localStorage.removeItem('prodidoc_audit_trail');
        await fetchDashboardData(selectedDept);
        alert(`Data kesiapan ISO 21001 untuk ${deptName} berhasil di-reset ke kondisi standar awal.`);
        window.location.reload();
      } catch (err) {
        alert('Gagal mereset data: ' + err.message);
      } finally {
        setLoadingDashboard(false);
      }
    }
  };

  // Metrics calculation (prioritize real backend dashboard data)
  const readinessCounts = dashboardData?.readiness?.counts;
  const totalDocs = readinessCounts?.total_expected ?? documents.length;
  const approvedDocs = readinessCounts?.verified ?? documents.filter(d => d.status === 'approved').length;
  const underReviewDocs = readinessCounts?.submitted ?? documents.filter(d => d.status === 'under_review').length;
  const needsRevisionDocs = readinessCounts?.rejected ?? documents.filter(d => d.status === 'needs_revision').length;
  const notApplicableDocs = readinessCounts?.not_applicable ?? 0;
  const readinessScore = dashboardData?.readiness?.overall_score_percent ?? (totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0);

  // Per pillar/root folder stats
  const pillarStats = dashboardData?.readiness?.root_folder_breakdown
    ? dashboardData.readiness.root_folder_breakdown.map((rf, idx) => ({
        id: idx + 1,
        code: rf.name,
        clauses: rf.name === '01_Kurikulum' ? 'Klausul 8.1.2 & 8.3.4' :
                 rf.name === '02_Skripsi' ? 'Klausul 8.5 & 8.6' :
                 rf.name === '03_Wisuda' ? 'Klausul 8.7 & 9.1' :
                 rf.name === '04_Evaluasi-dan-Akreditasi' ? 'Klausul 9.1.4 & 9.2' : 'Klausul 6.2 & 7.1',
        name: rf.label,
        total: rf.total_expected,
        approved: rf.verified,
        review: rf.submitted,
        revision: rf.rejected,
        score: rf.score_percent,
        color: ['blue', 'purple', 'green', 'amber', 'cyan'][idx % 5]
      }))
    : INITIAL_PILLARS.map(pillar => {
        const pillarDocs = documents.filter(d => d.pillarId === pillar.id);
        const count = pillarDocs.length;
        const approved = pillarDocs.filter(d => d.status === 'approved').length;
        const review = pillarDocs.filter(d => d.status === 'under_review').length;
        const revision = pillarDocs.filter(d => d.status === 'needs_revision').length;
        const score = count > 0 ? Math.round((approved / count) * 100) : 0;
        return { ...pillar, total: count, approved, review, revision, score };
      });

  // Real Active NCRs from backend if available
  const displayFindings = (dashboardData?.active_ncrs && dashboardData.active_ncrs.length > 0)
    ? dashboardData.active_ncrs.map(ncr => ({
        id: `ncr-${ncr.id}`,
        docId: ncr.document_file_id,
        type: ncr.audit_status === 'major_ncr' ? 'NCR Mayor' : 'NCR Minor (Observation)',
        clause: ncr.iso_clause_ref || 'ISO 21001',
        title: ncr.document_file?.title || 'Instrumen Perkuliahan',
        pic: ncr.document_file?.course?.lecturer_name || 'Dosen Pengampu',
        dueDate: '48 Jam',
        status: 'Open',
        findingNotes: ncr.finding_notes,
      }))
    : findings;

  // Real Audit Trail from backend if available
  const displayAuditTrail = (dashboardData?.recent_verifications && dashboardData.recent_verifications.length > 0)
    ? [
        ...dashboardData.recent_verifications.map(v => ({
          id: `v-${v.id}`,
          timestamp: v.verified_at ? new Date(v.verified_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Hari ini',
          actor: v.auditor_name || 'Ir. Ratna Dewi Sartika, M.T.',
          role: 'Auditor Mutu EOMS',
          action: v.audit_status === 'compliant' ? 'Memverifikasi Instrumen (Compliant)' : 'Menerbitkan Catatan Audit (NCR)',
          target: v.document_file?.title || 'Dokumen Akreditasi',
          type: v.audit_status === 'compliant' ? 'success' : 'danger'
        })),
        ...(dashboardData.recent_comments || []).map(c => ({
          id: `c-${c.id}`,
          timestamp: c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Hari ini',
          actor: c.sender_name || 'Dr. Ir. Hendra Wicaksono, M.T.',
          role: c.sender_role || 'PIC Mutu / GPM',
          action: 'Memberikan Catatan Telaah Dokumen',
          target: c.message,
          type: 'purple'
        }))
      ]
    : auditTrail;

  // Dynamic prodi info
  const activeProdiInfo = {
    ...PRODI_INFO,
    name: dashboardData?.department?.name ? `S1 ${dashboardData.department.name}` : (selectedDept === 'TIF' ? 'S1 Teknik Informatika' : 'S1 Teknik Industri'),
    program: dashboardData?.department?.name ? `Program Studi S1 ${dashboardData.department.name}` : (selectedDept === 'TIF' ? 'Program Studi S1 Teknik Informatika' : 'Program Studi S1 Teknik Industri'),
    faculty: dashboardData?.department?.faculty || 'Fakultas Teknik',
    institution: 'Fakultas Teknik — ISO 21001 EOMS',
    auditDate: dashboardData?.readiness?.audit_target_date || '2026-04-06',
    period: dashboardData?.period?.name || 'Semester Genap 2025/2026',
    code: selectedDept
  };

  // Filtered documents
  const filteredDocuments = documents.filter(doc => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (
        doc.code?.toLowerCase().includes(q) ||
        doc.title?.toLowerCase().includes(q) ||
        doc.clause?.toLowerCase().includes(q) ||
        doc.pic?.toLowerCase().includes(q) ||
        doc.category?.toLowerCase().includes(q)
      );
      if (!matchText) return false;
    }

    if (selectedPillarFilter !== 'ALL') {
      if (doc.pillarId !== parseInt(selectedPillarFilter, 10)) return false;
    }

    if (selectedStatusFilter !== 'ALL') {
      if (doc.status !== selectedStatusFilter) return false;
    }

    return true;
  });

  return (
    <DocumentContext.Provider value={{
      documents,
      filteredDocuments,
      findings: displayFindings,
      auditTrail: displayAuditTrail,
      activeDocId,
      setActiveDocId,
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      selectedPillarFilter,
      setSelectedPillarFilter,
      selectedStatusFilter,
      setSelectedStatusFilter,
      selectedDept,
      setSelectedDept,
      dashboardData,
      loadingDashboard,
      refetchDashboard: fetchDashboardData,
      metrics: {
        totalDocs,
        approvedDocs,
        underReviewDocs,
        needsRevisionDocs,
        notApplicableDocs,
        readinessScore,
        pillarStats
      },
      prodiInfo: activeProdiInfo,
      uploadDocument,
      updateDocumentVersion,
      setVerificationStatus,
      addDialogueMessage,
      updateFindingStatus,
      resetAllData
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}
