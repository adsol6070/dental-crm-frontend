// @ts-nocheck
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDoctorDashboard } from '@/hooks/useDoctor'; 

interface Statistics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  rating: number;
  reviewCount: number;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ProfessionalInfo {
  specialization: string;
  qualifications: string[];
  experience: number;
  licenseNumber: string;
  department: string;
}

interface PatientInfo {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    alternatePhone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  _id: string;
  fullName: string;
  age: number;
  id: string;
}

interface Appointment {
  _id: string;
  appointmentStartTime: string;
  appointmentEndTime: string;
  patient: PatientInfo;
  doctor: string;
  appointmentType: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled';
  duration: number;
  priority: string;
  paymentStatus: string;
  paymentAmount: number;
  appointmentId: string;
  symptoms: string[];
  notes: string;
  specialRequirements: string;
}

interface Patient {
  id: string;
  name: string;
  lastVisit: string;
  nextAppointment: string;
  treatment: string;
  status: 'active' | 'pending' | 'completed';
}

interface MonthlyStats {
  _id: number;
  count: number;
}

interface DashboardData {
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  recentPatients: Patient[];
  statistics: Statistics;
  monthlyStats: MonthlyStats[];
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
}

const DoctorDashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useDoctorDashboard();
  const [currentTime, setCurrentTime] = useState(new Date());
  console.log("dashboard data", data);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateSuccessRate = (stats: Statistics): string => {
    if (stats.totalAppointments === 0) return 'N/A';
    return `${Math.round((stats.completedAppointments / stats.totalAppointments) * 100)}%`;
  };

  const getPatientName = (patient: PatientInfo): string => {
    return patient.fullName || `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`;
  };

  const getTodayStats = (appointments: Appointment[]) => {
    const today = new Date().toDateString();
    const todayAppts = appointments.filter(apt => 
      new Date(apt.appointmentStartTime).toDateString() === today
    );

    return {
      scheduled: todayAppts.filter(apt => apt.status === 'scheduled').length,
      checkedIn: todayAppts.filter(apt => apt.status === 'checked-in').length,
      inProgress: todayAppts.filter(apt => apt.status === 'in-progress').length,
      completed: todayAppts.filter(apt => apt.status === 'completed').length,
      cancelled: todayAppts.filter(apt => apt.status === 'cancelled').length,
      total: todayAppts.length
    };
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading your dashboard...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !data?.success) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <ErrorText>Unable to load dashboard</ErrorText>
        <ErrorSubtext>
          {error instanceof Error ? error.message : 'Please check your connection and try again.'}
        </ErrorSubtext>
        <RetryButton onClick={() => refetch()}>
          🔄 Retry
        </RetryButton>
      </ErrorContainer>
    );
  }

  const dashboardData = data.data;
  const todayStats = getTodayStats([...dashboardData.todayAppointments, ...dashboardData.upcomingAppointments]);
  const fullName = `Dr. ${dashboardData.personalInfo.firstName} ${dashboardData.personalInfo.lastName}`;

  return (
    <DashboardContainer>
      {/* Header */}
      <DashboardHeader>
        <HeaderLeft>
          <DoctorAvatar>
            {getInitials(dashboardData.personalInfo.firstName, dashboardData.personalInfo.lastName)}
          </DoctorAvatar>
          <DoctorInfo>
            <GreetingText>{getGreeting()}, {dashboardData.personalInfo.firstName}!</GreetingText>
            <DoctorName>{fullName}</DoctorName>
            <DoctorSpecialty>{dashboardData.professionalInfo.specialization} • {dashboardData.professionalInfo.department}</DoctorSpecialty>
            <CurrentDate>{formatDate(currentTime)} • {formatTime(currentTime.toISOString())}</CurrentDate>
          </DoctorInfo>
        </HeaderLeft>
        
        <HeaderStats>
          <StatItem>
            <StatValue>{dashboardData.statistics.totalAppointments}</StatValue>
            <StatLabel>Total Appointments</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{todayStats.total}</StatValue>
            <StatLabel>Today's Schedule</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{dashboardData.statistics.rating > 0 ? `${dashboardData.statistics.rating}/5` : 'New'}</StatValue>
            <StatLabel>Rating</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{dashboardData.professionalInfo.experience}Y</StatValue>
            <StatLabel>Experience</StatLabel>
          </StatItem>
        </HeaderStats>
      </DashboardHeader>

      {/* Today's Overview */}
      <OverviewSection>
        <SectionTitle>📊 Today's Overview</SectionTitle>
        <OverviewGrid>
          <OverviewCard>
            <CardIcon>📋</CardIcon>
            <CardContent>
              <CardValue>{todayStats.scheduled}</CardValue>
              <CardLabel>Scheduled</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard>
            <CardIcon>✅</CardIcon>
            <CardContent>
              <CardValue>{todayStats.checkedIn}</CardValue>
              <CardLabel>Checked In</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard>
            <CardIcon>🔄</CardIcon>
            <CardContent>
              <CardValue>{todayStats.inProgress}</CardValue>
              <CardLabel>In Progress</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard>
            <CardIcon>✨</CardIcon>
            <CardContent>
              <CardValue>{todayStats.completed}</CardValue>
              <CardLabel>Completed</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard>
            <CardIcon>❌</CardIcon>
            <CardContent>
              <CardValue>{todayStats.cancelled}</CardValue>
              <CardLabel>Cancelled</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard success>
            <CardIcon>📈</CardIcon>
            <CardContent>
              <CardValue>{calculateSuccessRate(dashboardData.statistics)}</CardValue>
              <CardLabel>Success Rate</CardLabel>
            </CardContent>
          </OverviewCard>
        </OverviewGrid>
      </OverviewSection>

      {/* Main Content */}
      <MainContent>
        {/* Appointments Section */}
        <AppointmentsSection>
          <SectionHeader>
            <SectionTitle>📅 {dashboardData.todayAppointments.length > 0 ? "Today's Appointments" : "Upcoming Appointments"}</SectionTitle>
            <ViewAllLink>View Schedule</ViewAllLink>
          </SectionHeader>
          
          {dashboardData.todayAppointments.length === 0 && dashboardData.upcomingAppointments.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📅</EmptyIcon>
              <EmptyTitle>No Appointments Scheduled</EmptyTitle>
              <EmptyMessage>You have no appointments for today. Take some time to relax or catch up on patient notes.</EmptyMessage>
              <ScheduleButton>Schedule New Appointment</ScheduleButton>
            </EmptyState>
          ) : (
            <AppointmentsList>
              {(dashboardData.todayAppointments.length > 0 
                ? dashboardData.todayAppointments 
                : dashboardData.upcomingAppointments.slice(0, 5)
              ).map((appointment) => (
                <AppointmentItem key={appointment._id}>
                  <AppointmentTime>
                    <TimeText>{formatTime(appointment.appointmentStartTime)}</TimeText>
                    <DurationText>{appointment.duration}min</DurationText>
                  </AppointmentTime>
                  
                  <AppointmentInfo>
                    <PatientName>{getPatientName(appointment.patient)}</PatientName>
                    <TreatmentType>{appointment.appointmentType}</TreatmentType>
                  </AppointmentInfo>
                  
                  <AppointmentStatus status={appointment.status}>
                    {appointment.status === 'checked-in' ? 'Checked In' :
                     appointment.status === 'in-progress' ? 'In Progress' :
                     appointment.status === 'completed' ? 'Completed' : 
                     appointment.status === 'cancelled' ? 'Cancelled' : 'Scheduled'}
                  </AppointmentStatus>
                </AppointmentItem>
              ))}
            </AppointmentsList>
          )}
        </AppointmentsSection>

        {/* Sidebar */}
        <Sidebar>
          {/* Performance Stats */}
          <PerformanceSection>
            <SectionTitle>📊 Performance</SectionTitle>
            <PerformanceGrid>
              <PerformanceCard>
                <PerformanceIcon>👥</PerformanceIcon>
                <PerformanceContent>
                  <PerformanceValue>{dashboardData.statistics.totalAppointments}</PerformanceValue>
                  <PerformanceLabel>Total Appointments</PerformanceLabel>
                </PerformanceContent>
              </PerformanceCard>
              
              <PerformanceCard>
                <PerformanceIcon>✅</PerformanceIcon>
                <PerformanceContent>
                  <PerformanceValue>{dashboardData.statistics.completedAppointments}</PerformanceValue>
                  <PerformanceLabel>Completed</PerformanceLabel>
                </PerformanceContent>
              </PerformanceCard>
              
              <PerformanceCard>
                <PerformanceIcon>⭐</PerformanceIcon>
                <PerformanceContent>
                  <PerformanceValue>{dashboardData.statistics.reviewCount}</PerformanceValue>
                  <PerformanceLabel>Reviews</PerformanceLabel>
                </PerformanceContent>
              </PerformanceCard>
              
              <PerformanceCard>
                <PerformanceIcon>🎯</PerformanceIcon>
                <PerformanceContent>
                  <PerformanceValue>{calculateSuccessRate(dashboardData.statistics)}</PerformanceValue>
                  <PerformanceLabel>Success Rate</PerformanceLabel>
                </PerformanceContent>
              </PerformanceCard>
            </PerformanceGrid>
          </PerformanceSection>

          {/* Recent Patients */}
          {/* <RecentPatientsSection>
            <SectionHeader>
              <SectionTitle>👥 Recent Patients</SectionTitle>
              <ViewAllLink>View All</ViewAllLink>
            </SectionHeader>
            
            {dashboardData.recentPatients.length === 0 ? (
              <EmptyPatientsState>
                <EmptyPatientIcon>👥</EmptyPatientIcon>
                <EmptyPatientText>No recent patients</EmptyPatientText>
                <EmptyPatientSubtext>Your recent patient visits will appear here</EmptyPatientSubtext>
              </EmptyPatientsState>
            ) : (
              <PatientsList>
                {dashboardData.recentPatients.slice(0, 4).map((patient) => (
                  <PatientItem key={patient.id}>
                    <PatientAvatar>
                      {(patient.name || "").split(' ').map((n: string) => n[0]).join('')}
                    </PatientAvatar>
                    
                    <PatientInfo>
                      <PatientName>{patient.name}</PatientName>
                      <PatientDetails>
                        <DetailText>Last: {patient.lastVisit}</DetailText>
                        <DetailText>Next: {patient.nextAppointment}</DetailText>
                        <TreatmentText>{patient.treatment}</TreatmentText>
                      </PatientDetails>
                    </PatientInfo>
                    
                    <PatientStatus status={patient.status}>
                      {patient.status}
                    </PatientStatus>
                  </PatientItem>
                ))}
              </PatientsList>
            )}
          </RecentPatientsSection> */}

          {/* Quick Actions */}
          {/* <QuickActionsSection>
            <SectionTitle>⚡ Quick Actions</SectionTitle>
            <ActionsList>
              <ActionItem>
                <ActionIcon>📅</ActionIcon>
                <ActionLabel>Schedule Appointment</ActionLabel>
                <ActionArrow>→</ActionArrow>
              </ActionItem>
              
              <ActionItem>
                <ActionIcon>👤</ActionIcon>
                <ActionLabel>Add New Patient</ActionLabel>
                <ActionArrow>→</ActionArrow>
              </ActionItem>
              
              <ActionItem>
                <ActionIcon>📝</ActionIcon>
                <ActionLabel>Update Profile</ActionLabel>
                <ActionArrow>→</ActionArrow>
              </ActionItem>
              
              <ActionItem>
                <ActionIcon>📊</ActionIcon>
                <ActionLabel>View Reports</ActionLabel>
                <ActionArrow>→</ActionArrow>
              </ActionItem>

              <ActionItem>
                <ActionIcon>🗓️</ActionIcon>
                <ActionLabel>Manage Schedule</ActionLabel>
                <ActionArrow>→</ActionArrow>
              </ActionItem>
            </ActionsList>
          </QuickActionsSection> */}

          {/* Professional Info */}
          <ProfessionalInfoSection>
            <SectionTitle>👨‍⚕️ Professional Info</SectionTitle>
            <InfoList>
              <InfoItem>
                <InfoIcon>🏥</InfoIcon>
                <InfoContent>
                  <InfoLabel>Department</InfoLabel>
                  <InfoValue>{dashboardData.professionalInfo.department}</InfoValue>
                </InfoContent>
              </InfoItem>
              
              <InfoItem>
                <InfoIcon>🎓</InfoIcon>
                <InfoContent>
                  <InfoLabel>Qualifications</InfoLabel>
                  <InfoValue>{dashboardData.professionalInfo.qualifications.join(', ')}</InfoValue>
                </InfoContent>
              </InfoItem>
              
              <InfoItem>
                <InfoIcon>🆔</InfoIcon>
                <InfoContent>
                  <InfoLabel>License</InfoLabel>
                  <InfoValue>{dashboardData.professionalInfo.licenseNumber}</InfoValue>
                </InfoContent>
              </InfoItem>
            </InfoList>
          </ProfessionalInfoSection>
        </Sidebar>
      </MainContent>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 16px;
    gap: 16px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 12px;
  text-align: center;
  padding: 40px 20px;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ErrorSubtext = styled.div`
  color: #6b7280;
  font-size: 14px;
  max-width: 400px;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 32px;
  border-radius: 16px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    text-align: center;
    padding: 20px 24px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const DoctorAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
`;

const DoctorInfo = styled.div``;

const GreetingText = styled.div`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
  font-weight: 500;
`;

const DoctorName = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const DoctorSpecialty = styled.div`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
  font-weight: 500;
`;

const CurrentDate = styled.div`
  font-size: 12px;
  opacity: 0.8;
  font-weight: 400;
`;

const HeaderStats = styled.div`
  display: flex;
  gap: 32px;
  
  @media (max-width: 768px) {
    justify-content: center;
    gap: 24px;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const OverviewSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const OverviewCard = styled.div<{ success?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: ${props => props.success ? '#f0f9ff' : 'white'};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardIcon = styled.div`
  font-size: 18px;
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2px;
`;

const CardLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const AppointmentsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ViewAllLink = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.2s ease;
  
  &:hover {
    color: #2563eb;
    text-decoration: underline;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
  max-width: 300px;
  line-height: 1.5;
`;

const ScheduleButton = styled.button`
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
`;

const AppointmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AppointmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #e2e8f0;
    background: #f9fafb;
    transform: translateY(-1px);
  }
`;

const AppointmentTime = styled.div`
  min-width: 80px;
  text-align: center;
`;

const TimeText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 2px;
`;

const DurationText = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const AppointmentInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const TreatmentType = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const AppointmentStatus = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: ${props => {
    switch (props.status) {
      case 'checked-in': return '#dbeafe';
      case 'in-progress': return '#fef3c7';
      case 'completed': return '#d1fae5';
      case 'cancelled': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'checked-in': return '#1e40af';
      case 'in-progress': return '#92400e';
      case 'completed': return '#065f46';
      case 'cancelled': return '#dc2626';
      default: return '#374151';
    }
  }};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PerformanceSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const PerformanceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const PerformanceCard = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #f3f4f6;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #e2e8f0;
    background: #f9fafb;
  }
`;

const PerformanceIcon = styled.div`
  font-size: 16px;
`;

const PerformanceContent = styled.div`
  flex: 1;
`;

const PerformanceValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
`;

const PerformanceLabel = styled.div`
  font-size: 10px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const RecentPatientsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const EmptyPatientsState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
`;

const EmptyPatientIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
`;

const EmptyPatientText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
`;

const EmptyPatientSubtext = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const PatientsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PatientItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #e2e8f0;
    background: #f9fafb;
    transform: translateY(-1px);
  }
`;

const PatientAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
`;

const PatientInfo = styled.div`
  flex: 1;
`;

const PatientDetails = styled.div`
  margin-top: 4px;
`;

const DetailText = styled.div`
  font-size: 10px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const TreatmentText = styled.div`
  font-size: 11px;
  color: #3b82f6;
  font-weight: 500;
`;

const PatientStatus = styled.span<{ status: string }>`
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: ${props => {
    switch (props.status) {
      case 'active': return '#d1fae5';
      case 'pending': return '#fef3c7';
      case 'completed': return '#e0e7ff';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#065f46';
      case 'pending': return '#92400e';
      case 'completed': return '#3730a3';
      default: return '#374151';
    }
  }};
`;

const QuickActionsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const ActionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const ActionIcon = styled.div`
  font-size: 16px;
`;

const ActionLabel = styled.div`
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
`;

const ActionArrow = styled.div`
  font-size: 14px;
  color: #9ca3af;
  transition: color 0.2s ease;
  
  ${ActionItem}:hover & {
    color: #3b82f6;
  }
`;

const ProfessionalInfoSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
`;

const InfoIcon = styled.div`
  font-size: 16px;
  margin-top: 2px;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
  line-height: 1.4;
`;

export default DoctorDashboard;