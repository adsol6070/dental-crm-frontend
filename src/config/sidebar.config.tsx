import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiClock,
  FiUserPlus,
  FiUserCheck,
  FiTrello,
  FiXCircle,
  FiDollarSign,
  FiBarChart,
  FiList,
  FiFileText,
  FiDownload,
} from "react-icons/fi";
import {
  FaUserMd,
  FaPrescriptionBottleAlt,
  FaHeartbeat,
  FaServicestack,
} from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";
import { ROUTES } from "@/config/route-paths.config";
import { useAuth, UserType } from "@/context/AuthContext";

// Patient-specific menu items
const patientMenuItems = [
  {
    label: "Dashboard",
    icon: <FiHome size="18" />,
    path: ROUTES.PATIENT.DASHBOARD,
  },
  {
    label: "My Appointments",
    icon: <FiCalendar size="18" />,
    path: ROUTES.PATIENT.APPOINTMENTS,
  },
  {
    label: "Medical History",
    icon: <FaHeartbeat size="18" />,
    path: ROUTES.PATIENT.MEDICAL_HISTORY,
  },
  // {
  //   label: "Prescriptions",
  //   icon: <FaPrescriptionBottleAlt size="18" />,
  //   path: ROUTES.PATIENT.PRESCRIPTIONS,
  // },
  // {
  //   label: "Billing",
  //   icon: <FiDollarSign size="18" />,
  //   path: ROUTES.PATIENT.BILLING,
  // },
  {
    label: "My Services",
    icon: <MdMedicalServices size="18" />,
    subMenu: [
      {
        label: "Services Taken",
        icon: <FiList size="16" />,
        path: ROUTES.PATIENT.SERVICES_TAKEN,
      },
      {
        label: "Available Services",
        icon: <FaServicestack size="16" />,
        path: ROUTES.PATIENT.AVAILABLE_SERVICES,
      },
      {
        label: "Download Report",
        icon: <FiDownload size="16" />,
        path: ROUTES.PATIENT.SERVICES_REPORT,
      },
    ],
  },
  {
    label: "Prescriptions",
    icon: <FaPrescriptionBottleAlt size="18" />,
    path: ROUTES.PATIENT.PRESCRIPTIONS,
  },
  {
    label: "Billing",
    icon: <FiDollarSign size="18" />,
    path: ROUTES.PATIENT.BILLING,
  },
];

// Doctor-specific menu items
const doctorMenuItems = [
  {
    label: "Dashboard",
    icon: <FiHome size="18" />,
    path: ROUTES.DOCTOR.DASHBOARD, // /doctor/dashboard
  },
  {
    label: "Analytics",
    icon: <FiBarChart size="18" />,
    path: ROUTES.DOCTOR.ANALYTICS, // /doctor/analytics
  },
  {
    label: "Schedule",
    icon: <FiClock size="18" />,
    path: ROUTES.DOCTOR.SCHEDULE, // /doctor/schedule
  },
  {
    label: "Unavailable Days",
    icon: <FiXCircle size="18" />,
    path: ROUTES.DOCTOR.UNAVAILABLE_DAYS, // /doctor/unavailable-days
  },
  {
    label: "Appointments",
    icon: <FiCalendar size="18" />,
    path: ROUTES.DOCTOR.APPOINTMENTS, // /doctor/appointments
  },
  {
    label: "My Patients",
    icon: <FiUsers size="18" />,
    path: ROUTES.DOCTOR.PATIENTS, // /doctor/patients
  },
  {
    label: "Services Management",
    icon: <MdMedicalServices size="18" />,
    subMenu: [
      {
        label: "Patient Services",
        icon: <FiList size="16" />,
        path: ROUTES.DOCTOR.PATIENT_SERVICES, // /doctor/patient-services
      },
      {
        label: "Generate Reports",
        icon: <FiFileText size="16" />,
        path: ROUTES.DOCTOR.SERVICE_REPORTS, // /doctor/service-reports
      },
      {
        label: "All Services",
        icon: <FaServicestack size="16" />,
        path: ROUTES.DOCTOR.ALL_SERVICES, // /doctor/all-services (view only)
      },
    ],
  },
  // {
  //   label: "Prescriptions",
  //   icon: <FaPrescriptionBottleAlt size="18" />,
  //   path: ROUTES.DOCTOR.PRESCRIPTIONS, // /doctor/prescriptions
  // },
  {
    label: "Fees & Pricing",
    icon: <FiDollarSign size="18" />,
    path: ROUTES.DOCTOR.FEES, // /doctor/fees
  },
  // {
  //   label: "Reviews & Ratings",
  //   icon: <FiStar size="18" />,
  //   path: ROUTES.DOCTOR.REVIEWS, // /doctor/reviews
  // },
  // {
  //   label: "Notifications",
  //   icon: <FiBell size="18" />,
  //   path: ROUTES.DOCTOR.NOTIFICATIONS, // /doctor/notifications
  //   badge: true, // Optional: for notification count
  // },
  // {
  //   label: "Settings",
  //   icon: <FiSettings size="18" />,
  //   subMenu: [
  //     {
  //       label: "Account Settings",
  //       icon: <FiUser size="16" />,
  //       path: ROUTES.DOCTOR.SETTINGS, // /doctor/settings
  //     },
  //     {
  //       label: "Change Password",
  //       icon: <FiShield size="16" />,
  //       path: ROUTES.DOCTOR.CHANGE_PASSWORD, // /doctor/settings/change-password
  //     },
  //     {
  //       label: "Account Management",
  //       icon: <FiDatabase size="16" />,
  //       path: ROUTES.DOCTOR.ACCOUNT_MANAGEMENT, // /doctor/settings/account
  //     },
  //   ],
  // },
];

// Admin-specific menu items
const adminMenuItems = [
  {
    label: "Dashboard",
    icon: <FiHome size="18" />,
    path: ROUTES.ADMIN.DASHBOARD,
  },
  {
    label: "User Management",
    icon: <FiUsers size="16" />,
    path: ROUTES.ADMIN.USER_MANAGEMENT,
  },
  {
    label: "Patient Management",
    icon: <FiUsers size="18" />,
    subMenu: [
      {
        label: "All Patients",
        icon: <FiUsers size="16" />,
        path: ROUTES.ADMIN.PATIENT_LIST,
      },
      {
        label: "Add New Patient",
        icon: <FiUserPlus size="16" />,
        path: ROUTES.ADMIN.CREATE_PATIENT,
      },
    ],
  },
  {
    label: "Doctor Management",
    icon: <FaUserMd size="18" />,
    subMenu: [
      {
        label: "All Doctors",
        icon: <FiUserCheck size="16" />,
        path: ROUTES.ADMIN.DOCTOR_LIST,
      },
      {
        label: "Add New Doctor",
        icon: <FiUserPlus size="16" />,
        path: ROUTES.ADMIN.CREATE_DOCTOR,
      },
    ],
  },
  {
    label: "Services Management",
    icon: <MdMedicalServices size="18" />,
    subMenu: [
      {
        label: "All Services",
        icon: <FiList size="16" />,
        path: ROUTES.ADMIN.SERVICES_LIST, // /admin/services
      },
      {
        label: "Add New Service",
        icon: <FiUserPlus size="16" />,
        path: ROUTES.ADMIN.CREATE_SERVICE, // /admin/services/create
      },
      {
        label: "Service Categories",
        icon: <FiTrello size="16" />,
        path: ROUTES.ADMIN.SERVICE_CATEGORIES, // /admin/service-categories
      },
      {
        label: "Patient Services",
        icon: <FiUsers size="16" />,
        path: ROUTES.ADMIN.PATIENT_SERVICES, // /admin/patient-services
      },
      {
        label: "Bulk Reports",
        icon: <FiDownload size="16" />,
        path: ROUTES.ADMIN.BULK_REPORTS, // /admin/bulk-reports
      },
    ],
  },
  {
    label: "Appointments",
    icon: <FiCalendar size="18" />,
    subMenu: [
      {
        label: "All Appointments",
        icon: <FiCalendar size="16" />,
        path: ROUTES.ADMIN.APPOINTMENT_LIST,
      },
      {
        label: "Schedule Appointment",
        icon: <FiClock size="16" />,
        path: ROUTES.ADMIN.CREATE_APPOINTMENT,
      },
      // {
      //   label: "Appointment Calendar",
      //   icon: <FiTrello size="16" />,
      //   path: ROUTES.ADMIN.APPOINTMENT_VIEW,
      // },
    ],
  },
  // {
  //   label: "Reports & Analytics",
  //   icon: <FiBarChart size="18" />,
  //   path: ROUTES.ADMIN.REPORTS,
  // },
  // {
  //   label: "System Management",
  //   icon: <FiShield size="18" />,
  //   subMenu: [
  //     {
  //       label: "User Management",
  //       icon: <FiUsers size="16" />,
  //       path: ROUTES.ADMIN.USER_MANAGEMENT,
  //     },
  //     {
  //       label: "System Settings",
  //       icon: <FiDatabase size="16" />,
  //       path: ROUTES.ADMIN.SYSTEM_SETTINGS,
  //     },
  //   ],
  // },
];

// Function to get sidebar menu items based on user type
export const getSidebarMenuItems = (userType: UserType) => {
  switch (userType) {
    case UserType.PATIENT:
      return patientMenuItems;
    case UserType.DOCTOR:
      return doctorMenuItems;
    case UserType.ADMIN:
      return adminMenuItems;
    default:
      return [];
  }
};

// Hook to get menu items based on current user
export const useSidebarMenuItems = () => {
  const { state } = useAuth();

  if (!state.user) return [];

  return getSidebarMenuItems(state.user.type);
};
