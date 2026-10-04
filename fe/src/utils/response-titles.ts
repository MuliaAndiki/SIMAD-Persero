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
    loggedIn: 'Masuk Berhasil',
    loggedOut: 'Keluar Berhasil',
    passwordChanged: 'Kata Sandi Berhasil Diubah',
    emailChanged: 'Surel Berhasil Diubah',
    emailVerified: 'Surel Berhasil Diverifikasi',
    passwordReset: 'Kata Sandi Berhasil Direset',
    tokenRefreshed: 'Sesi Diperpanjang',
    // Error states
    registerFailed: 'Gagal Mendaftar',
    loginFailed: 'Gagal Masuk',
  },

  // Application
  application: {
    created: 'Pengajuan Berhasil Dibuat',
    updated: 'Pengajuan   Berhasil Diperbarui',
    submitted: 'Pengajuan Berhasil Dikirim',
    approved: 'Pengajuan Berhasil Disetujui',
    rejected: 'Pengajuan Ditolak',
    cancelled: 'Pengajuan Dibatalkan',
    deleted: 'Pengajuan Berhasil Dihapus',
    // Error states
    createFailed: 'Gagal Membuat Pengajuan',
    updateFailed: 'Gagal Memperbarui Draf',
    submitFailed: 'Gagal Mengirim Pengajuan',
    cancelFailed: 'Gagal Membatalkan Pengajuan',
    deleteFailed: 'Gagal Menghapus Draf',
    approveFailed: 'Gagal Menyetujui Pengajuan',
    rejectFailed: 'Gagal Menolak Pengajuan',
  },

  // Attendance
  attendance: {
    checkedIn: 'Masuk Berhasil',
    checkedOut: 'Pulang Berhasil',
    overridden: 'Absensi Berhasil Disesuaikan',
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
    uploaded: 'Berkas Berhasil Diunggah',
    deleted: 'Berkas Berhasil Dihapus',
    downloaded: 'Berkas Berhasil Diunduh',
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
    onboardingCompleted: 'Orientasi Berhasil Diselesaikan',
    supervisorAssigned: 'Mentor Berhasil Ditugaskan',
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
    created: 'Keterampilan Berhasil Dibuat',
    updated: 'Keterampilan Berhasil Diperbarui',
    deleted: 'Keterampilan Berhasil Dihapus',
    added: 'Keterampilan Berhasil Ditambahkan',
    removed: 'Keterampilan Berhasil Dihapus dari Profil',
  },
} as const;
