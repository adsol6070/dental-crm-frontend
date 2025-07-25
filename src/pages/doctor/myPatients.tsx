import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import { 
  FiSearch,
  FiFilter,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiEye,
  FiEdit3,
  FiPlus,
  FiRefreshCw,
  FiDownload,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiGrid,
  FiList,
  FiHeart,
  FiActivity,
  FiAlertCircle,
  FiFileText,
  FiUsers,
  FiTrendingUp
} from "react-icons/fi";
import {useDoctorPatients, useDoctorPatientConsultationHistory} from "@/hooks/useDoctor";

// Types
interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  profilePicture?: string | null;
  lastVisit?: string | null;
  registeredDate: string;
  status: 'active' | 'inactive';
  address: string;
  needsFollowUp: boolean;
  totalVisits: number;
  conditions: string[];
  lastDiagnosis?: string | null;
}

interface ConsultationHistory {
  visits: Visit[];
  conditions: Condition[];
  medications: Medication[];
  allergies: string[];
  vitals: Vital[];
}

interface Visit {
  id: number;
  date: string;
  time: string;
  type: string;
  chiefComplaint: string;
  diagnosis: string;
  status: 'completed' | 'cancelled' | 'no-show';
}

interface Condition {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  diagnosedDate: string;
  notes: string;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  status: 'active' | 'inactive';
  startDate: string;
}

interface Vital {
  date: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
}

interface Filters {
  gender: 'all' | 'male' | 'female' | 'other';
  ageRange: 'all' | '0-18' | '19-35' | '36-55' | '56+';
  lastVisit: 'all' | 'last_week' | 'last_month' | 'last_3_months' | 'last_6_months' | 'over_6_months' | 'never';
  status: 'all' | 'active' | 'inactive';
}

interface PatientStats {
  total: number;
  newThisWeek: number;
  seenThisMonth: number;
  needFollowUp: number;
}

type SortBy = 'name_asc' | 'name_desc' | 'last_visit_desc' | 'last_visit_asc' | 'age_asc' | 'age_desc';
type ViewMode = 'cards' | 'table';
type ActiveTab = 'overview' | 'history' | 'appointments' | 'documents';
type PatientStatus = 'active' | 'inactive';
type StatusBadgeStatus = 'success' | 'warning' | 'danger';

// Theme colors matching your existing design
const theme = {
  colors: {
    primary: "#7c3aed",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827"
    }
  }
};

const PatientManagement: React.FC = () => {
  // API Hooks
  const { 
    data: patientsData, 
    isLoading: patientsLoading, 
    error: patientsError, 
    refetch: refetchPatients 
  } = useDoctorPatients();

  // State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [activeDetailTab, setActiveDetailTab] = useState<ActiveTab>('overview');
  
  // Filters
  const [filters, setFilters] = useState<Filters>({
    gender: 'all',
    ageRange: 'all',
    lastVisit: 'all',
    status: 'active'
  });
  
  const [sortBy, setSortBy] = useState<SortBy>('name_asc');

  // Patient consultation history hook
  const { 
    data: patientHistory, 
    isLoading: historyLoading, 
    refetch: refetchHistory 
  } = useDoctorPatientConsultationHistory(selectedPatient?.id || '');

  // FIXED: Transform API data to match component interface
  const patients: Patient[] = useMemo(() => {
    let rawPatients: any[] = [];
    
    // Handle different possible data structures
    if (Array.isArray(patientsData)) {
      rawPatients = patientsData;
    } else if (patientsData?.data?.patients && Array.isArray(patientsData.data.patients)) {
      rawPatients = patientsData.data.patients;
    } else if (patientsData?.data && Array.isArray(patientsData.data)) {
      rawPatients = patientsData.data;
    } else if (patientsData?.patients && Array.isArray(patientsData.patients)) {
      rawPatients = patientsData.patients;
    }

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth: string): number => {
      try {
        const birth = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age;
      } catch {
        return 0;
      }
    };

    // Transform the raw API data to match our Patient interface
    return rawPatients.map((rawPatient: any): Patient => {
      return {
        id: rawPatient._id || rawPatient.id || '',
        patientId: rawPatient.patientId || '',
        name: `${rawPatient.personalInfo?.firstName || ''} ${rawPatient.personalInfo?.lastName || ''}`.trim() || 'Unknown Patient',
        age: rawPatient.personalInfo?.dateOfBirth ? calculateAge(rawPatient.personalInfo.dateOfBirth) : 0,
        gender: rawPatient.personalInfo?.gender || 'other',
        phone: rawPatient.contactInfo?.phone || '',
        email: rawPatient.contactInfo?.email || '',
        profilePicture: rawPatient.personalInfo?.profilePicture || null,
        lastVisit: rawPatient.statistics?.lastVisit || null,
        registeredDate: rawPatient.createdAt || rawPatient.registeredDate || new Date().toISOString(),
        status: 'active', // Default to active since API doesn't seem to have this field
        address: rawPatient.contactInfo?.address ? 
          `${rawPatient.contactInfo.address.street || ''} ${rawPatient.contactInfo.address.city || ''} ${rawPatient.contactInfo.address.state || ''} ${rawPatient.contactInfo.address.zipCode || ''}`.trim() 
          : '',
        needsFollowUp: false, // Default value since API doesn't have this
        totalVisits: rawPatient.statistics?.totalAppointments || 0,
        conditions: rawPatient.medicalHistory?.conditions || [],
        lastDiagnosis: rawPatient.medicalHistory?.lastDiagnosis || null,
      };
    });
  }, [patientsData]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      // Search is handled in filteredAndSortedPatients memo
    }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch]);

  // Fixed: Filter and sort patients with safety checks
  const filteredAndSortedPatients = useMemo(() => {
    let filteredPatients = patients;

    // Apply search filter - FIXED: Remove minimum length requirement and add safety checks
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredPatients = filteredPatients.filter(patient => {
        // Add safety checks for undefined values
        const name = patient.name?.toLowerCase() || '';
        const phone = patient.phone || '';
        const email = patient.email?.toLowerCase() || '';
        const patientId = patient.patientId?.toLowerCase() || '';
        
        return name.includes(query) ||
               phone.includes(query) ||
               email.includes(query) ||
               patientId.includes(query);
      });
    }

    // Apply other filters with safety checks
    filteredPatients = filteredPatients.filter(patient => {
      // Add null/undefined checks
      if (!patient) return false;
      
      const matchesGender = filters.gender === 'all' || patient.gender === filters.gender;
      const matchesAgeRange = filters.ageRange === 'all' || checkAgeRange(patient.age || 0, filters.ageRange);
      const matchesLastVisit = filters.lastVisit === 'all' || checkLastVisit(patient.lastVisit, filters.lastVisit);
      const matchesStatus = filters.status === 'all' || patient.status === filters.status;
      
      return matchesGender && matchesAgeRange && matchesLastVisit && matchesStatus;
    });

    // Apply sorting with safety checks
    return filteredPatients.sort((a, b) => {
      if (!a || !b) return 0;
      
      switch (sortBy) {
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'last_visit_desc':
          return new Date(b.lastVisit || 0).getTime() - new Date(a.lastVisit || 0).getTime();
        case 'last_visit_asc':
          return new Date(a.lastVisit || 0).getTime() - new Date(b.lastVisit || 0).getTime();
        case 'age_asc':
          return (a.age || 0) - (b.age || 0);
        case 'age_desc':
          return (b.age || 0) - (a.age || 0);
        default:
          return 0;
      }
    });
  }, [patients, searchQuery, filters, sortBy]);

  // Log filtered results for debugging
  useEffect(() => {
    console.log("filteredAndSortedPatients length:", filteredAndSortedPatients.length);
    console.log("filteredAndSortedPatients:", filteredAndSortedPatients);
  }, [filteredAndSortedPatients]);

  // Fixed: Age range check with safety
  const checkAgeRange = (age: number, range: string): boolean => {
    const safeAge = age || 0;
    
    switch (range) {
      case '0-18': return safeAge <= 18;
      case '19-35': return safeAge >= 19 && safeAge <= 35;
      case '36-55': return safeAge >= 36 && safeAge <= 55;
      case '56+': return safeAge >= 56;
      default: return true;
    }
  };

  // Fixed: Last visit check with safety
  const checkLastVisit = (lastVisit: string | null | undefined, range: string): boolean => {
    if (!lastVisit || lastVisit === 'null' || lastVisit === 'undefined') {
      return range === 'never';
    }
    
    try {
      const visitDate = new Date(lastVisit);
      if (isNaN(visitDate.getTime())) {
        return range === 'never';
      }
      
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (range) {
        case 'last_week': return daysDiff <= 7;
        case 'last_month': return daysDiff <= 30;
        case 'last_3_months': return daysDiff <= 90;
        case 'last_6_months': return daysDiff <= 180;
        case 'over_6_months': return daysDiff > 180;
        case 'never': return false;
        default: return true;
      }
    } catch (error) {
      return range === 'never';
    }
  };

  const handlePatientSelect = (patient: Patient): void => {
    setSelectedPatient(patient);
    setActiveDetailTab('overview');
  };

  // Fixed: Patient stats with safety checks
  const patientStats: PatientStats = useMemo(() => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      total: patients.length,
      newThisWeek: patients.filter(p => {
        try {
          return p.registeredDate && new Date(p.registeredDate) > lastWeek;
        } catch {
          return false;
        }
      }).length,
      seenThisMonth: patients.filter(p => {
        try {
          return p.lastVisit && p.lastVisit !== 'null' && new Date(p.lastVisit) > lastMonth;
        } catch {
          return false;
        }
      }).length,
      needFollowUp: patients.filter(p => p.needsFollowUp === true).length
    };
  }, [patients]);

  // Fixed: PatientCard component with safety checks
  const PatientCard: React.FC<{
    patient: Patient;
    isSelected: boolean;
    onClick: () => void;
  }> = ({ patient, isSelected, onClick }) => {
    // Add safety checks for patient data
    if (!patient) return null;
    
    const safeName = patient.name || 'Unknown Patient';
    const safePatientId = patient.patientId || 'N/A';
    const safeAge = patient.age || 0;
    const safeGender = patient.gender || 'unknown';
    const safePhone = patient.phone || 'N/A';
    const safeEmail = patient.email || 'N/A';
    const safeAddress = patient.address || 'N/A';
    const safeConditions = patient.conditions || [];

    return (
      <PatientCardContainer selected={isSelected} onClick={onClick}>
        <PatientCardHeader>
          <PatientAvatar>
            <img 
              src={patient.profilePicture || 'https://avatar.iran.liara.run/public'} 
              alt={safeName}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="avatar-fallback">
              {safeName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <StatusIndicator status={patient.status || 'inactive'} />
            {patient.needsFollowUp && <FollowUpIndicator title="Needs Follow-up" />}
          </PatientAvatar>
          
          <PatientBasicInfo>
            <PatientName>{safeName}</PatientName>
            <PatientId>#{safePatientId}</PatientId>
            <PatientMeta>{safeAge} years • {safeGender}</PatientMeta>
          </PatientBasicInfo>
        </PatientCardHeader>

        <PatientCardContent>
          <ContactInfo>
            <ContactItem>
              <FiPhone size={12} />
              <span>{safePhone}</span>
            </ContactItem>
            <ContactItem>
              <FiMail size={12} />
              <span>{safeEmail}</span>
            </ContactItem>
            <ContactItem>
              <FiMapPin size={12} />
              <span>{safeAddress}</span>
            </ContactItem>
          </ContactInfo>

          <VisitInfo>
            <div className="last-visit">
              <strong>Last Visit:</strong> {patient.lastVisit && patient.lastVisit !== 'null' ? formatDate(patient.lastVisit) : 'Never'}
            </div>
            <div className="total-visits">
              <strong>Total Visits:</strong> {patient.totalVisits || 0}
            </div>
            {patient.lastDiagnosis && (
              <div className="last-diagnosis">
                <strong>Last Diagnosis:</strong> {patient.lastDiagnosis}
              </div>
            )}
          </VisitInfo>

          {safeConditions.length > 0 && (
            <ConditionsInfo>
              <strong>Conditions:</strong>
              <ConditionTags>
                {safeConditions.slice(0, 2).map((condition, index) => (
                  <ConditionTag key={index}>{condition}</ConditionTag>
                ))}
                {safeConditions.length > 2 && (
                  <ConditionTag>+{safeConditions.length - 2} more</ConditionTag>
                )}
              </ConditionTags>
            </ConditionsInfo>
          )}
        </PatientCardContent>

        <PatientCardActions>
          <ActionButton
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              // Schedule appointment
            }}
          >
            <FiCalendar size={14} />
            Schedule
          </ActionButton>
          <ActionButton
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              // Call patient
            }}
          >
            <FiPhone size={14} />
            Call
          </ActionButton>
        </PatientCardActions>
      </PatientCardContainer>
    );
  };

  const PatientDetailsPanel: React.FC = () => {
    if (!selectedPatient) {
      return (
        <EmptyPatientSelection>
          <EmptyIcon>
            <FiUsers size={64} />
          </EmptyIcon>
          <EmptyTitle>Select a patient to view details</EmptyTitle>
          <EmptyMessage>
            Choose a patient from the list to see their medical history, appointments, and contact information.
          </EmptyMessage>
        </EmptyPatientSelection>
      );
    }

    return (
      <PatientDetailContainer>
        <PatientDetailHeader>
          <PatientDetailBasicInfo>
            <PatientAvatarLarge>
              <img 
                src={selectedPatient.profilePicture || 'https://avatar.iran.liara.run/public'} 
                alt={selectedPatient.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="avatar-fallback">
                {(selectedPatient.name || '').split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            </PatientAvatarLarge>
            
            <PatientDetailInfo>
              <h2>{selectedPatient.name || 'Unknown Patient'}</h2>
              <p>Patient ID: #{selectedPatient.patientId || 'N/A'}</p>
              <p>{selectedPatient.age || 0} years • {selectedPatient.gender || 'unknown'}</p>
              <p>{selectedPatient.phone || 'N/A'} • {selectedPatient.email || 'N/A'}</p>
            </PatientDetailInfo>
          </PatientDetailBasicInfo>
          
          <PatientDetailActions>
            <ActionButton variant="primary">
              <FiCalendar size={16} />
              Schedule Appointment
            </ActionButton>
            <ActionButton variant="secondary">
              <FiPhone size={16} />
              Call Patient
            </ActionButton>
            <ActionButton variant="ghost" onClick={() => setSelectedPatient(null)}>
              <FiX size={16} />
            </ActionButton>
          </PatientDetailActions>
        </PatientDetailHeader>

        <PatientTabNavigation>
          <TabButton 
            active={activeDetailTab === 'overview'} 
            onClick={() => setActiveDetailTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton 
            active={activeDetailTab === 'history'} 
            onClick={() => setActiveDetailTab('history')}
          >
            Medical History
          </TabButton>
          <TabButton 
            active={activeDetailTab === 'appointments'} 
            onClick={() => setActiveDetailTab('appointments')}
          >
            Appointments
          </TabButton>
          <TabButton 
            active={activeDetailTab === 'documents'} 
            onClick={() => setActiveDetailTab('documents')}
          >
            Documents
          </TabButton>
        </PatientTabNavigation>

        <PatientTabContent>
          {activeDetailTab === 'overview' && <PatientOverviewTab patient={selectedPatient} />}
          {activeDetailTab === 'history' && (
            <PatientHistoryTab 
              history={patientHistory} 
              loading={historyLoading}
              onRefresh={refetchHistory}
            />
          )}
          {activeDetailTab === 'appointments' && <PatientAppointmentsTab patient={selectedPatient} />}
          {activeDetailTab === 'documents' && <PatientDocumentsTab patient={selectedPatient} />}
        </PatientTabContent>
      </PatientDetailContainer>
    );
  };

  const PatientOverviewTab: React.FC<{ patient: Patient }> = ({ patient }) => (
    <OverviewContent>
      <OverviewSection>
        <SectionTitle>Contact Information</SectionTitle>
        <InfoGrid>
          <InfoItem>
            <InfoLabel>Phone</InfoLabel>
            <InfoValue>{patient.phone || 'N/A'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Email</InfoLabel>
            <InfoValue>{patient.email || 'N/A'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Address</InfoLabel>
            <InfoValue>{patient.address || 'N/A'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Registered</InfoLabel>
            <InfoValue>{patient.registeredDate ? formatDate(patient.registeredDate) : 'N/A'}</InfoValue>
          </InfoItem>
        </InfoGrid>
      </OverviewSection>

      <OverviewSection>
        <SectionTitle>Medical Summary</SectionTitle>
        <InfoGrid>
          <InfoItem>
            <InfoLabel>Total Visits</InfoLabel>
            <InfoValue>{patient.totalVisits || 0}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Last Visit</InfoLabel>
            <InfoValue>{patient.lastVisit && patient.lastVisit !== 'null' ? formatDate(patient.lastVisit) : 'Never'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Known Conditions</InfoLabel>
            <InfoValue>{(patient.conditions || []).length}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Follow-up Required</InfoLabel>
            <InfoValue>
              <StatusBadge status={patient.needsFollowUp ? 'warning' : 'success'}>
                {patient.needsFollowUp ? 'Yes' : 'No'}
              </StatusBadge>
            </InfoValue>
          </InfoItem>
        </InfoGrid>
      </OverviewSection>

      {(patient.conditions || []).length > 0 && (
        <OverviewSection>
          <SectionTitle>Active Conditions</SectionTitle>
          <ConditionList>
            {(patient.conditions || []).map((condition, index) => (
              <ConditionItem key={index}>
                <ConditionName>{condition}</ConditionName>
                <ConditionStatus>Active</ConditionStatus>
              </ConditionItem>
            ))}
          </ConditionList>
        </OverviewSection>
      )}
    </OverviewContent>
  );

  const PatientHistoryTab: React.FC<{
    history: ConsultationHistory | undefined;
    loading: boolean;
    onRefresh: () => void;
  }> = ({ history, loading, onRefresh }) => {
    if (loading) {
      return (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading patient history...</LoadingText>
        </LoadingContainer>
      );
    }

    if (!history) {
      return (
        <EmptyHistoryState>
          <p>No medical history available for this patient.</p>
          <ActionButton variant="primary">Add First Consultation</ActionButton>
        </EmptyHistoryState>
      );
    }

    return (
      <HistoryContent>
        <HistoryHeader>
          <HistoryStats>
            <StatCard>
              <StatValue>{(history.visits || []).length}</StatValue>
              <StatLabel>Total Visits</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{(history.conditions || []).filter(c => c.status === 'active').length}</StatValue>
              <StatLabel>Active Conditions</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{(history.medications || []).filter(m => m.status === 'active').length}</StatValue>
              <StatLabel>Current Medications</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{(history.allergies || []).length}</StatValue>
              <StatLabel>Known Allergies</StatLabel>
            </StatCard>
          </HistoryStats>
          
          <ActionButton onClick={onRefresh}>
            <FiRefreshCw size={16} />
            Refresh
          </ActionButton>
        </HistoryHeader>

        <HistoryTimeline>
          <TimelineTitle>Recent Visits</TimelineTitle>
          {(history.visits || []).map(visit => (
            <TimelineItem key={visit.id}>
              <TimelineDate>{formatDate(visit.date)}</TimelineDate>
              <TimelineContent>
                <TimelineTitle>{visit.type}</TimelineTitle>
                <TimelineDescription>
                  <strong>Chief Complaint:</strong> {visit.chiefComplaint}
                </TimelineDescription>
                <TimelineDescription>
                  <strong>Diagnosis:</strong> {visit.diagnosis}
                </TimelineDescription>
              </TimelineContent>
            </TimelineItem>
          ))}
        </HistoryTimeline>
      </HistoryContent>
    );
  };

  const PatientAppointmentsTab: React.FC<{ patient: Patient }> = ({ patient }) => (
    <AppointmentsContent>
      <AppointmentsHeader>
        <h3>Appointments for {patient.name || 'Patient'}</h3>
        <ActionButton variant="primary">
          <FiPlus size={16} />
          Schedule New
        </ActionButton>
      </AppointmentsHeader>
      <p>Appointment history and scheduling will be displayed here.</p>
    </AppointmentsContent>
  );

  const PatientDocumentsTab: React.FC<{ patient: Patient }> = ({ patient }) => (
    <DocumentsContent>
      <DocumentsHeader>
        <h3>Documents for {patient.name || 'Patient'}</h3>
        <ActionButton variant="primary">
          <FiPlus size={16} />
          Upload Document
        </ActionButton>
      </DocumentsHeader>
      <p>Patient documents and files will be displayed here.</p>
    </DocumentsContent>
  );

  // Loading state
  if (patientsLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading patients...</LoadingText>
      </LoadingContainer>
    );
  }

  // Error state
  if (patientsError) {
    return (
      <ErrorContainer>
        <ErrorMessage>Failed to load patients. Please try again.</ErrorMessage>
        <ActionButton onClick={refetchPatients}>
          <FiRefreshCw size={16} />
          Retry
        </ActionButton>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            My Patients
            <TotalCount>({patientStats.total} total)</TotalCount>
          </Title>
          <Subtitle>Manage your patients and their medical records</Subtitle>
          
          <StatsContainer>
            <StatCard>
              <FiUsers size={16} />
              <StatValue>{patientStats.total}</StatValue>
              <StatLabel>Total Patients</StatLabel>
            </StatCard>
            <StatCard>
              <FiTrendingUp size={16} />
              <StatValue>{patientStats.newThisWeek}</StatValue>
              <StatLabel>New This Week</StatLabel>
            </StatCard>
            <StatCard>
              <FiActivity size={16} />
              <StatValue>{patientStats.seenThisMonth}</StatValue>
              <StatLabel>Seen This Month</StatLabel>
            </StatCard>
            <StatCard>
              <FiAlertCircle size={16} />
              <StatValue>{patientStats.needFollowUp}</StatValue>
              <StatLabel>Need Follow-up</StatLabel>
            </StatCard>
          </StatsContainer>
        </HeaderContent>
        
        <HeaderActions>
          <RefreshButton onClick={refetchPatients}>
            <FiRefreshCw size={16} />
            Refresh
          </RefreshButton>
          <ExportButton>
            <FiDownload size={16} />
            Export
          </ExportButton>
        </HeaderActions>
      </Header>

      <Content>
        <PatientListPanel>
          <SearchAndFilters>
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="Search patients by name, phone, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon>
                <FiSearch size={16} />
              </SearchIcon>
              {searchQuery && (
                <ClearSearchButton onClick={() => setSearchQuery('')}>
                  <FiX size={16} />
                </ClearSearchButton>
              )}
            </SearchContainer>

            <FilterControls>
              <ViewModeToggle>
                <ViewModeButton 
                  active={viewMode === 'cards'} 
                  onClick={() => setViewMode('cards')}
                >
                  <FiGrid size={16} />
                </ViewModeButton>
                <ViewModeButton 
                  active={viewMode === 'table'} 
                  onClick={() => setViewMode('table')}
                >
                  <FiList size={16} />
                </ViewModeButton>
              </ViewModeToggle>

              <SortSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
              >
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="last_visit_desc">Recent Visit First</option>
                <option value="last_visit_asc">Oldest Visit First</option>
                <option value="age_asc">Youngest First</option>
                <option value="age_desc">Oldest First</option>
              </SortSelect>

              <FilterButton onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                <FiFilter size={16} />
                Filters
                {showAdvancedFilters ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </FilterButton>
            </FilterControls>

            {showAdvancedFilters && (
              <AdvancedFilters>
                <FilterSelect
                  value={filters.gender}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value as Filters['gender'] }))}
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </FilterSelect>

                <FilterSelect
                  value={filters.ageRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, ageRange: e.target.value as Filters['ageRange'] }))}
                >
                  <option value="all">All Ages</option>
                  <option value="0-18">Children (0-18)</option>
                  <option value="19-35">Young Adults (19-35)</option>
                  <option value="36-55">Adults (36-55)</option>
                  <option value="56+">Seniors (56+)</option>
                </FilterSelect>

                <FilterSelect
                  value={filters.lastVisit}
                  onChange={(e) => setFilters(prev => ({ ...prev, lastVisit: e.target.value as Filters['lastVisit'] }))}
                >
                  <option value="all">Any Time</option>
                  <option value="last_week">Last Week</option>
                  <option value="last_month">Last Month</option>
                  <option value="last_3_months">Last 3 Months</option>
                  <option value="last_6_months">Last 6 Months</option>
                  <option value="over_6_months">Over 6 Months Ago</option>
                  <option value="never">Never Visited</option>
                </FilterSelect>

                <ClearFiltersButton onClick={() => setFilters({ gender: 'all', ageRange: 'all', lastVisit: 'all', status: 'active' })}>
                  Clear Filters
                </ClearFiltersButton>
              </AdvancedFilters>
            )}

            {searchQuery.trim() && (
              <SearchInfo>
                <span>Showing results for "{searchQuery}"</span>
                <ClearSearchButton onClick={() => setSearchQuery('')}>
                  Clear Search
                </ClearSearchButton>
              </SearchInfo>
            )}
          </SearchAndFilters>

          <PatientListContent>
            {filteredAndSortedPatients.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <FiUsers size={48} />
                </EmptyIcon>
                <EmptyTitle>
                  {searchQuery ? `No patients found for "${searchQuery}"` : "No patients found"}
                </EmptyTitle>
                <EmptyMessage>
                  {searchQuery 
                    ? "Try adjusting your search terms or filters"
                    : "No patients match the current filters"
                  }
                </EmptyMessage>
              </EmptyState>
            ) : (
              <>
                <ResultsInfo>
                  Showing {filteredAndSortedPatients.length} of {patients.length} patients
                  {searchQuery && ` matching "${searchQuery}"`}
                </ResultsInfo>
                
                {viewMode === 'cards' ? (
                  <PatientsGrid>
                    {filteredAndSortedPatients.map(patient => (
                      <PatientCard
                        key={patient.id}
                        patient={patient}
                        isSelected={selectedPatient?.id === patient.id}
                        onClick={() => handlePatientSelect(patient)}
                      />
                    ))}
                  </PatientsGrid>
                ) : (
                  <PatientsTable>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Patient</TableHeaderCell>
                        <TableHeaderCell>Age/Gender</TableHeaderCell>
                        <TableHeaderCell>Contact</TableHeaderCell>
                        <TableHeaderCell>Last Visit</TableHeaderCell>
                        <TableHeaderCell>Total Visits</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedPatients.map(patient => (
                        <TableRow 
                          key={patient.id}
                          selected={selectedPatient?.id === patient.id}
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <TableCell>
                            <TablePatientInfo>
                              <PatientAvatar small>
                                <img 
                                  src={patient.profilePicture || 'https://avatar.iran.liara.run/public'} 
                                  alt={patient.name || 'Patient'}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                                <div className="avatar-fallback">
                                  {(patient.name || '').split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                              </PatientAvatar>
                              <div>
                                <PatientName>{patient.name || 'Unknown Patient'}</PatientName>
                                <PatientId>#{patient.patientId || 'N/A'}</PatientId>
                              </div>
                            </TablePatientInfo>
                          </TableCell>
                          <TableCell>{patient.age || 0} • {patient.gender || 'unknown'}</TableCell>
                          <TableCell>
                            <div>{patient.phone || 'N/A'}</div>
                            <div style={{ fontSize: '12px', color: theme.colors.gray[500] }}>
                              {patient.email || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {patient.lastVisit && patient.lastVisit !== 'null' ? formatDate(patient.lastVisit) : 'Never'}
                          </TableCell>
                          <TableCell>{patient.totalVisits || 0}</TableCell>
                          <TableCell>
                            <StatusBadge status={patient.status === 'active' ? 'success' : 'danger'}>
                              {patient.status || 'inactive'}
                            </StatusBadge>
                            {patient.needsFollowUp && (
                              <FollowUpBadge>Follow-up</FollowUpBadge>
                            )}
                          </TableCell>
                          <TableCell>
                            <TableActions>
                              <ActionButton 
                                size="sm" 
                                variant="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Schedule appointment
                                }}
                              >
                                <FiCalendar size={12} />
                              </ActionButton>
                              <ActionButton 
                                size="sm" 
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Call patient
                                }}
                              >
                                <FiPhone size={12} />
                              </ActionButton>
                            </TableActions>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </PatientsTable>
                )}
              </>
            )}
          </PatientListContent>
        </PatientListPanel>

        <PatientDetailPanel>
          <PatientDetailsPanel />
        </PatientDetailPanel>
      </Content>
    </Container>
  );
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }) as T;
}

// Utility function for date formatting
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${theme.colors.gray[50]};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.gray[900]};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TotalCount = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${theme.colors.gray[500]};
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${theme.colors.gray[600]};
  margin: 0 0 24px 0;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 600px;
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${theme.colors.gray[100]};
  border-radius: 8px;
  color: ${theme.colors.gray[700]};
  
  svg {
    color: ${theme.colors.primary};
  }
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.gray[900]};
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray[600]};
  margin-top: 2px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid ${theme.colors.gray[300]};
  background: white;
  color: ${theme.colors.gray[700]};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.gray[50]};
    border-color: ${theme.colors.gray[400]};
  }
`;

const ExportButton = styled(RefreshButton)``;

const Content = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 0;
  overflow: hidden;
`;

const PatientListPanel = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid ${theme.colors.gray[200]};
`;

const SearchAndFilters = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.gray[500]};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.gray[400]};
`;

const ClearSearchButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  border: none;
  background: none;
  color: ${theme.colors.gray[400]};
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.gray[600]};
  }
`;

const FilterControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ViewModeToggle = styled.div`
  display: flex;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  overflow: hidden;
`;

const ViewModeButton = styled.button<{ active: boolean }>`
  padding: 8px 12px;
  border: none;
  background: ${props => props.active ? theme.colors.primary : 'white'};
  color: ${props => props.active ? 'white' : theme.colors.gray[600]};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? theme.colors.primary : theme.colors.gray[50]};
  }
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: ${theme.colors.gray[700]};
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid ${theme.colors.gray[300]};
  background: white;
  color: ${theme.colors.gray[700]};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.gray[50]};
  }
`;

const AdvancedFilters = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${theme.colors.gray[200]};
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: ${theme.colors.gray[700]};
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const ClearFiltersButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${theme.colors.gray[300]};
  background: white;
  color: ${theme.colors.gray[700]};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.gray[50]};
  }
`;

const SearchInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 8px 12px;
  background: ${theme.colors.gray[50]};
  border-radius: 6px;
  font-size: 14px;
  color: ${theme.colors.gray[600]};
`;

const PatientListContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ResultsInfo = styled.div`
  padding: 16px 24px;
  font-size: 14px;
  color: ${theme.colors.gray[600]};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const PatientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 24px;
`;

const PatientCardContainer = styled.div<{ selected: boolean }>`
  background: white;
  border: 2px solid ${props => props.selected ? theme.colors.primary : theme.colors.gray[200]};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

  &:hover {
    border-color: ${props => props.selected ? theme.colors.primary : theme.colors.gray[300]};
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const PatientCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const PatientAvatar = styled.div<{ small?: boolean }>`
  position: relative;
  width: ${props => props.small ? '40px' : '60px'};
  height: ${props => props.small ? '40px' : '60px'};
  border-radius: 50%;
  overflow: hidden;
  background: ${theme.colors.gray[200]};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-fallback {
    display: none;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    background: ${theme.colors.primary};
    color: white;
    font-weight: 600;
    font-size: ${props => props.small ? '14px' : '18px'};
  }
`;

const StatusIndicator = styled.div<{ status: PatientStatus }>`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.status === 'active' ? theme.colors.success : theme.colors.gray[400]};
  border: 2px solid white;
`;

const FollowUpIndicator = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${theme.colors.warning};
  border: 1px solid white;
`;

const PatientBasicInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 4px 0;
`;

const PatientId = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray[500]};
  margin-bottom: 4px;
`;

const PatientMeta = styled.div`
  font-size: 14px;
  color: ${theme.colors.gray[600]};
`;

const PatientCardContent = styled.div`
  margin-bottom: 16px;
`;

const ContactInfo = styled.div`
  margin-bottom: 12px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${theme.colors.gray[600]};
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const VisitInfo = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray[600]};
  margin-bottom: 12px;

  > div {
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const ConditionsInfo = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray[600]};
`;

const ConditionTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
`;

const ConditionTag = styled.span`
  padding: 2px 6px;
  background: ${theme.colors.gray[100]};
  color: ${theme.colors.gray[700]};
  border-radius: 4px;
  font-size: 10px;
`;

const PatientCardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ 
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: ${props => props.size === 'sm' ? '6px 8px' : '8px 12px'};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'primary': return theme.colors.primary;
      case 'ghost': return 'transparent';
      default: return theme.colors.gray[300];
    }
  }};
  background: ${props => {
    switch (props.variant) {
      case 'primary': return theme.colors.primary;
      case 'ghost': return 'transparent';
      default: return 'white';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'primary': return 'white';
      case 'ghost': return theme.colors.gray[600];
      default: return theme.colors.gray[700];
    }
  }};
  border-radius: 6px;
  font-size: ${props => props.size === 'sm' ? '12px' : '14px'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  justify-content: center;

  &:hover {
    background: ${props => {
      switch (props.variant) {
        case 'primary': return `${theme.colors.primary}dd`;
        case 'ghost': return theme.colors.gray[50];
        default: return theme.colors.gray[50];
      }
    }};
  }
`;

// Table Styles
const PatientsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: ${theme.colors.gray[50]};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const TableRow = styled.tr<{ selected?: boolean }>`
  background: ${props => props.selected ? `${theme.colors.primary}10` : 'white'};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.selected ? `${theme.colors.primary}20` : theme.colors.gray[50]};
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.gray[700]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: ${theme.colors.gray[900]};
`;

const TableBody = styled.tbody``;

const TablePatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TableActions = styled.div`
  display: flex;
  gap: 8px;
`;

const StatusBadge = styled.span<{ status: StatusBadgeStatus }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'success': return `${theme.colors.success}20`;
      case 'warning': return `${theme.colors.warning}20`;
      case 'danger': return `${theme.colors.danger}20`;
      default: return theme.colors.gray[100];
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'danger': return theme.colors.danger;
      default: return theme.colors.gray[700];
    }
  }};
`;

const FollowUpBadge = styled.span`
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${theme.colors.warning}20;
  color: ${theme.colors.warning};
  margin-left: 4px;
`;

// Patient Detail Panel Styles
const PatientDetailPanel = styled.div`
  background: white;
  overflow-y: auto;
`;

const EmptyPatientSelection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  color: ${theme.colors.gray[300]};
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.gray[600]};
  margin: 0 0 24px 0;
  max-width: 300px;
  line-height: 1.5;
`;

const PatientDetailContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const PatientDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const PatientDetailBasicInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PatientAvatarLarge = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: ${theme.colors.gray[200]};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-fallback {
    display: none;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    background: ${theme.colors.primary};
    color: white;
    font-weight: 600;
    font-size: 24px;
  }
`;

const PatientDetailInfo = styled.div`
  h2 {
    font-size: 24px;
    font-weight: 700;
    color: ${theme.colors.gray[900]};
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: ${theme.colors.gray[600]};
    margin: 0 0 4px 0;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const PatientDetailActions = styled.div`
  display: flex;
  gap: 12px;
`;

const PatientTabNavigation = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  background: ${theme.colors.gray[50]};
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 16px 20px;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? theme.colors.primary : theme.colors.gray[600]};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? 'white' : theme.colors.gray[100]};
    color: ${props => props.active ? theme.colors.primary : theme.colors.gray[700]};
  }
`;

const PatientTabContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

// Overview Tab Styles
const OverviewContent = styled.div`
  padding: 24px;
`;

const OverviewSection = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 16px 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const InfoItem = styled.div``;

const InfoLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.gray[500]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: ${theme.colors.gray[900]};
  font-weight: 500;
`;

const ConditionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ConditionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: ${theme.colors.gray[50]};
  border-radius: 8px;
`;

const ConditionName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.gray[900]};
`;

const ConditionStatus = styled.div`
  font-size: 12px;
  color: ${theme.colors.success};
  font-weight: 500;
`;

// History Tab Styles
const HistoryContent = styled.div`
  padding: 24px;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
`;

const HistoryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  flex: 1;
  margin-right: 24px;
`;

const HistoryTimeline = styled.div``;

const TimelineTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 16px 0;
`;

const TimelineItem = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${theme.colors.gray[200]};

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const TimelineDate = styled.div`
  flex-shrink: 0;
  width: 80px;
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.gray[500]};
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineDescription = styled.div`
  font-size: 14px;
  color: ${theme.colors.gray[700]};
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

// Loading and Error States
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
`;

const LoadingSpinner = styled.div<{ size?: 'small' | 'medium' }>`
  width: ${props => props.size === 'small' ? '16px' : '32px'};
  height: ${props => props.size === 'small' ? '16px' : '32px'};
  border: 2px solid ${theme.colors.gray[200]};
  border-top: 2px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 14px;
  color: ${theme.colors.gray[600]};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 16px;
`;

const ErrorMessage = styled.div`
  font-size: 16px;
  color: ${theme.colors.danger};
  text-align: center;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
`;

const EmptyHistoryState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;

  p {
    font-size: 16px;
    color: ${theme.colors.gray[600]};
    margin: 0 0 24px 0;
  }
`;

// Appointments and Documents Tab Styles
const AppointmentsContent = styled.div`
  padding: 24px;
`;

const AppointmentsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${theme.colors.gray[900]};
    margin: 0;
  }
`;

const DocumentsContent = styled.div`
  padding: 24px;
`;

const DocumentsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${theme.colors.gray[900]};
    margin: 0;
  }
`;

export default PatientManagement;