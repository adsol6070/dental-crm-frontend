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
  FiTrendingUp,
  FiMoreVertical
} from "react-icons/fi";
import {useDoctorPatients, useDoctorPatientConsultationHistory} from "@/hooks/useDoctor";

// Types (keeping all your existing types)
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

// Compact, professional color palette
const theme = {
  colors: {
    primary: "#2563eb",
    primaryLight: "#3b82f6",
    primaryDark: "#1d4ed8",
    success: "#059669",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#0891b2",
    white: "#ffffff",
    gray: {
      25: "#fefefe",
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
  },
  shadows: {
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem"
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem"
  }
};

const PatientManagement: React.FC = () => {
  // API Hooks (keeping your existing hooks)
  const { 
    data: patientsData, 
    isLoading: patientsLoading, 
    error: patientsError, 
    refetch: refetchPatients 
  } = useDoctorPatients();

  // State (keeping your existing state)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [activeDetailTab, setActiveDetailTab] = useState<ActiveTab>('overview');
  
  const [filters, setFilters] = useState<Filters>({
    gender: 'all',
    ageRange: 'all',
    lastVisit: 'all',
    status: 'active'
  });
  
  const [sortBy, setSortBy] = useState<SortBy>('name_asc');

  const { 
    data: patientHistory, 
    isLoading: historyLoading, 
    refetch: refetchHistory 
  } = useDoctorPatientConsultationHistory(selectedPatient?.id || '');

  // Data transformation (keeping your existing logic)
  const patients: Patient[] = useMemo(() => {
    let rawPatients: any[] = [];
    
    if (Array.isArray(patientsData)) {
      rawPatients = patientsData;
    } else if (patientsData?.data?.patients && Array.isArray(patientsData.data.patients)) {
      rawPatients = patientsData.data.patients;
    } else if (patientsData?.data && Array.isArray(patientsData.data)) {
      rawPatients = patientsData.data;
    } else if (patientsData?.patients && Array.isArray(patientsData.patients)) {
      rawPatients = patientsData.patients;
    }

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
        status: 'active',
        address: rawPatient.contactInfo?.address ? 
          `${rawPatient.contactInfo.address.street || ''} ${rawPatient.contactInfo.address.city || ''} ${rawPatient.contactInfo.address.state || ''} ${rawPatient.contactInfo.address.zipCode || ''}`.trim() 
          : '',
        needsFollowUp: false,
        totalVisits: rawPatient.statistics?.totalAppointments || 0,
        conditions: rawPatient.medicalHistory?.conditions || [],
        lastDiagnosis: rawPatient.medicalHistory?.lastDiagnosis || null,
      };
    });
  }, [patientsData]);

  // Utility functions (keeping your existing utility functions)
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

  const filteredAndSortedPatients = useMemo(() => {
    let filteredPatients = patients;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredPatients = filteredPatients.filter(patient => {
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

    filteredPatients = filteredPatients.filter(patient => {
      if (!patient) return false;
      
      const matchesGender = filters.gender === 'all' || patient.gender === filters.gender;
      const matchesAgeRange = filters.ageRange === 'all' || checkAgeRange(patient.age || 0, filters.ageRange);
      const matchesLastVisit = filters.lastVisit === 'all' || checkLastVisit(patient.lastVisit, filters.lastVisit);
      const matchesStatus = filters.status === 'all' || patient.status === filters.status;
      
      return matchesGender && matchesAgeRange && matchesLastVisit && matchesStatus;
    });

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

  // Compact Patient Card Component
  const PatientCard: React.FC<{
    patient: Patient;
    isSelected: boolean;
    onClick: () => void;
  }> = ({ patient, isSelected, onClick }) => {
    if (!patient) return null;
    
    const safeName = patient.name || 'Unknown Patient';
    const safePatientId = patient.patientId || 'N/A';
    const safeAge = patient.age || 0;
    const safeGender = patient.gender || 'unknown';
    const safePhone = patient.phone || 'N/A';
    const safeEmail = patient.email || 'N/A';
    const safeConditions = patient.conditions || [];

    return (
      <CompactPatientCard selected={isSelected} onClick={onClick}>
        <CardHeader>
          <PatientInfo>
            <PatientAvatar>
              {safeName.split(' ').map(n => n[0]).join('').toUpperCase()}
              <StatusDot status={patient.status || 'inactive'} />
              {patient.needsFollowUp && <FollowUpDot />}
            </PatientAvatar>
            
            <PatientDetails>
              <PatientName>{safeName}</PatientName>
              <PatientMeta>
                <span>#{safePatientId}</span>
                <Separator>•</Separator>
                <span>{safeAge}y</span>
                <Separator>•</Separator>
                <span>{safeGender.charAt(0).toUpperCase()}</span>
              </PatientMeta>
            </PatientDetails>
          </PatientInfo>

          <ActionMenu>
            <ActionButton
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <FiMoreVertical size={12} />
            </ActionButton>
          </ActionMenu>
        </CardHeader>

        <CardContent>
          <ContactRow>
            <ContactItem>
              <FiPhone size={10} />
              <ContactText>{safePhone}</ContactText>
            </ContactItem>
            <ContactItem>
              <FiMail size={10} />
              <ContactText>{safeEmail}</ContactText>
            </ContactItem>
          </ContactRow>

          <StatsRow>
            <StatItem>
              <StatLabel>Last Visit</StatLabel>
              <StatValue>
                {patient.lastVisit && patient.lastVisit !== 'null' ? formatDate(patient.lastVisit) : 'Never'}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Visits</StatLabel>
              <StatValue>{patient.totalVisits || 0}</StatValue>
            </StatItem>
          </StatsRow>

          {safeConditions.length > 0 && (
            <ConditionsRow>
              <ConditionsList>
                {safeConditions.slice(0, 2).map((condition, index) => (
                  <ConditionChip key={index}>{condition}</ConditionChip>
                ))}
                {safeConditions.length > 2 && (
                  <ConditionChip variant="more">+{safeConditions.length - 2}</ConditionChip>
                )}
              </ConditionsList>
            </ConditionsRow>
          )}
        </CardContent>

        <CardFooter>
          <ActionButton
            variant="primary"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <FiCalendar size={10} />
            <span>Schedule</span>
          </ActionButton>
          <ActionButton
            variant="secondary"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <FiPhone size={10} />
            <span>Call</span>
          </ActionButton>
        </CardFooter>
      </CompactPatientCard>
    );
  };

  // Compact Patient Details Panel
  const PatientDetailsPanel: React.FC = () => {
    if (!selectedPatient) {
      return (
        <EmptySelectionState>
          <EmptyIcon>
            <FiUsers size={32} />
          </EmptyIcon>
          <EmptyTitle>Select Patient</EmptyTitle>
          <EmptyMessage>
            Choose a patient to view their details and medical information.
          </EmptyMessage>
        </EmptySelectionState>
      );
    }

    return (
      <DetailContainer>
        <DetailHeader>
          <PatientHeaderInfo>
            <PatientAvatarLarge>
              {(selectedPatient.name || '').split(' ').map(n => n[0]).join('').toUpperCase()}
            </PatientAvatarLarge>
            
            <HeaderPatientInfo>
              <DetailPatientName>{selectedPatient.name || 'Unknown Patient'}</DetailPatientName>
              <DetailPatientMeta>
                <span>#{selectedPatient.patientId || 'N/A'}</span>
                <span>•</span>
                <span>{selectedPatient.age || 0}y</span>
                <span>•</span>
                <span>{selectedPatient.gender || 'unknown'}</span>
              </DetailPatientMeta>
              <DetailContactInfo>
                <span>{selectedPatient.phone || 'N/A'}</span>
                <span>•</span>
                <span>{selectedPatient.email || 'N/A'}</span>
              </DetailContactInfo>
            </HeaderPatientInfo>
          </PatientHeaderInfo>
          
          <HeaderActions>
            <ActionButton variant="primary" size="sm">
              <FiCalendar size={12} />
              <span>Schedule</span>
            </ActionButton>
            <ActionButton variant="secondary" size="sm">
              <FiPhone size={12} />
              <span>Call</span>
            </ActionButton>
            <ActionButton variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
              <FiX size={12} />
            </ActionButton>
          </HeaderActions>
        </DetailHeader>

        <TabsContainer>
          {(['overview', 'history', 'appointments', 'documents'] as ActiveTab[]).map((tab) => (
            <TabButton 
              key={tab}
              active={activeDetailTab === tab} 
              onClick={() => setActiveDetailTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabButton>
          ))}
        </TabsContainer>

        <TabContentContainer>
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
        </TabContentContainer>
      </DetailContainer>
    );
  };

  // Compact Tab Components
  const PatientOverviewTab: React.FC<{ patient: Patient }> = ({ patient }) => (
    <TabContent>
      <InfoSection>
        <SectionHeader>Contact</SectionHeader>
        <InfoGrid>
          <InfoField>
            <FieldLabel>Phone</FieldLabel>
            <FieldValue>{patient.phone || 'N/A'}</FieldValue>
          </InfoField>
          <InfoField>
            <FieldLabel>Email</FieldLabel>
            <FieldValue>{patient.email || 'N/A'}</FieldValue>
          </InfoField>
          <InfoField>
            <FieldLabel>Address</FieldLabel>
            <FieldValue>{patient.address || 'N/A'}</FieldValue>
          </InfoField>
          <InfoField>
            <FieldLabel>Registered</FieldLabel>
            <FieldValue>{patient.registeredDate ? formatDate(patient.registeredDate) : 'N/A'}</FieldValue>
          </InfoField>
        </InfoGrid>
      </InfoSection>

      <InfoSection>
        <SectionHeader>Medical Summary</SectionHeader>
        <InfoGrid>
          <InfoField>
            <FieldLabel>Total Visits</FieldLabel>
            <FieldValue>{patient.totalVisits || 0}</FieldValue>
          </InfoField>
          <InfoField>
            <FieldLabel>Last Visit</FieldLabel>
            <FieldValue>{patient.lastVisit && patient.lastVisit !== 'null' ? formatDate(patient.lastVisit) : 'Never'}</FieldValue>
          </InfoField>
          <InfoField>
            <FieldLabel>Conditions</FieldLabel>
            <FieldValue>{(patient.conditions || []).length}</FieldValue>
          </InfoField>
          <InfoField>
            <FieldLabel>Follow-up</FieldLabel>
            <FieldValue>
              <StatusChip status={patient.needsFollowUp ? 'warning' : 'success'}>
                {patient.needsFollowUp ? 'Required' : 'None'}
              </StatusChip>
            </FieldValue>
          </InfoField>
        </InfoGrid>
      </InfoSection>

      {(patient.conditions || []).length > 0 && (
        <InfoSection>
          <SectionHeader>Active Conditions</SectionHeader>
          <ConditionsGrid>
            {(patient.conditions || []).map((condition, index) => (
              <ConditionRow key={index}>
                <ConditionName>{condition}</ConditionName>
                <StatusChip status="success">Active</StatusChip>
              </ConditionRow>
            ))}
          </ConditionsGrid>
        </InfoSection>
      )}
    </TabContent>
  );

  const PatientHistoryTab: React.FC<{
    history: ConsultationHistory | undefined;
    loading: boolean;
    onRefresh: () => void;
  }> = ({ history, loading, onRefresh }) => {
    if (loading) {
      return (
        <LoadingState>
          <LoadingSpinner size="sm" />
          <LoadingText>Loading history...</LoadingText>
        </LoadingState>
      );
    }

    if (!history) {
      return (
        <EmptyTabState>
          <EmptyIcon>
            <FiFileText size={32} />
          </EmptyIcon>
          <EmptyTitle>No History</EmptyTitle>
          <EmptyMessage>No medical history available for this patient.</EmptyMessage>
          <ActionButton variant="primary" size="sm">Add Consultation</ActionButton>
        </EmptyTabState>
      );
    }

    return (
      <TabContent>
        <HistoryHeader>
          <HistoryStatsGrid>
            <CompactStatCard>
              <StatValue>{(history.visits || []).length}</StatValue>
              <StatLabel>Visits</StatLabel>
            </CompactStatCard>
            <CompactStatCard>
              <StatValue>{(history.conditions || []).filter(c => c.status === 'active').length}</StatValue>
              <StatLabel>Conditions</StatLabel>
            </CompactStatCard>
            <CompactStatCard>
              <StatValue>{(history.medications || []).filter(m => m.status === 'active').length}</StatValue>
              <StatLabel>Medications</StatLabel>
            </CompactStatCard>
            <CompactStatCard>
              <StatValue>{(history.allergies || []).length}</StatValue>
              <StatLabel>Allergies</StatLabel>
            </CompactStatCard>
          </HistoryStatsGrid>
          
          <ActionButton onClick={onRefresh} variant="ghost" size="sm">
            <FiRefreshCw size={12} />
          </ActionButton>
        </HistoryHeader>

        <HistoryTimeline>
          <SectionHeader>Recent Visits</SectionHeader>
          {(history.visits || []).map(visit => (
            <TimelineItem key={visit.id}>
              <TimelineMarker />
              <TimelineContent>
                <TimelineDate>{formatDate(visit.date)}</TimelineDate>
                <TimelineTitle>{visit.type}</TimelineTitle>
                <TimelineDetail>
                  <strong>Chief Complaint:</strong> {visit.chiefComplaint}
                </TimelineDetail>
                <TimelineDetail>
                  <strong>Diagnosis:</strong> {visit.diagnosis}
                </TimelineDetail>
              </TimelineContent>
            </TimelineItem>
          ))}
        </HistoryTimeline>
      </TabContent>
    );
  };

  const PatientAppointmentsTab: React.FC<{ patient: Patient }> = ({ patient }) => (
    <TabContent>
      <TabHeader>
        <SectionHeader>Appointments</SectionHeader>
        <ActionButton variant="primary" size="sm">
          <FiPlus size={12} />
          <span>Schedule</span>
        </ActionButton>
      </TabHeader>
      <EmptyTabState>
        <EmptyIcon>
          <FiCalendar size={32} />
        </EmptyIcon>
        <EmptyTitle>No Appointments</EmptyTitle>
        <EmptyMessage>No appointments scheduled for this patient.</EmptyMessage>
      </EmptyTabState>
    </TabContent>
  );

  const PatientDocumentsTab: React.FC<{ patient: Patient }> = ({ patient }) => (
    <TabContent>
      <TabHeader>
        <SectionHeader>Documents</SectionHeader>
        <ActionButton variant="primary" size="sm">
          <FiPlus size={12} />
          <span>Upload</span>
        </ActionButton>
      </TabHeader>
      <EmptyTabState>
        <EmptyIcon>
          <FiFileText size={32} />
        </EmptyIcon>
        <EmptyTitle>No Documents</EmptyTitle>
        <EmptyMessage>No documents uploaded for this patient.</EmptyMessage>
      </EmptyTabState>
    </TabContent>
  );

  // Loading state
  if (patientsLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner size="lg" />
        <LoadingText>Loading patients...</LoadingText>
      </LoadingContainer>
    );
  }

  // Error state
  if (patientsError) {
    return (
      <ErrorContainer>
        <ErrorIcon>
          <FiAlertCircle size={32} />
        </ErrorIcon>
        <ErrorTitle>Error Loading Patients</ErrorTitle>
        <ErrorMessage>Unable to load patient data. Please try again.</ErrorMessage>
        <ActionButton onClick={refetchPatients} variant="primary" size="sm">
          <FiRefreshCw size={12} />
          <span>Retry</span>
        </ActionButton>
      </ErrorContainer>
    );
  }

  return (
    <AppContainer>
      <CompactHeader>
        <HeaderContent>
          <HeaderTop>
            <Title>Patient Management</Title>
            <HeaderActions>
              <ActionButton onClick={refetchPatients} variant="ghost" size="sm">
                <FiRefreshCw size={12} />
              </ActionButton>
              <ActionButton variant="secondary" size="sm">
                <FiDownload size={12} />
                <span>Export</span>
              </ActionButton>
              <ActionButton variant="primary" size="sm">
                <FiPlus size={12} />
                <span>Add Patient</span>
              </ActionButton>
            </HeaderActions>
          </HeaderTop>
          
          <HeaderSubtitle>
            Manage your patients and their medical records
            <PatientCount>({patientStats.total} patients)</PatientCount>
          </HeaderSubtitle>
          
          <CompactStatsGrid>
            <CompactStatCard>
              <StatIcon>
                <FiUsers size={14} />
              </StatIcon>
              <StatContent>
                <StatValue>{patientStats.total}</StatValue>
                <StatLabel>Total</StatLabel>
              </StatContent>
            </CompactStatCard>
            <CompactStatCard>
              <StatIcon>
                <FiTrendingUp size={14} />
              </StatIcon>
              <StatContent>
                <StatValue>{patientStats.newThisWeek}</StatValue>
                <StatLabel>New Week</StatLabel>
              </StatContent>
            </CompactStatCard>
            <CompactStatCard>
              <StatIcon>
                <FiActivity size={14} />
              </StatIcon>
              <StatContent>
                <StatValue>{patientStats.seenThisMonth}</StatValue>
                <StatLabel>Seen Month</StatLabel>
              </StatContent>
            </CompactStatCard>
            <CompactStatCard>
              <StatIcon>
                <FiAlertCircle size={14} />
              </StatIcon>
              <StatContent>
                <StatValue>{patientStats.needFollowUp}</StatValue>
                <StatLabel>Follow-up</StatLabel>
              </StatContent>
            </CompactStatCard>
          </CompactStatsGrid>
        </HeaderContent>
      </CompactHeader>

      <MainLayout>
        <PatientListSection>
          <SearchFiltersSection>
            <SearchRow>
              <CompactSearchContainer>
                <SearchIcon>
                  <FiSearch size={14} />
                </SearchIcon>
                <CompactSearchInput
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <ClearButton onClick={() => setSearchQuery('')}>
                    <FiX size={12} />
                  </ClearButton>
                )}
              </CompactSearchContainer>
            </SearchRow>

            <FiltersRow>
              <FilterGroup>
                <ViewToggle>
                  <ViewButton 
                    active={viewMode === 'cards'} 
                    onClick={() => setViewMode('cards')}
                  >
                    <FiGrid size={12} />
                  </ViewButton>
                  <ViewButton 
                    active={viewMode === 'table'} 
                    onClick={() => setViewMode('table')}
                  >
                    <FiList size={12} />
                  </ViewButton>
                </ViewToggle>

                <CompactSelect
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                >
                  <option value="name_asc">Name A-Z</option>
                  <option value="name_desc">Name Z-A</option>
                  <option value="last_visit_desc">Recent Visit</option>
                  <option value="last_visit_asc">Oldest Visit</option>
                  <option value="age_asc">Youngest</option>
                  <option value="age_desc">Oldest</option>
                </CompactSelect>

                <FilterButton onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                  <FiFilter size={12} />
                  <span>Filters</span>
                  {showAdvancedFilters ? <FiChevronUp size={10} /> : <FiChevronDown size={10} />}
                </FilterButton>
              </FilterGroup>

              <ResultsCount>
                {filteredAndSortedPatients.length} of {patients.length}
                {searchQuery && ` for "${searchQuery}"`}
              </ResultsCount>
            </FiltersRow>

            {showAdvancedFilters && (
              <AdvancedFiltersContainer>
                <FiltersGrid>
                  <CompactSelect
                    value={filters.gender}
                    onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value as Filters['gender'] }))}
                  >
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </CompactSelect>

                  <CompactSelect
                    value={filters.ageRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, ageRange: e.target.value as Filters['ageRange'] }))}
                  >
                    <option value="all">All Ages</option>
                    <option value="0-18">0-18 years</option>
                    <option value="19-35">19-35 years</option>
                    <option value="36-55">36-55 years</option>
                    <option value="56+">56+ years</option>
                  </CompactSelect>

                  <CompactSelect
                    value={filters.lastVisit}
                    onChange={(e) => setFilters(prev => ({ ...prev, lastVisit: e.target.value as Filters['lastVisit'] }))}
                  >
                    <option value="all">Any Time</option>
                    <option value="last_week">Last Week</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_3_months">Last 3 Months</option>
                    <option value="last_6_months">Last 6 Months</option>
                    <option value="over_6_months">Over 6 Months</option>
                    <option value="never">Never</option>
                  </CompactSelect>

                  <ActionButton 
                    variant="ghost" 
                    size="xs"
                    onClick={() => setFilters({ gender: 'all', ageRange: 'all', lastVisit: 'all', status: 'active' })}
                  >
                    Clear
                  </ActionButton>
                </FiltersGrid>
              </AdvancedFiltersContainer>
            )}
          </SearchFiltersSection>

          <ListContent>
            {filteredAndSortedPatients.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <FiUsers size={32} />
                </EmptyIcon>
                <EmptyTitle>
                  {searchQuery ? `No results for "${searchQuery}"` : "No patients found"}
                </EmptyTitle>
                <EmptyMessage>
                  {searchQuery 
                    ? "Try adjusting your search or filters"
                    : "No patients match current filters"
                  }
                </EmptyMessage>
                {searchQuery && (
                  <ActionButton variant="secondary" size="sm" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </ActionButton>
                )}
              </EmptyState>
            ) : (
              viewMode === 'cards' ? (
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
                <TableContainer>
                  <CompactTable>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Patient</TableHeaderCell>
                        <TableHeaderCell>Age/Gender</TableHeaderCell>
                        <TableHeaderCell>Contact</TableHeaderCell>
                        <TableHeaderCell>Last Visit</TableHeaderCell>
                        <TableHeaderCell>Visits</TableHeaderCell>
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
                                {(patient.name || '').split(' ').map(n => n[0]).join('').toUpperCase()}
                              </PatientAvatar>
                              <div>
                                <TablePatientName>{patient.name || 'Unknown Patient'}</TablePatientName>
                                <TablePatientId>#{patient.patientId || 'N/A'}</TablePatientId>
                              </div>
                            </TablePatientInfo>
                          </TableCell>
                          <TableCell>{patient.age || 0}y • {patient.gender || 'unknown'}</TableCell>
                          <TableCell>
                            <div>{patient.phone || 'N/A'}</div>
                            <TableSecondaryText>{patient.email || 'N/A'}</TableSecondaryText>
                          </TableCell>
                          <TableCell>
                            {patient.lastVisit && patient.lastVisit !== 'null' ? formatDate(patient.lastVisit) : 'Never'}
                          </TableCell>
                          <TableCell>{patient.totalVisits || 0}</TableCell>
                          <TableCell>
                            <StatusChip status={patient.status === 'active' ? 'success' : 'danger'}>
                              {patient.status || 'inactive'}
                            </StatusChip>
                            {patient.needsFollowUp && (
                              <FollowUpChip>Follow-up</FollowUpChip>
                            )}
                          </TableCell>
                          <TableCell>
                            <TableActions>
                              <ActionButton 
                                size="xs" 
                                variant="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <FiCalendar size={10} />
                              </ActionButton>
                              <ActionButton 
                                size="xs" 
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <FiPhone size={10} />
                              </ActionButton>
                            </TableActions>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </CompactTable>
                </TableContainer>
              )
            )}
          </ListContent>
        </PatientListSection>

        <DetailSection>
          <PatientDetailsPanel />
        </DetailSection>
      </MainLayout>
    </AppContainer>
  );
};

// Utility functions
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

// Compact Styled Components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${theme.colors.gray[25]};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
`;

const CompactHeader = styled.header`
  background: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
`;

const HeaderContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0;
`;

const HeaderSubtitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: 12px;
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.lg};
`;

const PatientCount = styled.span`
  font-size: 11px;
  color: ${theme.colors.gray[500]};
  font-weight: 500;
`;

const CompactStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.md};
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const CompactStatCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.xs};
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${theme.shadows.sm};
  }
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: ${theme.colors.primary}10;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary};
`;

const StatContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  line-height: 1.2;
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: ${theme.colors.gray[500]};
  margin-top: 1px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MainLayout = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 320px;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 300px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PatientListSection = styled.div`
  display: flex;
  flex-direction: column;
  background: ${theme.colors.white};
  border-right: 1px solid ${theme.colors.gray[200]};
`;

const SearchFiltersSection = styled.div`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  background: ${theme.colors.gray[25]};
`;

const SearchRow = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const CompactSearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing.sm};
  color: ${theme.colors.gray[400]};
  z-index: 2;
`;

const CompactSearchInput = styled.input`
  width: 100%;
  height: 32px;
  padding: 0 32px 0 32px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: 12px;
  background: ${theme.colors.white};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}15;
  }

  &::placeholder {
    color: ${theme.colors.gray[500]};
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: ${theme.spacing.xs};
  padding: ${theme.spacing.xs};
  border: none;
  background: none;
  color: ${theme.colors.gray[400]};
  cursor: pointer;
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.gray[600]};
  }
`;

const FiltersRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
`;

const ViewButton = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border: none;
  background: ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${props => props.active ? theme.colors.white : theme.colors.gray[600]};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? theme.colors.primary : theme.colors.gray[50]};
  }
`;

const CompactSelect = styled.select`
  height: 28px;
  padding: 0 ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: 11px;
  background: ${theme.colors.white};
  color: ${theme.colors.gray[700]};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  height: 28px;
  padding: 0 ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray[300]};
  background: ${theme.colors.white};
  color: ${theme.colors.gray[700]};
  border-radius: ${theme.borderRadius.md};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.gray[50]};
    border-color: ${theme.colors.gray[400]};
  }
`;

const ResultsCount = styled.div`
  font-size: 11px;
  color: ${theme.colors.gray[600]};
  white-space: nowrap;
  
  @media (max-width: 768px) {
    text-align: center;
    margin-top: ${theme.spacing.xs};
  }
`;

const AdvancedFiltersContainer = styled.div`
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.gray[200]};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
  gap: ${theme.spacing.sm};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ListContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.md};
`;

const PatientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CompactPatientCard = styled.div<{ selected: boolean }>`
  background: ${theme.colors.white};
  border: 1px solid ${props => props.selected ? theme.colors.primary : theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.xs};

  &:hover {
    border-color: ${props => props.selected ? theme.colors.primary : theme.colors.gray[300]};
    box-shadow: ${theme.shadows.sm};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.sm};
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex: 1;
  min-width: 0;
`;

const PatientAvatar = styled.div<{ small?: boolean }>`
  position: relative;
  width: ${props => props.small ? '24px' : '36px'};
  height: ${props => props.small ? '24px' : '36px'};
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  color: ${theme.colors.white};
  font-weight: 600;
  font-size: ${props => props.small ? '9px' : '12px'};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatusDot = styled.div<{ status: PatientStatus }>`
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.status === 'active' ? theme.colors.success : theme.colors.gray[400]};
  border: 2px solid ${theme.colors.white};
`;

const FollowUpDot = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${theme.colors.warning};
  border: 1px solid ${theme.colors.white};
`;

const PatientDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const PatientName = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 2px 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PatientMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: 10px;
  color: ${theme.colors.gray[600]};
  line-height: 1.2;
`;

const Separator = styled.span`
  color: ${theme.colors.gray[400]};
`;

const ActionMenu = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
`;

const CardContent = styled.div`
  margin-bottom: ${theme.spacing.sm};
`;

const ContactRow = styled.div`
  margin-bottom: ${theme.spacing.sm};
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  margin-bottom: 2px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ContactText = styled.span`
  font-size: 10px;
  color: ${theme.colors.gray[600]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
`;

const StatItem = styled.div`
  text-align: center;
`;

const ConditionsRow = styled.div``;

const ConditionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
`;

const ConditionChip = styled.span<{ variant?: 'more' }>`
  padding: 2px ${theme.spacing.xs};
  background: ${props => props.variant === 'more' ? theme.colors.gray[200] : `${theme.colors.primary}10`};
  color: ${props => props.variant === 'more' ? theme.colors.gray[600] : theme.colors.primary};
  border-radius: ${theme.borderRadius.sm};
  font-size: 9px;
  font-weight: 500;
`;

const CardFooter = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
`;

const ActionButton = styled.button<{ 
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'xs' | 'sm' | 'md';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  padding: ${props => {
    switch (props.size) {
      case 'xs': return `${theme.spacing.xs} ${theme.spacing.sm}`;
      case 'sm': return `${theme.spacing.sm} ${theme.spacing.md}`;
      default: return `${theme.spacing.md} ${theme.spacing.lg}`;
    }
  }};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.gray[300];
      case 'ghost': return 'transparent';
      default: return theme.colors.gray[300];
    }
  }};
  background: ${props => {
    switch (props.variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.white;
      case 'ghost': return 'transparent';
      default: return theme.colors.white;
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'primary': return theme.colors.white;
      case 'secondary': return theme.colors.gray[700];
      case 'ghost': return theme.colors.gray[600];
      default: return theme.colors.gray[700];
    }
  }};
  border-radius: ${theme.borderRadius.md};
  font-size: ${props => {
    switch (props.size) {
      case 'xs': return '10px';
      case 'sm': return '11px';
      default: return '12px';
    }
  }};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-height: ${props => {
    switch (props.size) {
      case 'xs': return '24px';
      case 'sm': return '28px';
      default: return '32px';
    }
  }};
  white-space: nowrap;

  &:hover {
    background: ${props => {
      switch (props.variant) {
        case 'primary': return theme.colors.primaryDark;
        case 'secondary': return theme.colors.gray[50];
        case 'ghost': return theme.colors.gray[100];
        default: return theme.colors.gray[50];
      }
    }};
    border-color: ${props => {
      switch (props.variant) {
        case 'primary': return theme.colors.primaryDark;
        case 'ghost': return theme.colors.gray[300];
        default: return theme.colors.gray[400];
      }
    }};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => {
      switch (props.variant) {
        case 'primary': return `${theme.colors.primary}25`;
        default: return `${theme.colors.gray[400]}25`;
      }
    }};
  }
`;

// Table Styles
const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray[200]};
`;

const CompactTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${theme.colors.white};
  font-size: 11px;
`;

const TableHeader = styled.thead`
  background: ${theme.colors.gray[50]};
`;

const TableRow = styled.tr<{ selected?: boolean }>`
  background: ${props => props.selected ? `${theme.colors.primary}08` : theme.colors.white};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.selected ? `${theme.colors.primary}15` : theme.colors.gray[25]};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableHeaderCell = styled.th`
  padding: ${theme.spacing.sm};
  text-align: left;
  font-size: 10px;
  font-weight: 600;
  color: ${theme.colors.gray[700]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableCell = styled.td`
  padding: ${theme.spacing.sm};
  font-size: 11px;
  color: ${theme.colors.gray[900]};
  vertical-align: middle;
`;

const TableBody = styled.tbody``;

const TablePatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const TablePatientName = styled.div`
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin-bottom: 1px;
  font-size: 11px;
`;

const TablePatientId = styled.div`
  font-size: 9px;
  color: ${theme.colors.gray[500]};
`;

const TableSecondaryText = styled.div`
  font-size: 9px;
  color: ${theme.colors.gray[500]};
  margin-top: 1px;
`;

const TableActions = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
`;

const StatusChip = styled.span<{ status: StatusBadgeStatus }>`
  display: inline-flex;
  align-items: center;
  padding: 2px ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: ${props => {
    switch (props.status) {
      case 'success': return `${theme.colors.success}15`;
      case 'warning': return `${theme.colors.warning}15`;
      case 'danger': return `${theme.colors.danger}15`;
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

const FollowUpChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1px ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${theme.colors.warning}15;
  color: ${theme.colors.warning};
  margin-left: ${theme.spacing.xs};
`;

// Detail Panel Styles
const DetailSection = styled.div`
  background: ${theme.colors.white};
  overflow: hidden;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const EmptySelectionState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${theme.spacing.xl};
  height: 100%;
`;

const EmptyIcon = styled.div`
  color: ${theme.colors.gray[300]};
  margin-bottom: ${theme.spacing.md};
`;

const EmptyTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const EmptyMessage = styled.p`
  font-size: 11px;
  color: ${theme.colors.gray[600]};
  margin: 0 0 ${theme.spacing.lg} 0;
  max-width: 240px;
  line-height: 1.4;
`;

const DetailContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  background: ${theme.colors.gray[25]};
`;

const PatientHeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const PatientAvatarLarge = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  color: ${theme.colors.white};
  font-weight: 600;
  font-size: 18px;
  box-shadow: ${theme.shadows.sm};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeaderPatientInfo = styled.div``;

const DetailPatientName = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const DetailPatientMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: 11px;
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.xs};
  
  span:first-child {
    color: ${theme.colors.primary};
    font-weight: 600;
  }
`;

const DetailContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: 10px;
  color: ${theme.colors.gray[600]};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const TabsContainer = styled.div`
  display: flex;
  background: ${theme.colors.gray[50]};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  background: ${props => props.active ? theme.colors.white : 'transparent'};
  color: ${props => props.active ? theme.colors.primary : theme.colors.gray[600]};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: ${props => props.active ? theme.colors.white : theme.colors.gray[100]};
    color: ${props => props.active ? theme.colors.primary : theme.colors.gray[700]};
  }
`;

const TabContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

// Tab Content Styles
const TabContent = styled.div`
  padding: ${theme.spacing.lg};
`;

const TabHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const InfoSection = styled.div`
  margin-bottom: ${theme.spacing.xl};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 ${theme.spacing.md} 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const InfoField = styled.div``;

const FieldLabel = styled.div`
  font-size: 9px;
  font-weight: 500;
  color: ${theme.colors.gray[500]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
`;

const FieldValue = styled.div`
  font-size: 11px;
  color: ${theme.colors.gray[900]};
  font-weight: 500;
`;

const ConditionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const ConditionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm};
  background: ${theme.colors.gray[25]};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.gray[200]};
`;

const ConditionName = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${theme.colors.gray[900]};
`;

// History Tab Styles
const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.xl};
  gap: ${theme.spacing.lg};
`;

const HistoryStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.sm};
  flex: 1;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const HistoryTimeline = styled.div``;

const Timeline = styled.div`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 8px;
    top: ${theme.spacing.lg};
    bottom: ${theme.spacing.lg};
    width: 1px;
    background: ${theme.colors.gray[200]};
  }
`;

const TimelineItem = styled.div`
  position: relative;
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TimelineMarker = styled.div`
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  border: 3px solid ${theme.colors.white};
  box-shadow: 0 0 0 1px ${theme.colors.gray[200]};
  margin-top: 2px;
  z-index: 1;
`;

const TimelineContent = styled.div`
  flex: 1;
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  box-shadow: ${theme.shadows.xs};
`;

const TimelineDate = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: ${theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${theme.spacing.xs};
`;

const TimelineTitle = styled.h4`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const TimelineDetail = styled.div`
  font-size: 10px;
  color: ${theme.colors.gray[700]};
  line-height: 1.4;
  margin-bottom: ${theme.spacing.xs};
  
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
  height: 100vh;
  gap: ${theme.spacing.md};
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  gap: ${theme.spacing.md};
`;

const LoadingSpinner = styled.div<{ size?: 'sm' | 'md' | 'lg' }>`
  width: ${props => {
    switch (props.size) {
      case 'sm': return '16px';
      case 'lg': return '32px';
      default: return '24px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'sm': return '16px';
      case 'lg': return '32px';
      default: return '24px';
    }
  }};
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
  font-size: 11px;
  color: ${theme.colors.gray[600]};
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const ErrorIcon = styled.div`
  color: ${theme.colors.danger};
`;

const ErrorTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0;
`;

const ErrorMessage = styled.p`
  font-size: 12px;
  color: ${theme.colors.gray[600]};
  margin: 0;
  max-width: 300px;
  line-height: 1.4;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${theme.spacing.xl};
`;

const EmptyTabState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${theme.spacing.xl};
  height: 200px;
`;

export default PatientManagement;