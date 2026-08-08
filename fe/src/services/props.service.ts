import applicationService from '@/services/api/application.service';
import attendanceService from '@/services/api/attendance.service';
import auditLogService from '@/services/api/auditLog.service';
import authService from '@/services/api/auth.service';
import certificateService from '@/services/api/certificate.service';
import dashboardService from '@/services/api/dashboard.service';
import departmentService from '@/services/api/department.service';
import fileService from '@/services/api/file.service';
import internshipService from '@/services/api/internship.service';
import notificationService from '@/services/api/notification.service';
import officeService from '@/services/api/office.service';
import reportingService from '@/services/api/reporting.service';
import supervisorService from '@/services/api/supervisor.service';
import userService from '@/services/api/user.service';
import { WrapApi } from '@/utils/wrapApi';

// list Api
// biome-ignore lint/complexity/noStaticOnlyClass: Singleton pattern grouping APIs
class Api {
  static Auth = WrapApi(authService);
  static Department = WrapApi(departmentService);
  static Office = WrapApi(officeService);
  static User = WrapApi(userService);
  static File = WrapApi(fileService);
  static Application = WrapApi(applicationService);
  static Internship = WrapApi(internshipService);
  static Attendance = WrapApi(attendanceService);
  static Certificate = WrapApi(certificateService);
  static Notification = WrapApi(notificationService);
  static Supervisor = WrapApi(supervisorService);
  static Reporting = WrapApi(reportingService);
  static AuditLog = WrapApi(auditLogService);
  static Dashboard = WrapApi(dashboardService);
}

export default Api;
