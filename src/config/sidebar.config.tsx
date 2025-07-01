import { 
  FiHome, 
  FiCalendar, 
  FiUsers, 
  FiUser, 
  FiClock, 
  FiCheckSquare,
  FiUserPlus,
  FiFileText,
  FiActivity,
  FiSettings,
  FiCreditCard,
  FiBarChart,
  FiTrello,
  FiMessageSquare
} from "react-icons/fi";
import { ROUTES } from "@/config/route-paths.config";

export const sidebarMenuItems = [
  {
    label: "Dashboard",
    icon: <FiHome size="18" />,
    path: ROUTES.PRIVATE.DASHBOARD,
  },
  {
    label: "Appointment",
    icon: <FiCalendar size="18" />,
    subMenu: [
      {
        label: "All Appointments",
        icon: <FiCalendar size="16" />,
        // path: ROUTES.PRIVATE.APPOINTMENTS.LIST,
      },
      {
        label: "Schedule Appointment",
        icon: <FiClock size="16" />,
        // path: ROUTES.PRIVATE.APPOINTMENTS.CREATE,
      },
      {
        label: "Appointment Calendar",
        icon: <FiTrello size="16" />,
        // path: ROUTES.PRIVATE.APPOINTMENTS.CALENDAR,
      },
      {
        label: "Treatment Plans",
        icon: <FiCheckSquare size="16" />,
        // path: ROUTES.PRIVATE.APPOINTMENTS.TREATMENTS,
      },
      {
        label: "Appointment History",
        icon: <FiActivity size="16" />,
        // path: ROUTES.PRIVATE.APPOINTMENTS.HISTORY,
      },
    ],
  },
  {
    label: "Patient",
    icon: <FiUsers size="18" />,
    subMenu: [
      {
        label: "All Patients",
        icon: <FiUsers size="16" />,
        // path: ROUTES.PRIVATE.PATIENTS.LIST,
      },
      {
        label: "Add New Patient",
        icon: <FiUserPlus size="16" />,
        // path: ROUTES.PRIVATE.PATIENTS.CREATE,
      },
      {
        label: "Patient Records",
        icon: <FiFileText size="16" />,
        // path: ROUTES.PRIVATE.PATIENTS.RECORDS,
      },
      {
        label: "Medical History",
        icon: <FiActivity size="16" />,
        // path: ROUTES.PRIVATE.PATIENTS.MEDICAL_HISTORY,
      },
      {
        label: "Patient Communications",
        icon: <FiMessageSquare size="16" />,
        // path: ROUTES.PRIVATE.PATIENTS.COMMUNICATIONS,
      },
    ],
  },
  {
    label: "Billing & Payments",
    icon: <FiCreditCard size="18" />,
    subMenu: [
      {
        label: "Invoices",
        icon: <FiFileText size="16" />,
        // path: ROUTES.PRIVATE.BILLING.INVOICES,
      },
      {
        label: "Payments",
        icon: <FiCreditCard size="16" />,
        // path: ROUTES.PRIVATE.BILLING.PAYMENTS,
      },
      {
        label: "Insurance Claims",
        icon: <FiCheckSquare size="16" />,
        // path: ROUTES.PRIVATE.BILLING.INSURANCE,
      },
    ],
  },
  {
    label: "Reports & Analytics",
    icon: <FiBarChart size="18" />,
    subMenu: [
      {
        label: "Practice Analytics",
        icon: <FiBarChart size="16" />,
        // path: ROUTES.PRIVATE.REPORTS.ANALYTICS,
      },
      {
        label: "Financial Reports",
        icon: <FiCreditCard size="16" />,
        // path: ROUTES.PRIVATE.REPORTS.FINANCIAL,
      },
      {
        label: "Patient Reports",
        icon: <FiUsers size="16" />,
        // path: ROUTES.PRIVATE.REPORTS.PATIENTS,
      },
    ],
  },
  {
    label: "Settings",
    icon: <FiSettings size="18" />,
    subMenu: [
      {
        label: "Practice Settings",
        icon: <FiSettings size="16" />,
        // path: ROUTES.PRIVATE.SETTINGS.PRACTICE,
      },
      {
        label: "User",
        icon: <FiUser size="16" />,
        // path: ROUTES.PRIVATE.SETTINGS.USERS,
      },
      {
        label: "System Preferences",
        icon: <FiSettings size="16" />,
        // path: ROUTES.PRIVATE.SETTINGS.SYSTEM,
      },
    ],
  },
];