// API client for ISO 21001 Laravel Backend

const API_BASE = '/api/v1';

export const api = {
  // Dashboard & Metrics
  async getDashboard(dept = 'TIND') {
    const res = await fetch(`${API_BASE}/dashboard?department=${dept}`);
    if (!res.ok) throw new Error('Gagal mengambil data dashboard');
    return res.json();
  },

  // 30 Items Checklist
  async getChecklist(dept = 'TIND') {
    const res = await fetch(`${API_BASE}/checklist?department=${dept}`);
    if (!res.ok) throw new Error('Gagal mengambil data checklist');
    return res.json();
  },

  async updateChecklistStatus(id, { status, notes, course_id }) {
    const res = await fetch(`${API_BASE}/checklist/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes, course_id }),
    });
    if (!res.ok) throw new Error('Gagal memperbarui status dokumen');
    return res.json();
  },

  // Course Perangkat Matrix
  async getCoursePerangkatMatrix(dept = 'TIND') {
    const res = await fetch(`${API_BASE}/courses/perangkat-matrix?department=${dept}`);
    if (!res.ok) throw new Error('Gagal mengambil matriks perangkat perkuliahan');
    return res.json();
  },

  async toggleCoursePracticum(courseId) {
    const res = await fetch(`${API_BASE}/courses/${courseId}/toggle-practicum`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Gagal mengubah status praktikum mata kuliah');
    return res.json();
  },

  // Course CRUD Operations
  async createCourse(payload) {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Gagal menambahkan mata kuliah baru');
    }
    return data;
  },

  async getCourse(courseId) {
    const res = await fetch(`${API_BASE}/courses/${courseId}`);
    if (!res.ok) throw new Error('Gagal mengambil rincian data mata kuliah');
    return res.json();
  },

  async updateCourse(courseId, payload) {
    const res = await fetch(`${API_BASE}/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Gagal memperbarui data mata kuliah');
    }
    return data;
  },

  async deleteCourse(courseId) {
    const res = await fetch(`${API_BASE}/courses/${courseId}`, {
      method: 'DELETE',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Gagal menghapus mata kuliah');
    }
    return data;
  },

  // Folder Hierarchy
  async getFolderTree(dept = 'TIF') {
    const res = await fetch(`${API_BASE}/folders/tree?department=${dept}`);
    if (!res.ok) throw new Error('Gagal mengambil pohon direktori');
    return res.json();
  },

  async scaffoldFolders(dept = 'TIF') {
    const res = await fetch(`${API_BASE}/folders/scaffold?department=${dept}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Gagal melakukan scaffolding folder');
    return res.json();
  },

  // Document Operations
  async uploadDocument(formData) {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal mengunggah berkas');
    }
    return res.json();
  },

  async getDocumentDetails(id) {
    const res = await fetch(`${API_BASE}/documents/${id}`);
    if (!res.ok) throw new Error('Gagal mengambil rincian dokumen');
    return res.json();
  },

  getDocumentDownloadUrl(id) {
    return `${API_BASE}/documents/${id}/download`;
  },

  async deleteDocument(id) {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Gagal menghapus berkas');
    return res.json();
  },

  // Verification & Audit
  async verifyDocument(id, payload) {
    const res = await fetch(`${API_BASE}/documents/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Gagal memverifikasi dokumen');
    return res.json();
  },

  async addAuditComment(id, payload) {
    const res = await fetch(`${API_BASE}/documents/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Gagal mengirim catatan audit');
    return res.json();
  },

  async getFindings() {
    const res = await fetch(`${API_BASE}/audit/findings`);
    if (!res.ok) throw new Error('Gagal mengambil matriks temuan');
    return res.json();
  },

  // Google Drive Integration & Bulk Importer
  async uploadDriveLink(payload) {
    const res = await fetch(`${API_BASE}/documents/upload-drive-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal menautkan link Google Drive');
    }
    return res.json();
  },

  async parseSpreadsheet(payload) {
    const res = await fetch(`${API_BASE}/documents/parse-spreadsheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal memproses spreadsheet');
    }
    return res.json();
  },

  async bulkImportDrive(payload) {
    const res = await fetch(`${API_BASE}/documents/bulk-import-drive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal melakukan impor massal Google Drive');
    }
    return res.json();
  },

  async syncGitRepo(dept = 'TIF') {
    const res = await fetch(`${API_BASE}/documents/sync-git-repo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department_code: dept }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal menyinkronkan ke repositori Git');
    }
    return res.json();
  },

  // Bulk ZIP Export
  getZipExportUrl({ rootFolder, courseId, dept = 'TIND' } = {}) {
    let url = `${API_BASE}/export/zip?department=${dept}`;
    if (rootFolder) url += `&root_folder=${encodeURIComponent(rootFolder)}`;
    if (courseId) url += `&course_id=${encodeURIComponent(courseId)}`;
    return url;
  },
};
