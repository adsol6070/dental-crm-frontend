// types/permissions.ts
export enum PermissionCategory {
  // Patient management
  PATIENTS_VIEW = "patients.view",
  PATIENTS_CREATE = "patients.create",
  PATIENTS_EDIT = "patients.edit",
  PATIENTS_DELETE = "patients.delete",
  PATIENTS_EXPORT = "patients.export",

  // Doctor management
  DOCTORS_VIEW = "doctors.view",
  DOCTORS_CREATE = "doctors.create",
  DOCTORS_EDIT = "doctors.edit",
  DOCTORS_DELETE = "doctors.delete",
  DOCTORS_VERIFY = "doctors.verify",
  DOCTORS_EXPORT = "doctors.export",

  // Appointment management
  APPOINTMENTS_VIEW = "appointments.view",
  APPOINTMENTS_CREATE = "appointments.create",
  APPOINTMENTS_EDIT = "appointments.edit",
  APPOINTMENTS_DELETE = "appointments.delete",
  APPOINTMENTS_RESCHEDULE = "appointments.reschedule",
  APPOINTMENTS_CANCEL = "appointments.cancel",
  APPOINTMENTS_EXPORT = "appointments.export",

  // Analytics and reports
  ANALYTICS_VIEW = "analytics.view",
  REPORTS_VIEW = "reports.view",
  REPORTS_EXPORT = "reports.export",
  REPORTS_CREATE = "reports.create",

  // System administration
  SYSTEM_SETTINGS = "system.settings",
  SYSTEM_USERS = "system.users",
  SYSTEM_LOGS = "system.logs",
  SYSTEM_BACKUP = "system.backup",
  SYSTEM_MAINTENANCE = "system.maintenance",

  // Notifications
  NOTIFICATIONS_SEND = "notifications.send",
  NOTIFICATIONS_MANAGE = "notifications.manage",
  NOTIFICATIONS_BULK = "notifications.bulk",

  // Financial
  PAYMENTS_VIEW = "payments.view",
  PAYMENTS_MANAGE = "payments.manage",
  INVOICES_VIEW = "invoices.view",
  INVOICES_CREATE = "invoices.create",
  INVOICES_EDIT = "invoices.edit",

  // Content management
  CONTENT_MANAGE = "content.manage",
  CONTENT_PUBLISH = "content.publish",

  // Security
  SECURITY_AUDIT = "security.audit",
  SECURITY_MANAGE = "security.manage",
}
