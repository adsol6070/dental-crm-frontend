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

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
  const [patientHistory, setPatientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    gender: 'all',
    ageRange: 'all',
    lastVisit: 'all',
    status: 'active'
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  const [sortBy, setSortBy] = useState('name_asc');

  // Mock data for demonstration
  const mockPatients = [
    {
      id: "PAT001",
      patientId: "PAT001",
      name: "John Doe",
      age: 32,
      gender: "male",
      phone: "+91 9876543210",
      email: "john@example.com",
      profilePicture: null,
      lastVisit: "2025-07-15",
      registeredDate: "2024-01-15",
      status: "active",
      address: "123 Main St, City",
      needsFollowUp: true,
      totalVisits: 5,
      conditions: ["Hypertension", "Diabetes"],
      lastDiagnosis: "Routine checkup"
    },
    {
      id: "PAT002",
      patientId: "PAT002",
      name: "Jane Smith",
      age: 28,
      gender: "female",
      phone: "+91 9876543211",
      email: "jane@example.com",
      profilePicture: null,
      lastVisit: "2025-07-20",
      registeredDate: "2024-03-20",
      status: "active",
      address: "456 Oak Ave, City",
      needsFollowUp: false,
      totalVisits: 8,
      conditions: ["Migraine"],
      lastDiagnosis: "Migraine treatment"
    },
    {
      id: "PAT003",
      patientId: "PAT003",
      name: "Mike Johnson",
      age: 45,
      gender: "male",
      phone: "+91 9876543212",
      email: "mike@example.com",
      profilePicture: null,
      lastVisit: "2025-06-10",
      registeredDate: "2023-08-10",
      status: "active",
      address: "789 Pine St, City",
      needsFollowUp: true,
      totalVisits: 12,
      conditions: ["Heart Disease", "High Cholesterol"],
      lastDiagnosis: "Cardiac consultation"
    },
    {
      id: "PAT004",
      patientId: "PAT004",
      name: "Sarah Wilson",
      age: 35,
      gender: "female",
      phone: "+91 9876543213",
      email: "sarah@example.com",
      profilePicture: null,
      lastVisit: null,
      registeredDate: "2025-07-01",
      status: "active",
      address: "321 Elm St, City",
      needsFollowUp: false,
      totalVisits: 0,
      conditions: [],
      lastDiagnosis: null
    },
    {
      id: "PAT005",
      patientId: "PAT005",
      name: "Robert Brown",
      age: 52,
      gender: "male",
      phone: "+91 9876543214",
      email: "robert@example.com",
      profilePicture: null,
      lastVisit: "2025-07-18",
      registeredDate: "2023-12-05",
      status: "active",
      address: "654 Maple Dr, City",
      needsFollowUp: false,
      totalVisits: 15,
      conditions: ["Arthritis", "Diabetes"],
      lastDiagnosis: "Joint pain management"
    }
  ];

  useEffect(() => {
    setPatients(mockPatients);
    setPagination(prev => ({ 
      ...prev, 
      total: mockPatients.length, 
      totalPages: Math.ceil(mockPatients.length / prev.limit) 
    }));
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.trim().length >= 2) {
        setSearching(true);
        // Simulate API call
        setTimeout(() => {
          const results = mockPatients.filter(patient =>
            patient.name.toLowerCase().includes(query.toLowerCase()) ||
            patient.phone.includes(query) ||
            patient.email.toLowerCase().includes(query.toLowerCase()) ||
            patient.patientId.toLowerCase().includes(query.toLowerCase())
          );
          setSearchResults(results);
          setSearching(false);
        }, 300);
      } else {
        setSearchResults([]);
        setSearching(false);
      }
    }, 300),
    [mockPatients]
  );

  // useEffect(() => {
  //   if (searchQuery) {
  //     debouncedSearch(searchQuery);
  //   } else {
  //     setSearchResults([]);
  //   }
  // }, [searchQuery, debouncedSearch]);

  // Filter and sort patients
  const filteredAndSortedPatients = useMemo(() => {
    const patientsToFilter = searchQuery.length >= 2 ? searchResults : patients;
    
    return patientsToFilter
      .filter(patient => {
        const matchesGender = filters.gender === 'all' || patient.gender === filters.gender;
        const matchesAgeRange = filters.ageRange === 'all' || checkAgeRange(patient.age, filters.ageRange);
        const matchesLastVisit = filters.lastVisit === 'all' || checkLastVisit(patient.lastVisit, filters.lastVisit);
        const matchesStatus = filters.status === 'all' || patient.status === filters.status;
        
        return matchesGender && matchesAgeRange && matchesLastVisit && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          case 'last_visit_desc':
            return new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0);
          case 'last_visit_asc':
            return new Date(a.lastVisit || 0) - new Date(b.lastVisit || 0);
          case 'age_asc':
            return a.age - b.age;
          case 'age_desc':
            return b.age - a.age;
          default:
            return 0;
        }
      });
  }, [patients, searchResults, searchQuery, filters, sortBy]);

  const checkAgeRange = (age, range) => {
    switch (range) {
      case '0-18': return age <= 18;
      case '19-35': return age >= 19 && age <= 35;
      case '36-55': return age >= 36 && age <= 55;
      case '56+': return age >= 56;
      default: return true;
    }
  };

  const checkLastVisit = (lastVisit, range) => {
    if (!lastVisit) return range === 'never';
    const visitDate = new Date(lastVisit);
    const now = new Date();
    const daysDiff = Math.floor((now - visitDate) / (1000 * 60 * 60 * 24));
    
    switch (range) {
      case 'last_week': return daysDiff <= 7;
      case 'last_month': return daysDiff <= 30;
      case 'last_3_months': return daysDiff <= 90;
      case 'last_6_months': return daysDiff <= 180;
      case 'over_6_months': return daysDiff > 180;
      case 'never': return false;
      default: return true;
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setActiveDetailTab('overview');
    setPatientHistory(null);
  };

  const loadPatientHistory = async (patientId) => {
    setHistoryLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPatientHistory({
        visits: [
          {
            id: 1,
            date: "2025-07-20",
            time: "10:00",
            type: "Consultation",
            chiefComplaint: "Headache and fever",
            diagnosis: "Viral infection",
            status: "completed"
          },
          {
            id: 2,
            date: "2025-06-15",
            time: "14:30",
            type: "Follow-up",
            chiefComplaint: "Blood pressure check",
            diagnosis: "Hypertension monitoring",
            status: "completed"
          }
        ],
        conditions: [
          {
            id: 1,
            name: "Hypertension",
            status: "active",
            diagnosedDate: "2024-01-15",
            notes: "Well controlled with medication"
          }
        ],
        medications: [
          {
            id: 1,
            name: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily",
            status: "active",
            startDate: "2024-01-15"
          }
        ],
        allergies: ["Penicillin"],
        vitals: [
          {
            date: "2025-07-20",
            bloodPressure: "120/80",
            heartRate: 72,
            temperature: 98.6,
            weight: 70
          }
        ]
      });
      setHistoryLoading(false);
    }, 500);
  };

  // Patient stats
  const patientStats = useMemo(() => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      total: patients.length,
      newThisWeek: patients.filter(p => new Date(p.registeredDate) > lastWeek).length,
      seenThisMonth: patients.filter(p => 
        p.lastVisit && new Date(p.lastVisit) > lastMonth
      ).length,
      needFollowUp: patients.filter(p => p.needsFollowUp).length
    };
  }, [patients]);

  const PatientCard = ({ patient, isSelected, onClick }) => {
    return (
      <PatientCardContainer selected={isSelected} onClick={onClick}>
        <PatientCardHeader>
          <PatientAvatar>
            <img 
              src={patient.profilePicture || 'https://avatar.iran.liara.run/public'} 
              alt={patient.name}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="avatar-fallback">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <StatusIndicator status={patient.status} />
            {patient.needsFollowUp && <FollowUpIndicator title="Needs Follow-up" />}
          </PatientAvatar>
          
          <PatientBasicInfo>
            <PatientName>{patient.name}</PatientName>
            <PatientId>#{patient.patientId}</PatientId>
            <PatientMeta>{patient.age} years • {patient.gender}</PatientMeta>
          </PatientBasicInfo>
        </PatientCardHeader>

        <PatientCardContent>
          <ContactInfo>
            <ContactItem>
              <FiPhone size={12} />
              <span>{patient.phone}</span>
            </ContactItem>
            <ContactItem>
              <FiMail size={12} />
              <span>{patient.email}</span>
            </ContactItem>
            <ContactItem>
              <FiMapPin size={12} />
              <span>{patient.address}</span>
            </ContactItem>
          </ContactInfo>

          <VisitInfo>
            <div className="last-visit">
              <strong>Last Visit:</strong> {patient.lastVisit ? formatDate(patient.lastVisit) : 'Never'}
            </div>
            <div className="total-visits">
              <strong>Total Visits:</strong> {patient.totalVisits}
            </div>
            {patient.lastDiagnosis && (
              <div className="last-diagnosis">
                <strong>Last Diagnosis:</strong> {patient.lastDiagnosis}
              </div>
            )}
          </VisitInfo>

          {patient.conditions.length > 0 && (
            <ConditionsInfo>
              <strong>Conditions:</strong>
              <ConditionTags>
                {patient.conditions.slice(0, 2).map((condition, index) => (
                  <ConditionTag key={index}>{condition}</ConditionTag>
                ))}
                {patient.conditions.length > 2 && (
                  <ConditionTag>+{patient.conditions.length - 2} more</ConditionTag>
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

  const PatientDetailsPanel = () => {
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
          <AddPatientButton>
            <FiPlus size={16} />
            Add New Patient
          </AddPatientButton>
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
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="avatar-fallback">
                {selectedPatient.name.split(' ').map(n => n[0]).join('')}
              </div>
            </PatientAvatarLarge>
            
            <PatientDetailInfo>
              <h2>{selectedPatient.name}</h2>
              <p>Patient ID: #{selectedPatient.patientId}</p>
              <p>{selectedPatient.age} years • {selectedPatient.gender}</p>
              <p>{selectedPatient.phone} • {selectedPatient.email}</p>
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
            onClick={() => {
              setActiveDetailTab('history');
              if (!patientHistory) {
                loadPatientHistory(selectedPatient.id);
              }
            }}
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
              onRefresh={() => loadPatientHistory(selectedPatient.id)}
            />
          )}
          {activeDetailTab === 'appointments' && <PatientAppointmentsTab patient={selectedPatient} />}
          {activeDetailTab === 'documents' && <PatientDocumentsTab patient={selectedPatient} />}
        </PatientTabContent>
      </PatientDetailContainer>
    );
  };

  const PatientOverviewTab = ({ patient }) => (
    <OverviewContent>
      <OverviewSection>
        <SectionTitle>Contact Information</SectionTitle>
        <InfoGrid>
          <InfoItem>
            <InfoLabel>Phone</InfoLabel>
            <InfoValue>{patient.phone}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Email</InfoLabel>
            <InfoValue>{patient.email}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Address</InfoLabel>
            <InfoValue>{patient.address}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Registered</InfoLabel>
            <InfoValue>{formatDate(patient.registeredDate)}</InfoValue>
          </InfoItem>
        </InfoGrid>
      </OverviewSection>

      <OverviewSection>
        <SectionTitle>Medical Summary</SectionTitle>
        <InfoGrid>
          <InfoItem>
            <InfoLabel>Total Visits</InfoLabel>
            <InfoValue>{patient.totalVisits}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Last Visit</InfoLabel>
            <InfoValue>{patient.lastVisit ? formatDate(patient.lastVisit) : 'Never'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Known Conditions</InfoLabel>
            <InfoValue>{patient.conditions.length}</InfoValue>
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

      {patient.conditions.length > 0 && (
        <OverviewSection>
          <SectionTitle>Active Conditions</SectionTitle>
          <ConditionList>
            {patient.conditions.map((condition, index) => (
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

  const PatientHistoryTab = ({ history, loading, onRefresh }) => {
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
              <StatValue>{history.visits.length}</StatValue>
              <StatLabel>Total Visits</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{history.conditions.filter(c => c.status === 'active').length}</StatValue>
              <StatLabel>Active Conditions</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{history.medications.filter(m => m.status === 'active').length}</StatValue>
              <StatLabel>Current Medications</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{history.allergies.length}</StatValue>
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
          {history.visits.map(visit => (
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

  const PatientAppointmentsTab = ({ patient }) => (
    <AppointmentsContent>
      <AppointmentsHeader>
        <h3>Appointments for {patient.name}</h3>
        <ActionButton variant="primary">
          <FiPlus size={16} />
          Schedule New
        </ActionButton>
      </AppointmentsHeader>
      <p>Appointment history and scheduling will be displayed here.</p>
    </AppointmentsContent>
  );

  const PatientDocumentsTab = ({ patient }) => (
    <DocumentsContent>
      <DocumentsHeader>
        <h3>Documents for {patient.name}</h3>
        <ActionButton variant="primary">
          <FiPlus size={16} />
          Upload Document
        </ActionButton>
      </DocumentsHeader>
      <p>Patient documents and files will be displayed here.</p>
    </DocumentsContent>
  );

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
          <RefreshButton onClick={() => window.location.reload()}>
            <FiRefreshCw size={16} />
            Refresh
          </RefreshButton>
          <ExportButton>
            <FiDownload size={16} />
            Export
          </ExportButton>
          <AddPatientButton>
            <FiPlus size={16} />
            Add Patient
          </AddPatientButton>
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
                {searching ? <LoadingSpinner size="small" /> : <FiSearch size={16} />}
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
                onChange={(e) => setSortBy(e.target.value)}
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
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </FilterSelect>

                <FilterSelect
                  value={filters.ageRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, ageRange: e.target.value }))}
                >
                  <option value="all">All Ages</option>
                  <option value="0-18">Children (0-18)</option>
                  <option value="19-35">Young Adults (19-35)</option>
                  <option value="36-55">Adults (36-55)</option>
                  <option value="56+">Seniors (56+)</option>
                </FilterSelect>

                <FilterSelect
                  value={filters.lastVisit}
                  onChange={(e) => setFilters(prev => ({ ...prev, lastVisit: e.target.value }))}
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

            {searchQuery.length >= 2 && (
              <SearchInfo>
                <span>
                  Showing results for "{searchQuery}"
                  {searching && <LoadingSpinner size="small" />}
                </span>
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
                    : "Add your first patient to get started with patient management"
                  }
                </EmptyMessage>
                {!searchQuery && (
                  <AddPatientButton>
                    <FiPlus size={16} />
                    Add First Patient
                  </AddPatientButton>
                )}
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
                                  alt={patient.name}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="avatar-fallback">
                                  {patient.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              </PatientAvatar>
                              <div>
                                <PatientName>{patient.name}</PatientName>
                                <PatientId>#{patient.patientId}</PatientId>
                              </div>
                            </TablePatientInfo>
                          </TableCell>
                          <TableCell>{patient.age} • {patient.gender}</TableCell>
                          <TableCell>
                            <div>{patient.phone}</div>
                            <div style={{ fontSize: '12px', color: theme.colors.gray[500] }}>
                              {patient.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {patient.lastVisit ? formatDate(patient.lastVisit) : 'Never'}
                          </TableCell>
                          <TableCell>{patient.totalVisits}</TableCell>
                          <TableCell>
                            <StatusBadge status={patient.status}>
                              {patient.status}
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
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Utility function for date formatting
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 24px;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #6366f1 100%);
  color: white;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const TotalCount = styled.span`
  font-size: 16px;
  font-weight: 400;
  opacity: 0.8;
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0 0 16px 0;
  opacity: 0.9;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    opacity: 0.8;
  }
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  opacity: 0.8;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const RefreshButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ExportButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const AddPatientButton = styled(Button)`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 10px 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const PatientListPanel = styled.div`
  width: 60%;
  border-right: 1px solid ${theme.colors.gray[200]};
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
  }
`;

const PatientDetailPanel = styled.div`
  width: 40%;
  background: ${theme.colors.gray[50]};

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchAndFilters = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  background: white;
  flex-shrink: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.gray[400]};
`;

const ClearSearchButton = styled.button`
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${theme.colors.gray[400]};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.gray[600]};
  }
`;

const FilterControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const ViewModeToggle = styled.div`
  display: flex;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  overflow: hidden;
`;

const ViewModeButton = styled.button`
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
  cursor: pointer;
  min-width: 140px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  background: white;
  color: ${theme.colors.gray[700]};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.gray[50]};
  }
`;

const AdvancedFilters = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${theme.colors.gray[200]};
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const ClearFiltersButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  background: white;
  color: ${theme.colors.gray[600]};
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: ${theme.colors.gray[50]};
  }
`;

const SearchInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${theme.colors.gray[200]};
  font-size: 14px;
  color: ${theme.colors.gray[600]};
`;

const PatientListContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const ResultsInfo = styled.div`
  font-size: 13px;
  color: ${theme.colors.gray[600]};
  margin-bottom: 16px;
`;

const PatientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PatientCardContainer = styled.div`
  border: 1px solid ${props => props.selected ? theme.colors.primary : theme.colors.gray[200]};
  border-radius: 12px;
  padding: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  ${props => props.selected && `box-shadow: 0 0 0 1px ${theme.colors.primary}20;`}

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const PatientCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const PatientAvatar = styled.div`
  width: ${props => props.small ? '32px' : '40px'};
  height: ${props => props.small ? '32px' : '40px'};
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-fallback {
    display: none;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, ${theme.colors.primary}, #6366f1);
    color: white;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.small ? '12px' : '14px'};
    font-weight: 600;
  }
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.status === 'active' ? theme.colors.success : theme.colors.gray[400]};
  border: 2px solid white;
`;

const FollowUpIndicator = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${theme.colors.warning};
  border: 2px solid white;
`;

const PatientBasicInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PatientName = styled.div`
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin-bottom: 2px;
  font-size: 14px;
`;

const PatientId = styled.div`
  font-size: 11px;
  color: ${theme.colors.gray[500]};
  margin-bottom: 2px;
`;

const PatientMeta = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray[600]};
`;

const PatientCardContent = styled.div`
  margin-bottom: 12px;
`;

const ContactInfo = styled.div`
  margin-bottom: 12px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${theme.colors.gray[600]};
  margin-bottom: 4px;
`;

const VisitInfo = styled.div`
  margin-bottom: 12px;
  font-size: 12px;

  > div {
    margin-bottom: 4px;
  }

  strong {
    color: ${theme.colors.gray[700]};
  }
`;

const ConditionsInfo = styled.div`
  font-size: 12px;

  strong {
    color: ${theme.colors.gray[700]};
    display: block;
    margin-bottom: 4px;
  }
`;

const ConditionTags = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const ConditionTag = styled.span`
  padding: 2px 6px;
  background: ${theme.colors.primary}10;
  color: ${theme.colors.primary};
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
`;

const PatientCardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: ${props => props.size === 'sm' ? '4px 8px' : '6px 12px'};
  border: 1px solid;
  border-radius: 6px;
  font-size: ${props => props.size === 'sm' ? '11px' : '12px'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary}10;
          border-color: ${theme.colors.primary}30;
          color: ${theme.colors.primary};
          &:hover { background: ${theme.colors.primary}20; }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.gray[100]};
          border-color: ${theme.colors.gray[300]};
          color: ${theme.colors.gray[700]};
          &:hover { background: ${theme.colors.gray[200]}; }
        `;
      case 'ghost':
        return `
          background: transparent;
          border-color: ${theme.colors.gray[300]};
          color: ${theme.colors.gray[600]};
          &:hover { background: ${theme.colors.gray[100]}; }
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          border-color: ${theme.colors.gray[300]};
          color: ${theme.colors.gray[700]};
          &:hover { background: ${theme.colors.gray[200]}; }
        `;
    }
  }}
`;

// Table Components
const PatientsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: ${theme.colors.gray[50]};
`;

const TableHeaderCell = styled.th`
  padding: 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.gray[700]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.gray[200]};
  cursor: pointer;
  transition: background-color 0.2s;
  ${props => props.selected && `background: ${theme.colors.primary}05;`}

  &:hover {
    background: ${theme.colors.gray[50]};
  }
`;

const TableCell = styled.td`
  padding: 12px;
  font-size: 13px;
  color: ${theme.colors.gray[700]};
  vertical-align: middle;
`;

const TablePatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TableActions = styled.div`
  display: flex;
  gap: 4px;
`;

const StatusBadge = styled.span`
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  text-transform: capitalize;
  
  ${props => {
    switch (props.status) {
      case 'active':
        return `background: ${theme.colors.success}20; color: ${theme.colors.success};`;
      case 'inactive':
        return `background: ${theme.colors.gray[200]}; color: ${theme.colors.gray[600]};`;
      case 'warning':
        return `background: ${theme.colors.warning}20; color: ${theme.colors.warning};`;
      case 'success':
        return `background: ${theme.colors.success}20; color: ${theme.colors.success};`;
      default:
        return `background: ${theme.colors.gray[200]}; color: ${theme.colors.gray[600]};`;
    }
  }}
`;

const FollowUpBadge = styled.span`
  margin-left: 4px;
  padding: 2px 6px;
  background: ${theme.colors.warning}20;
  color: ${theme.colors.warning};
  border-radius: 8px;
  font-size: 9px;
  font-weight: 500;
`;

// Patient Details Components
const EmptyPatientSelection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  height: 100%;
`;

const EmptyIcon = styled.div`
  color: ${theme.colors.gray[400]};
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.gray[700]};
  margin: 0 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.gray[500]};
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
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  background: white;
`;

const PatientDetailBasicInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PatientAvatarLarge = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-fallback {
    display: none;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, ${theme.colors.primary}, #6366f1);
    color: white;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
  }
`;

const PatientDetailInfo = styled.div`
  h2 {
    margin: 0 0 4px 0;
    font-size: 20px;
    color: ${theme.colors.gray[900]};
  }

  p {
    margin: 2px 0;
    font-size: 13px;
    color: ${theme.colors.gray[600]};
  }
`;

const PatientDetailActions = styled.div`
  display: flex;
  gap: 8px;
`;

const PatientTabNavigation = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  background: white;
`;

const TabButton = styled.button`
  padding: 12px 16px;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? theme.colors.primary : theme.colors.gray[600]};
  font-weight: ${props => props.active ? '600' : '500'};
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;

  &:hover {
    background: ${props => props.active ? 'white' : theme.colors.gray[50]};
  }
`;

const PatientTabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  background: white;
`;

// Overview Tab Components
const OverviewContent = styled.div`
  padding: 20px;
`;

const OverviewSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: ${theme.colors.gray[600]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.span`
  font-size: 13px;
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
  padding: 8px 12px;
  background: ${theme.colors.gray[50]};
  border-radius: 6px;
`;

const ConditionName = styled.span`
  font-size: 13px;
  color: ${theme.colors.gray[900]};
  font-weight: 500;
`;

const ConditionStatus = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  background: ${theme.colors.success}20;
  color: ${theme.colors.success};
  border-radius: 8px;
  font-weight: 500;
`;

// History Tab Components
const HistoryContent = styled.div`
  padding: 20px;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const HistoryStats = styled.div`
  display: flex;
  gap: 16px;
`;

const HistoryTimeline = styled.div`
  margin-top: 24px;
`;

const TimelineTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 16px 0;
`;

const TimelineItem = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${theme.colors.gray[200]};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const TimelineDate = styled.div`
  min-width: 80px;
  font-size: 12px;
  color: ${theme.colors.gray[600]};
  font-weight: 500;
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineDescription = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray[600]};
  margin-bottom: 4px;

  strong {
    color: ${theme.colors.gray[700]};
  }
`;

// Loading and Empty States
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const LoadingSpinner = styled.div`
  width: ${props => props.size === 'small' ? '16px' : '32px'};
  height: ${props => props.size === 'small' ? '16px' : '32px'};
  border: ${props => props.size === 'small' ? '2px' : '3px'} solid ${theme.colors.gray[200]};
  border-top: ${props => props.size === 'small' ? '2px' : '3px'} solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 12px;
  color: ${theme.colors.gray[600]};
  font-size: 14px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyHistoryState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  p {
    margin-bottom: 16px;
    color: ${theme.colors.gray[600]};
  }
`;

// Appointments and Documents Tab Components
const AppointmentsContent = styled.div`
  padding: 20px;
`;

const AppointmentsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 16px;
    color: ${theme.colors.gray[900]};
  }
`;

const DocumentsContent = styled.div`
  padding: 20px;
`;

const DocumentsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 16px;
    color: ${theme.colors.gray[900]};
  }
`;

export default PatientManagement;