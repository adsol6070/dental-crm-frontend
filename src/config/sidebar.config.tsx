import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiUser,
  FiClock,
  FiUserPlus,
  FiUserCheck,
  FiSettings,
  FiTrello,
  FiBell,
  FiStar,
  FiXCircle,
  FiDollarSign,
  FiActivity,
  FiBarChart,
  FiShield,
  FiDatabase,
} from "react-icons/fi";
import { FaUserMd, FaPrescriptionBottleAlt, FaHeartbeat } from "react-icons/fa";
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
    path: ROUTES.DOCTOR.APPOINTMENTS, // /doctor/unavailable-days
  },
  {
    label: "My Patients",
    icon: <FiUsers size="18" />,
    path: ROUTES.DOCTOR.PATIENTS, // /doctor/patients
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
  {
    label: "Reviews & Ratings",
    icon: <FiStar size="18" />,
    path: ROUTES.DOCTOR.REVIEWS, // /doctor/reviews
  },
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
  {
    label: "Reports & Analytics",
    icon: <FiBarChart size="18" />,
    path: ROUTES.ADMIN.REPORTS,
  },
  {
    label: "User Management",
    icon: <FiUsers size="16" />,
    path: ROUTES.ADMIN.USER_MANAGEMENT,
  },
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
