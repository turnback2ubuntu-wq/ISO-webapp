import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_DOCUMENTS,
  INITIAL_FINDINGS,
  INITIAL_AUDIT_TRAIL,
  INITIAL_PILLARS,
  PRODI_INFO
} from '../data/initialMockData';
import { useAuth } from './AuthContext';

const DocumentContext = createContext();

export function DocumentProvider({ children }) {
  const { activeRole } = useAuth();

  // Documents
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
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'repository' | 'verification' | 'report'

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
      history: [
        {
          version: docData.version || 'v1.0',
          date: docData.effectiveDate || new Date().toISOString().substring(0, 10),
          author: activeRole.name,
          note: docData.changeNote || 'Unggahan instrumen baru'
        }
      ],
      dialogue: []
    };

    setDocuments(prev => [newDoc, ...prev]);
    logAudit('Mengunggah Instrumen Baru', `${newDoc.code} (${newDoc.title})`, 'info');
    return newDoc;
  };

  // Update Document Version (Revisi Baru)
  const updateDocumentVersion = (docId, newVersionData) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;

      const newHistoryItem = {
        version: newVersionData.version,
        date: newVersionData.date || new Date().toISOString().substring(0, 10),
        author: activeRole.name,
        note: newVersionData.changeNote || 'Pembaruan revisi dokumen'
      };

      return {
        ...doc,
        version: newVersionData.version,
        effectiveDate: newVersionData.date || doc.effectiveDate,
        signedPdf: newVersionData.signedPdf !== undefined ? newVersionData.signedPdf : doc.signedPdf,
        status: 'under_review', // Reset to under review for auditor check
        history: [newHistoryItem, ...(doc.history || [])]
      };
    }));

    const targetDoc = documents.find(d => d.id === docId);
    logAudit('Mengunggah Revisi Versi Dokumen', `${targetDoc?.code || docId} ke ${newVersionData.version}`, 'info');
  };

  // Set Formal Verification Status (Approved, Observasi, NCR Mayor)
  const setVerificationStatus = (docId, status, findingsPayload = null) => {
    let targetDoc = null;
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      targetDoc = doc;
      return {
        ...doc,
        status
      };
    }));

    const docCode = targetDoc?.code || docId;

    if (status === 'approved') {
      logAudit('Memberikan Persetujuan (Approved)', `${docCode} lolos verifikasi ISO 21001`, 'success');
      // If there was an open finding for this doc, mark it closed
      setFindings(prev => prev.map(f => {
        if (f.docId === docId) {
          return { ...f, status: 'Closed', resolutionNotes: 'Telah diverifikasi dan disetujui auditor' };
        }
        return f;
      }));
    } else if (status === 'needs_revision') {
      logAudit('Menetapkan Status: NCR Mayor', `${docCode} - Memerlukan perbaikan mendasar`, 'danger');
      if (findingsPayload) {
        const newFinding = {
          id: 'FND-' + Date.now().toString().slice(-4),
          docId,
          code: docCode,
          clause: targetDoc?.clause || 'Klausul EOMS',
          pillarId: targetDoc?.pillarId || 1,
          type: findingsPayload.type || 'NCR Mayor',
          title: findingsPayload.title || 'Ketidaksesuaian Klausul Standar ISO 21001',
          description: findingsPayload.description || '',
          recommendation: findingsPayload.recommendation || '',
          auditor: activeRole.name,
          pic: targetDoc?.pic || 'PIC Mutu',
          dueDate: findingsPayload.dueDate || '2026-03-25',
          status: 'Open',
          resolutionNotes: ''
        };
        setFindings(prev => [newFinding, ...prev]);
      }
    } else if (status === 'under_review') {
      logAudit('Mengembalikan ke Status: Under Review', `${docCode} menunggu kelengkapan bukti`, 'warning');
    }
  };

  // Add Comment to Dialogue Hub
  const addDialogueMessage = (docId, messageData) => {
    const newMessage = {
      id: 'msg-' + Date.now(),
      authorRole: activeRole.badgeClass,
      authorName: activeRole.name,
      type: messageData.type || 'Komentar Verifikasi',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
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

  // Reset to default data
  const resetAllData = () => {
    if (window.confirm('Reset seluruh data repositori ke kondisi awal mock data S1 Teknik Informatika?')) {
      setDocuments(INITIAL_DOCUMENTS);
      setFindings(INITIAL_FINDINGS);
      setAuditTrail(INITIAL_AUDIT_TRAIL);
      localStorage.removeItem('prodidoc_documents');
      localStorage.removeItem('prodidoc_findings');
      localStorage.removeItem('prodidoc_audit_trail');
    }
  };

  // Calculate Metrics
  const totalDocs = documents.length;
  const approvedDocs = documents.filter(d => d.status === 'approved').length;
  const underReviewDocs = documents.filter(d => d.status === 'under_review').length;
  const needsRevisionDocs = documents.filter(d => d.status === 'needs_revision').length;

  const readinessScore = totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;

  // Per pillar calculation
  const pillarStats = INITIAL_PILLARS.map(pillar => {
    const pillarDocs = documents.filter(d => d.pillarId === pillar.id);
    const count = pillarDocs.length;
    const approved = pillarDocs.filter(d => d.status === 'approved').length;
    const review = pillarDocs.filter(d => d.status === 'under_review').length;
    const revision = pillarDocs.filter(d => d.status === 'needs_revision').length;
    const score = count > 0 ? Math.round((approved / count) * 100) : 0;

    return {
      ...pillar,
      total: count,
      approved,
      review,
      revision,
      score
    };
  });

  // Filtered documents
  const filteredDocuments = documents.filter(doc => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (
        doc.code.toLowerCase().includes(q) ||
        doc.title.toLowerCase().includes(q) ||
        doc.clause.toLowerCase().includes(q) ||
        doc.pic.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q)
      );
      if (!matchText) return false;
    }

    // Pillar filter
    if (selectedPillarFilter !== 'ALL') {
      if (doc.pillarId !== parseInt(selectedPillarFilter, 10)) return false;
    }

    // Status filter
    if (selectedStatusFilter !== 'ALL') {
      if (doc.status !== selectedStatusFilter) return false;
    }

    return true;
  });

  return (
    <DocumentContext.Provider value={{
      documents,
      filteredDocuments,
      findings,
      auditTrail,
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
      metrics: {
        totalDocs,
        approvedDocs,
        underReviewDocs,
        needsRevisionDocs,
        readinessScore,
        pillarStats
      },
      prodiInfo: PRODI_INFO,
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
