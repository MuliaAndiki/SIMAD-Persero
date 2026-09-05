/**
 * Helper utility untuk generate consistent titles untuk API responses.
 * Digunakan di semua service files untuk provide proper title & message.
 */

export const ResponseTitles = {
  // Generic Success
  created: 'Berhasil Dibuat',
  updated: 'Berhasil Diperbarui',
  deleted: 'Berhasil Dihapus',
  fetched: 'Berhasil Dimuat',
  success: 'Berhasil',
  
  // Generic Error
  error: 'Terjadi Kesalahan',
  failed: 'Gagal',
  
  // Auth
  auth: {
    registered: 'Pendaftaran Berhasil',
    loggedIn: 'Login Berhasil',
    loggedOut: 'Logout Berhasil',
    passwordChanged: 'Password Berhasil Diubah',
    emailChanged: 'Email Berhasil Diubah',
    emailVerified: 'Email Berhasil Diverifikasi',
    passwordReset: 'Password Berhasil Direset',
    tokenRefreshed: 'Sesi Diperpanjang',
    // Error states
    registerFailed: 'Gagal Mendaftar',
    loginFailed: 'Gagal Login',
  },
  
  // Application
  application: {
    created: 'Pengajuan Berhasil Dibuat',
    updated: 'Pengajuan Berhasil Diperbarui',
    submitted: 'Pengajuan Berhasil Dikirim',
    approved: 'Pengajuan Berhasil Disetujui',
    rejected: 'Pengajuan Ditolak',
    cancelled: 'Pengajuan Dibatalkan',
    deleted: 'Pengajuan Berhasil Dihapus',
    // Error states
    createFailed: 'Gagal Membuat Pengajuan',
    updateFailed: 'Gagal Memperbarui Draft',
    submitFailed: 'Gagal Mengirim Pengajuan',
    cancelFailed: 'Gagal Membatalkan Pengajuan',
    deleteFailed: 'Gagal Menghapus Draft',
    approveFailed: 'Gagal Menyetujui Pengajuan',
    rejectFailed: 'Gagal Menolak Pengajuan',
  },
  
  // Attendance
  attendance: {
    checkedIn: 'Check In Berhasil',
    checkedOut: 'Check Out Berhasil',
    overridden: 'Absensi Berhasil Di-override',
  },
  
  // Certificate
  certificate: {
    generated: 'Sertifikat Berhasil Dibuat',
    downloaded: 'Sertifikat Berhasil Diunduh',
  },
  
  // Department
  department: {
    created: 'Departemen Berhasil Dibuat',
    updated: 'Departemen Berhasil Diperbarui',
    deleted: 'Departemen Berhasil Dihapus',
    fetched: 'Daftar Departemen Dimuat',
  },
  
  // File
  file: {
    uploaded: 'File Berhasil Diunggah',
    deleted: 'File Berhasil Dihapus',
    downloaded: 'File Berhasil Diunduh',
  },
  
  // Institution
  institution: {
    created: 'Institusi Berhasil Dibuat',
    updated: 'Institusi Berhasil Diperbarui',
    deleted: 'Institusi Berhasil Dihapus',
    fetched: 'Daftar Institusi Dimuat',
  },
  
  // Internship
  internship: {
    created: 'Magang Berhasil Dibuat',
    started: 'Magang Berhasil Dimulai',
    completed: 'Magang Berhasil Diselesaikan',
    extended: 'Magang Berhasil Diperpanjang',
    archived: 'Magang Berhasil Diarsipkan',
    onboardingCompleted: 'Onboarding Berhasil Diselesaikan',
    supervisorAssigned: 'Supervisor Berhasil Ditugaskan',
    departmentTransferred: 'Departemen Berhasil Dipindahkan',
  },
  
  // Notification
  notification: {
    markedAsRead: 'Notifikasi Ditandai Dibaca',
    deleted: 'Notifikasi Dihapus',
  },
  
  // Office
  office: {
    created: 'Kantor Berhasil Dibuat',
    updated: 'Kantor Berhasil Diperbarui',
    deleted: 'Kantor Berhasil Dihapus',
    fetched: 'Daftar Kantor Dimuat',
  },
  
  // User/Profile
  user: {
    updated: 'Profil Berhasil Diperbarui',
    photoUploaded: 'Foto Berhasil Diunggah',
    accountDeleted: 'Akun Berhasil Dihapus',
  },
  
  // Skill
  skill: {
    created: 'Skill Berhasil Dibuat',
    updated: 'Skill Berhasil Diperbarui',
    deleted: 'Skill Berhasil Dihapus',
    added: 'Skill Berhasil Ditambahkan',
    removed: 'Skill Berhasil Dihapus dari Profil',
  },
} as const;
