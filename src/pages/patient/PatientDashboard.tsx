// @ts-nocheck
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/config/theme.config';
import { usePatientDashboard } from '@/hooks/usePatient'; 

// Types based on your API response
interface Doctor {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  professionalInfo: {
    specialization: string;
    qualifications: string[];
    experience: number;
    licenseNumber: string;
    department: string;
  };
  _id: string;
  fullName: string;
  id: string;
}

interface Appointment {
  _id: string;
  patient: string;
  doctor: Doctor;
  appointmentDateTime: string;
  duration: number;
  appointmentType: string;
  status: string;
  priority: string;
  bookingSource: string;
  symptoms: string[];
  notes: string;
  specialRequirements: string;
  remindersSent: number;
  paymentStatus: string;
  paymentAmount: number;
  appointmentId: string;
  createdAt: string;
  updatedAt: string;
  endDateTime: string;
  id: string;
  consultation?: {
    diagnosis: string;
    followUpRequired: boolean;
  };
}

interface Statistics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowCount: number;
  lastVisit: string;
}

interface MonthlyStats {
  _id: number;
  count: number;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
}

interface Preferences {
  reminderSettings: {
    enableReminders: boolean;
    reminderTime: number;
  };
  preferredLanguage: string;
  communicationMethod: string;
}

interface PatientDashboardData {
  upcomingAppointments: Appointment[];
  recentAppointments: Appointment[];
  statistics: Statistics;
  monthlyStats: MonthlyStats[];
  personalInfo: PersonalInfo;
  preferences: Preferences;
}

const UserDashboard = () => {
  const { data, isLoading, isError, error } = usePatientDashboard();
  const dashboardData: PatientDashboardData | undefined = data?.data;

  const calculateDaysUntil = (dateString: string): number => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'scheduled': return '#3b82f6';
      case 'confirmed': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusBackground = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'scheduled': return '#dbeafe';
      case 'confirmed': return '#d1fae5';
      case 'completed': return '#f3f4f6';
      case 'cancelled': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  const getPaymentStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getNextAppointment = () => {
    if (!dashboardData?.upcomingAppointments?.length) return null;
    return dashboardData.upcomingAppointments
      .sort((a, b) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime())[0];
  };

  const getThisYearTotal = () => {
    const currentYear = new Date().getFullYear();
    return dashboardData?.monthlyStats?.reduce((total, month) => total + month.count, 0) || 0;
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading your dashboard...</LoadingText>
      </LoadingContainer>
    );
  }

  if (isError || !dashboardData) {
    return (
      <ErrorContainer>
        <ErrorText>
          {error ? `Error: ${(error as Error).message}` : 'Unable to load dashboard data'}
        </ErrorText>
      </ErrorContainer>
    );
  }

  const nextAppointment = getNextAppointment();
  const fullName = `${dashboardData.personalInfo.firstName} ${dashboardData.personalInfo.lastName}`;
  const age = calculateAge(dashboardData.personalInfo.dateOfBirth);

  return (
    <DashboardContainer>
      {/* Header Section */}
      <DashboardHeader>
        <PersonalHealthCard>
          <ProfileSection>
            <ProfilePicture>
              <ProfileInitials>
                {dashboardData.personalInfo.firstName[0]}{dashboardData.personalInfo.lastName[0]}
              </ProfileInitials>
            </ProfilePicture>
            <ProfileInfo>
              <PatientName>{fullName}</PatientName>
              <PatientDetails>
                <DetailItem>Age: {age}</DetailItem>
                <DetailItem>Blood Group: {dashboardData.personalInfo.bloodGroup}</DetailItem>
                <DetailItem>Gender: {dashboardData.personalInfo.gender}</DetailItem>
              </PatientDetails>
              <VerificationBadge verified={true}>
                ✓ Active Patient
              </VerificationBadge>
            </ProfileInfo>
          </ProfileSection>
        </PersonalHealthCard>

        <QuickStatsGrid>
          <StatCard>
            <StatIcon>📅</StatIcon>
            <StatContent>
              <StatValue>
                {nextAppointment 
                  ? `${calculateDaysUntil(nextAppointment.appointmentDateTime)} days`
                  : 'None scheduled'
                }
              </StatValue>
              <StatLabel>Next Appointment</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon>📊</StatIcon>
            <StatContent>
              <StatValue>{getThisYearTotal()}</StatValue>
              <StatLabel>Appointments This Year</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon>🕒</StatIcon>
            <StatContent>
              <StatValue>
                {dashboardData.statistics.lastVisit 
                  ? formatDate(dashboardData.statistics.lastVisit)
                  : 'No visits'
                }
              </StatValue>
              <StatLabel>Last Visit</StatLabel>
            </StatContent>
          </StatCard>
        </QuickStatsGrid>
      </DashboardHeader>

      {/* Quick Actions Section */}
      {/* <QuickActionsSection>
        <SectionTitle>Quick Actions</SectionTitle>
        <ActionsGrid>
          <ActionCard>
            <ActionIcon>📅</ActionIcon>
            <ActionContent>
              <ActionTitle>Book New Appointment</ActionTitle>
              <ActionDescription>Schedule your next visit</ActionDescription>
            </ActionContent>
          </ActionCard>
          
          <ActionCard>
            <ActionIcon>📋</ActionIcon>
            <ActionContent>
              <ActionTitle>View My Appointments</ActionTitle>
              <ActionDescription>See upcoming and past visits</ActionDescription>
            </ActionContent>
          </ActionCard>
          
          <ActionCard>
            <ActionIcon>🏥</ActionIcon>
            <ActionContent>
              <ActionTitle>Medical Records</ActionTitle>
              <ActionDescription>Access your health history</ActionDescription>
            </ActionContent>
          </ActionCard>
          
          <ActionCard>
            <ActionIcon>🚨</ActionIcon>
            <ActionContent>
              <ActionTitle>Emergency Services</ActionTitle>
              <ActionDescription>24/7 emergency support</ActionDescription>
            </ActionContent>
          </ActionCard>
          
          <ActionCard>
            <ActionIcon>👨‍⚕️</ActionIcon>
            <ActionContent>
              <ActionTitle>Contact Doctor</ActionTitle>
              <ActionDescription>Message your healthcare provider</ActionDescription>
            </ActionContent>
          </ActionCard>
          
          <ActionCard>
            <ActionIcon>⚙️</ActionIcon>
            <ActionContent>
              <ActionTitle>Update Profile</ActionTitle>
              <ActionDescription>Manage your information</ActionDescription>
            </ActionContent>
          </ActionCard>
        </ActionsGrid>
      </QuickActionsSection> */}

      {/* Main Content Grid */}
      <MainContentGrid>
        {/* Health Overview - Upcoming Appointments */}
        <HealthOverviewCard>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <StatusIndicator status="active">
              {dashboardData.upcomingAppointments.length} Scheduled
            </StatusIndicator>
          </CardHeader>
          
          {dashboardData.upcomingAppointments.length > 0 ? (
            <AppointmentsList>
              {dashboardData.upcomingAppointments.slice(0, 3).map((appointment) => (
                <AppointmentItem key={appointment.id}>
                  <AppointmentHeader>
                    <AppointmentDate>
                      {formatDate(appointment.appointmentDateTime)}
                    </AppointmentDate>
                    <AppointmentTime>
                      {formatTime(appointment.appointmentDateTime)}
                    </AppointmentTime>
                  </AppointmentHeader>
                  <AppointmentInfo>
                    <DoctorName>{appointment.doctor.fullName}</DoctorName>
                    <DepartmentName>{appointment.doctor.professionalInfo.department}</DepartmentName>
                    <AppointmentDetails>
                      <AppointmentType>{appointment.appointmentType}</AppointmentType>
                      <StatusBadge 
                        color={getStatusColor(appointment.status)}
                        background={getStatusBackground(appointment.status)}
                      >
                        {appointment.status}
                      </StatusBadge>
                    </AppointmentDetails>
                  </AppointmentInfo>
                  <PaymentInfo>
                    <PaymentAmount>₹{appointment.paymentAmount}</PaymentAmount>
                    <PaymentStatus color={getPaymentStatusColor(appointment.paymentStatus)}>
                      {appointment.paymentStatus}
                    </PaymentStatus>
                  </PaymentInfo>
                </AppointmentItem>
              ))}
            </AppointmentsList>
          ) : (
            <EmptyState>
              <EmptyIcon>📅</EmptyIcon>
              <EmptyTitle>No upcoming appointments</EmptyTitle>
              <EmptyDescription>Book your next appointment to maintain your health</EmptyDescription>
            </EmptyState>
          )}

          {/* Health Statistics */}
          <HealthSection>
            <HealthSectionTitle>Health Statistics</HealthSectionTitle>
            <StatsGrid>
              <StatItem>
                <StatItemLabel>Total Appointments</StatItemLabel>
                <StatItemValue>{dashboardData.statistics.totalAppointments}</StatItemValue>
              </StatItem>
              <StatItem>
                <StatItemLabel>Completed</StatItemLabel>
                <StatItemValue>{dashboardData.statistics.completedAppointments}</StatItemValue>
              </StatItem>
              <StatItem>
                <StatItemLabel>Cancelled</StatItemLabel>
                <StatItemValue>{dashboardData.statistics.cancelledAppointments}</StatItemValue>
              </StatItem>
              <StatItem>
                <StatItemLabel>No Shows</StatItemLabel>
                <StatItemValue>{dashboardData.statistics.noShowCount}</StatItemValue>
              </StatItem>
            </StatsGrid>
          </HealthSection>

          {/* Monthly Activity Chart */}
          <HealthSection>
            <HealthSectionTitle>Monthly Activity</HealthSectionTitle>
            <MonthlyChart>
              {dashboardData.monthlyStats.map((month) => (
                <MonthlyBar key={month._id}>
                  <MonthlyBarFill height={Math.min((month.count / 10) * 100, 100)}>
                    {month.count}
                  </MonthlyBarFill>
                  <MonthLabel>
                    {new Date(2025, month._id - 1).toLocaleDateString('en-US', { month: 'short' })}
                  </MonthLabel>
                </MonthlyBar>
              ))}
            </MonthlyChart>
          </HealthSection>
        </HealthOverviewCard>

        {/* Recent Activity */}
        <RecentActivityCard>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <ViewAllLink>View All</ViewAllLink>
          </CardHeader>
          
          {dashboardData.recentAppointments.length > 0 ? (
            <ActivityList>
              {dashboardData.recentAppointments.map((appointment) => (
                <ActivityItem key={appointment.id}>
                  <ActivityIcon type="appointment">
                    👨‍⚕️
                  </ActivityIcon>
                  <ActivityInfo>
                    <ActivityTitle>{appointment.doctor.fullName}</ActivityTitle>
                    <ActivityDescription>
                      {appointment.doctor.professionalInfo.specialization}
                    </ActivityDescription>
                    <ActivityDate>{formatDate(appointment.appointmentDateTime)}</ActivityDate>
                    {appointment.consultation && (
                      <DiagnosisNote>
                        Diagnosis: {appointment.consultation.diagnosis}
                      </DiagnosisNote>
                    )}
                  </ActivityInfo>
                  <ActivityStatus status={appointment.status}>
                    {appointment.status}
                  </ActivityStatus>
                </ActivityItem>
              ))}
            </ActivityList>
          ) : (
            <EmptyState>
              <EmptyIcon>📋</EmptyIcon>
              <EmptyTitle>No recent appointments</EmptyTitle>
              <EmptyDescription>Your appointment history will appear here</EmptyDescription>
            </EmptyState>
          )}
        </RecentActivityCard>

        {/* Next Appointment Card */}
        {nextAppointment && (
          <NextAppointmentCard>
            <CardHeader>
              <CardTitle>Next Appointment</CardTitle>
              <CountdownBadge>
                {calculateDaysUntil(nextAppointment.appointmentDateTime)} days
              </CountdownBadge>
            </CardHeader>
            
            <AppointmentDetailsCard>
              <AppointmentDate>
                {formatDate(nextAppointment.appointmentDateTime)}
              </AppointmentDate>
              <AppointmentTime>
                {formatTime(nextAppointment.appointmentDateTime)}
              </AppointmentTime>
              <AppointmentDoctor>
                with {nextAppointment.doctor.fullName}
              </AppointmentDoctor>
              <AppointmentType>
                {nextAppointment.appointmentType} - {nextAppointment.doctor.professionalInfo.specialization}
              </AppointmentType>
              <AppointmentLocation>
                {nextAppointment.doctor.professionalInfo.department}
              </AppointmentLocation>
              
              {nextAppointment.symptoms.length > 0 && (
                <SymptomsSection>
                  <SymptomsTitle>Reported Symptoms:</SymptomsTitle>
                  <SymptomsList>
                    {nextAppointment.symptoms.join(', ')}
                  </SymptomsList>
                </SymptomsSection>
              )}
              
              {nextAppointment.notes && (
                <NotesSection>
                  <NotesTitle>Notes:</NotesTitle>
                  <NotesText>{nextAppointment.notes}</NotesText>
                </NotesSection>
              )}
            </AppointmentDetailsCard>
            
            {/* <AppointmentActions>
              <ActionButton variant="primary">Join Video Call</ActionButton>
              <ActionButton variant="secondary">Reschedule</ActionButton>
            </AppointmentActions> */}
          </NextAppointmentCard>
        )}

        {/* Patient Preferences Card */}
        <PreferencesCard>
          <CardHeader>
            <CardTitle>Your Preferences</CardTitle>
          </CardHeader>
          
          <PreferencesList>
            <PreferenceItem>
              <PreferenceLabel>Preferred Language</PreferenceLabel>
              <PreferenceValue>{dashboardData.preferences.preferredLanguage}</PreferenceValue>
            </PreferenceItem>
            
            <PreferenceItem>
              <PreferenceLabel>Communication Method</PreferenceLabel>
              <PreferenceValue>{dashboardData.preferences.communicationMethod}</PreferenceValue>
            </PreferenceItem>
            
            <PreferenceItem>
              <PreferenceLabel>Reminders</PreferenceLabel>
              <PreferenceValue>
                {dashboardData.preferences.reminderSettings.enableReminders ? 
                  `Enabled (${dashboardData.preferences.reminderSettings.reminderTime}h before)` : 
                  'Disabled'
                }
              </PreferenceValue>
            </PreferenceItem>
          </PreferencesList>
        </PreferencesCard>
      </MainContentGrid>
    </DashboardContainer>
  );
};

// Additional Styled Components for new features
const AppointmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const AppointmentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const AppointmentHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
`;

const AppointmentInfo = styled.div`
  flex: 1;
  margin: 0 16px;
  
  @media (max-width: 768px) {
    margin: 0;
  }
`;

const DoctorName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
`;

const DepartmentName = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const AppointmentDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusBadge = styled.span<{ color: string; background: string }>`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  color: ${props => props.color};
  background: ${props => props.background};
`;

const PaymentInfo = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PaymentAmount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
`;

const PaymentStatus = styled.div<{ color: string }>`
  font-size: 11px;
  font-weight: 500;
  color: ${props => props.color};
  text-transform: capitalize;
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
  font-size: 32px;
  margin-bottom: 12px;
`;

const EmptyTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const EmptyDescription = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
`;

const StatItemLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const StatItemValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.primary};
`;

const MonthlyChart = styled.div`
  display: flex;
  align-items: end;
  gap: 8px;
  height: 80px;
  padding: 16px 0;
`;

const MonthlyBar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const MonthlyBarFill = styled.div<{ height: number }>`
  width: 100%;
  height: ${props => props.height}%;
  background: linear-gradient(to top, ${theme.colors.primary}, ${theme.colors.primary}80);
  border-radius: 4px;
  display: flex;
  align-items: end;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding-bottom: 4px;
  min-height: 20px;
`;

const MonthLabel = styled.div`
  font-size: 10px;
  color: #6b7280;
  margin-top: 4px;
`;

const DiagnosisNote = styled.div`
  font-size: 11px;
  color: ${theme.colors.primary};
  font-style: italic;
  margin-top: 4px;
`;

const AppointmentDetailsCard = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

const AppointmentLocation = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const SymptomsSection = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #fef3c7;
  border-radius: 6px;
  text-align: left;
`;

const SymptomsTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 4px;
`;

const SymptomsList = styled.div`
  font-size: 12px;
  color: #92400e;
`;

const NotesSection = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  text-align: left;
`;

const NotesTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 4px;
`;

const NotesText = styled.div`
  font-size: 12px;
  color: #1e40af;
`;

const PreferencesCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-top: 20px;
`;

const PreferencesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PreferenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const PreferenceLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const PreferenceValue = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
`;

// Keep all existing styled components from the original code...
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 12px;
  color: #6b7280;
  font-size: 14px;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 16px;
`;

const DashboardHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const PersonalHealthCard = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary || '#6366f1'} 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ProfilePicture = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfileInitials = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: white;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const PatientDetails = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const DetailItem = styled.span`
  font-size: 13px;
  opacity: 0.9;
`;

const VerificationBadge = styled.div<{ verified: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.verified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'};
  color: ${props => props.verified ? '#10b981' : '#f59e0b'};
  border: 1px solid ${props => props.verified ? '#10b981' : '#f59e0b'};
`;

const QuickStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatIcon = styled.div`
  font-size: 20px;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.primary};
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const QuickActionsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const ActionCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${theme.colors.primary};
    background: #f8fafc;
    transform: translateY(-1px);
  }
`;

const ActionIcon = styled.div`
  font-size: 16px;
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
`;

const ActionDescription = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const MainContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const HealthOverviewCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const RecentActivityCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const NextAppointmentCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-top: 20px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const StatusIndicator = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.status === 'good' || props.status === 'active' ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.status === 'good' || props.status === 'active' ? '#065f46' : '#991b1b'};
`;

const ViewAllLink = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CountdownBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
`;

const HealthSection = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const HealthSectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 0 0 8px 0;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
`;

const ActivityIcon = styled.div<{ type: string }>`
  font-size: 16px;
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
`;

const ActivityDescription = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const ActivityDate = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const ActivityStatus = styled.span<{ status: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  background: ${props => {
    switch (props.status.toLowerCase()) {
      case 'completed': return '#d1fae5';
      case 'confirmed': return '#dbeafe';
      case 'scheduled': return '#fef3c7';
      case 'cancelled': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status.toLowerCase()) {
      case 'completed': return '#065f46';
      case 'confirmed': return '#1e40af';
      case 'scheduled': return '#92400e';
      case 'cancelled': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

const AppointmentDate = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.primary};
  margin-bottom: 4px;
`;

const AppointmentTime = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const AppointmentDoctor = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
`;

const AppointmentType = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const AppointmentActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' ? `
    background: ${theme.colors.primary};
    color: white;
    border: 1px solid ${theme.colors.primary};
    
    &:hover {
      background: ${theme.colors.primary}dd;
    }
  ` : `
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f9fafb;
    }
  `}
`;

export default UserDashboard;