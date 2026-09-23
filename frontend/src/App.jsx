import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DocumentProvider, useDocument } from './context/DocumentContext';
import Header from './components/layout/Header';
import RoleBanner from './components/layout/RoleBanner';

// Dashboard components
import KPICards from './components/dashboard/KPICards';
import PillarProgressMatrix from './components/dashboard/PillarProgressMatrix';
import CriticalActionItems from './components/dashboard/CriticalActionItems';
import AuditTrailFeed from './components/dashboard/AuditTrailFeed';

// File Manager & Checklist components
import FolderTreeExplorer from './components/filemanager/FolderTreeExplorer';
import ChecklistMatrix30 from './components/checklist/ChecklistMatrix30';
import PerangkatPerkuliahanGrid from './components/checklist/PerangkatPerkuliahanGrid';
import FileUploadModal from './components/filemanager/FileUploadModal';
import FilePreviewModal from './components/filemanager/FilePreviewModal';
import GoogleDriveImporter from './components/filemanager/GoogleDriveImporter';

// Verification components
import VerificationWorkspace from './components/verification/VerificationWorkspace';

// Report components
import ExecutiveAuditReport from './components/report/ExecutiveAuditReport';

function AppContent() {
  const { activeTab, setActiveTab, selectedDept, setSelectedDept } = useDocument();
  const { currentRole } = useAuth();

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadContext, setUploadContext] = useState(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDocId, setPreviewDocId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenUpload = (context = {}) => {
    setUploadContext(context);
    setIsUploadModalOpen(true);
  };

  const handleOpenPreview = (doc) => {
    if (!doc) return;
    setPreviewDocId(doc.id);
    setIsPreviewModalOpen(true);
  };

  const handleDataRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      <Header />
      <RoleBanner />

      <main className="main-content">
        {/* Tab 1: Dashboard Kesiapan */}
        {activeTab === 'dashboard' && (
          <div>
            <KPICards />
            <div className="grid-dashboard-main">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <PillarProgressMatrix />
                <CriticalActionItems />
              </div>
              <div>
                <AuditTrailFeed />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tree Explorer & Manajemen Berkas */}
        {activeTab === 'file_explorer' && (
          <FolderTreeExplorer
            key={`tree-${refreshTrigger}-${selectedDept}`}
            onOpenUpload={handleOpenUpload}
            onOpenPreview={handleOpenPreview}
            activeRole={currentRole}
            selectedDept={selectedDept}
            onSelectDept={setSelectedDept}
            onDataRefresh={handleDataRefresh}
          />
        )}

        {/* Tab 3: Checklist Poin 7 FT (30 Item) */}
        {activeTab === 'checklist_ft' && (
          <ChecklistMatrix30
            key={`checklist-${refreshTrigger}-${selectedDept}`}
            onOpenUpload={handleOpenUpload}
            onOpenPreview={handleOpenPreview}
            activeRole={currentRole}
            selectedDept={selectedDept}
          />
        )}

        {/* Tab 4: Perangkat Perkuliahan (Per-MK Grid) */}
        {activeTab === 'perangkat_mk' && (
          <PerangkatPerkuliahanGrid
            key={`perangkat-${refreshTrigger}-${selectedDept}`}
            onOpenUpload={handleOpenUpload}
            onOpenPreview={handleOpenPreview}
            activeRole={currentRole}
            selectedDept={selectedDept}
            onSelectDept={setSelectedDept}
            onDataRefresh={handleDataRefresh}
          />
        )}

        {/* Tab: Import Google Drive */}
        {activeTab === 'gdrive_import' && (
          <GoogleDriveImporter
            activeRole={currentRole}
            onRefreshData={handleDataRefresh}
          />
        )}

        {/* Tab 5: Lembar Verifikasi & NCR */}
        {activeTab === 'verification' && (
          <VerificationWorkspace
            onOpenRevision={(doc) => handleOpenUpload({ item: doc })}
            onOpenHistory={(doc) => handleOpenPreview(doc)}
          />
        )}

        {/* Tab 6: Laporan Kesiapan Resmi */}
        {activeTab === 'report' && (
          <ExecutiveAuditReport
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* Global Modals */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        uploadContext={uploadContext}
        activeRole={currentRole}
        onSuccess={handleDataRefresh}
      />

      <FilePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        documentId={previewDocId}
        activeRole={currentRole}
        onRefresh={handleDataRefresh}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DocumentProvider>
        <AppContent />
      </DocumentProvider>
    </AuthProvider>
  );
}
