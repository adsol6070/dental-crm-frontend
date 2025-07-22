import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/config/theme.config';

interface PatientData {
  id: string;
  name: string;
  age: number;
  profilePicture?: string;
  patientId: string;
  isVerified: boolean;
  nextAppointment?: {
    date: Date;
    doctor: string;
    type: string;
  };
  totalAppointmentsThisYear: number;
  lastVisitDate?: Date;
  currentMedications: Array<{
    name: string;
    dosage: string;
    schedule: string;
    nextDose: Date;
  }>;
  allergies: string[];
  upcomingReminders: Array<{
    type: string;
    date: Date;
    description: string;
  }>;
  recentActivity: Array<{
    type: 'appointment' | 'prescription' | 'lab';
    title: string;
    date: Date;
    status: string;
  }>;
}

const UserDashboard = () => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchPatientData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: PatientData = {
        id: '1',
        name: 'John Doe',
        age: 34,
        patientId: 'PAT-2024-001',
        isVerified: true,
        nextAppointment: {
          date: new Date('2024-07-15T10:00:00'),
          doctor: 'Dr. Sarah Wilson',
          type: 'General Checkup'
        },
        totalAppointmentsThisYear: 8,
        lastVisitDate: new Date('2024-06-20'),
        currentMedications: [
          {
            name: 'Lisinopril',
            dosage: '10mg',
            schedule: 'Once daily',
            nextDose: new Date('2024-07-04T08:00:00')
          },
          {
            name: 'Metformin',
            dosage: '500mg',
            schedule: 'Twice daily',
            nextDose: new Date('2024-07-03T20:00:00')
          }
        ],
        allergies: ['Penicillin', 'Shellfish'],
        upcomingReminders: [
          {
            type: 'Lab Test',
            date: new Date('2024-07-10'),
            description: 'Annual blood work'
          },
          {
            type: 'Medication Refill',
            date: new Date('2024-07-08'),
            description: 'Lisinopril prescription expires'
          }
        ],
        recentActivity: [
          {
            type: 'appointment',
            title: 'Follow-up with Dr. Wilson',
            date: new Date('2024-06-20'),
            status: 'Completed'
          },
          {
            type: 'prescription',
            title: 'Metformin prescription renewed',
            date: new Date('2024-06-18'),
            status: 'Active'
          },
          {
            type: 'lab',
            title: 'Blood glucose test',
            date: new Date('2024-06-15'),
            status: 'Results pending'
          }
        ]
      };
      
      setPatientData(mockData);
      setLoading(false);
    };

    fetchPatientData();
  }, []);

  const calculateDaysUntil = (date: Date): number => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading your dashboard...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!patientData) {
    return (
      <ErrorContainer>
        <ErrorText>Unable to load dashboard data</ErrorText>
      </ErrorContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Header Section */}
      <DashboardHeader>
        <PersonalHealthCard>
          <ProfileSection>
            <ProfilePicture>
              {patientData.profilePicture ? (
                <img src={patientData.profilePicture} alt="Profile" />
              ) : (
                <ProfileInitials>
                  {patientData.name.split(' ').map(n => n[0]).join('')}
                </ProfileInitials>
              )}
            </ProfilePicture>
            <ProfileInfo>
              <PatientName>{patientData.name}</PatientName>
              <PatientDetails>
                <DetailItem>Age: {patientData.age}</DetailItem>
                <DetailItem>ID: {patientData.patientId}</DetailItem>
              </PatientDetails>
              <VerificationBadge verified={patientData.isVerified}>
                {patientData.isVerified ? '✓ Verified' : '⚠ Pending Verification'}
              </VerificationBadge>
            </ProfileInfo>
          </ProfileSection>
        </PersonalHealthCard>

        <QuickStatsGrid>
          <StatCard>
            <StatIcon>📅</StatIcon>
            <StatContent>
              <StatValue>
                {patientData.nextAppointment 
                  ? `${calculateDaysUntil(patientData.nextAppointment.date)} days`
                  : 'None scheduled'
                }
              </StatValue>
              <StatLabel>Next Appointment</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon>📊</StatIcon>
            <StatContent>
              <StatValue>{patientData.totalAppointmentsThisYear}</StatValue>
              <StatLabel>Appointments This Year</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon>🕒</StatIcon>
            <StatContent>
              <StatValue>
                {patientData.lastVisitDate 
                  ? formatDate(patientData.lastVisitDate)
                  : 'No visits'
                }
              </StatValue>
              <StatLabel>Last Visit</StatLabel>
            </StatContent>
          </StatCard>
        </QuickStatsGrid>
      </DashboardHeader>

      {/* Quick Actions Section */}
      <QuickActionsSection>
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
      </QuickActionsSection>

      {/* Main Content Grid */}
      <MainContentGrid>
        {/* Health Overview */}
        <HealthOverviewCard>
          <CardHeader>
            <CardTitle>Health Overview</CardTitle>
            <StatusIndicator status="good">Good</StatusIndicator>
          </CardHeader>
          
          <HealthSection>
            <HealthSectionTitle>Active Medications</HealthSectionTitle>
            <MedicationList>
              {patientData.currentMedications.map((med, index) => (
                <MedicationItem key={index}>
                  <MedicationInfo>
                    <MedicationName>{med.name} {med.dosage}</MedicationName>
                    <MedicationSchedule>{med.schedule}</MedicationSchedule>
                  </MedicationInfo>
                  <NextDose>
                    Next: {formatTime(med.nextDose)}
                  </NextDose>
                </MedicationItem>
              ))}
            </MedicationList>
          </HealthSection>

          <HealthSection>
            <HealthSectionTitle>Upcoming Reminders</HealthSectionTitle>
            <ReminderList>
              {patientData.upcomingReminders.map((reminder, index) => (
                <ReminderItem key={index}>
                  <ReminderIcon>⏰</ReminderIcon>
                  <ReminderInfo>
                    <ReminderType>{reminder.type}</ReminderType>
                    <ReminderDescription>{reminder.description}</ReminderDescription>
                    <ReminderDate>{formatDate(reminder.date)}</ReminderDate>
                  </ReminderInfo>
                </ReminderItem>
              ))}
            </ReminderList>
          </HealthSection>

          {patientData.allergies.length > 0 && (
            <AllergyAlert>
              <AlertIcon>⚠️</AlertIcon>
              <AlertContent>
                <AlertTitle>Allergy Alerts</AlertTitle>
                <AllergyList>
                  {patientData.allergies.join(', ')}
                </AllergyList>
              </AlertContent>
            </AllergyAlert>
          )}
        </HealthOverviewCard>

        {/* Recent Activity */}
        <RecentActivityCard>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <ViewAllLink>View All</ViewAllLink>
          </CardHeader>
          
          <ActivityList>
            {patientData.recentActivity.map((activity, index) => (
              <ActivityItem key={index}>
                <ActivityIcon type={activity.type}>
                  {activity.type === 'appointment' ? '👨‍⚕️' : 
                   activity.type === 'prescription' ? '💊' : '🧪'}
                </ActivityIcon>
                <ActivityInfo>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityDate>{formatDate(activity.date)}</ActivityDate>
                </ActivityInfo>
                <ActivityStatus status={activity.status}>
                  {activity.status}
                </ActivityStatus>
              </ActivityItem>
            ))}
          </ActivityList>
        </RecentActivityCard>

        {/* Next Appointment Card */}
        {patientData.nextAppointment && (
          <NextAppointmentCard>
            <CardHeader>
              <CardTitle>Next Appointment</CardTitle>
              <CountdownBadge>
                {calculateDaysUntil(patientData.nextAppointment.date)} days
              </CountdownBadge>
            </CardHeader>
            
            <AppointmentDetails>
              <AppointmentDate>
                {formatDate(patientData.nextAppointment.date)}
              </AppointmentDate>
              <AppointmentTime>
                {formatTime(patientData.nextAppointment.date)}
              </AppointmentTime>
              <AppointmentDoctor>
                with {patientData.nextAppointment.doctor}
              </AppointmentDoctor>
              <AppointmentType>
                {patientData.nextAppointment.type}
              </AppointmentType>
            </AppointmentDetails>
            
            <AppointmentActions>
              <ActionButton variant="primary">Join Video Call</ActionButton>
              <ActionButton variant="secondary">Reschedule</ActionButton>
            </AppointmentActions>
          </NextAppointmentCard>
        )}
      </MainContentGrid>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
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
  background: ${props => props.status === 'good' ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.status === 'good' ? '#065f46' : '#991b1b'};
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

const MedicationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MedicationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
`;

const MedicationInfo = styled.div`
  flex: 1;
`;

const MedicationName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
`;

const MedicationSchedule = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const NextDose = styled.div`
  font-size: 11px;
  color: ${theme.colors.primary};
  font-weight: 500;
`;

const ReminderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ReminderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
`;

const ReminderIcon = styled.div`
  font-size: 14px;
`;

const ReminderInfo = styled.div`
  flex: 1;
`;

const ReminderType = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #1f2937;
`;

const ReminderDescription = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const ReminderDate = styled.div`
  font-size: 11px;
  color: ${theme.colors.primary};
  font-weight: 500;
`;

const AllergyAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  margin-top: 16px;
`;

const AlertIcon = styled.div`
  font-size: 16px;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #92400e;
`;

const AllergyList = styled.div`
  font-size: 11px;
  color: #92400e;
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
      case 'active': return '#dbeafe';
      case 'results pending': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status.toLowerCase()) {
      case 'completed': return '#065f46';
      case 'active': return '#1e40af';
      case 'results pending': return '#92400e';
      default: return '#374151';
    }
  }};
`;

const AppointmentDetails = styled.div`
  text-align: center;
  margin-bottom: 16px;
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