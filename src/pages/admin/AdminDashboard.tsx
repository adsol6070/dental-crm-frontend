import { useState, useEffect } from 'react';
import styled from 'styled-components';

interface DentalData {
  practiceInfo: {
    name: string;
    todayDate: string;
    activePatients: number;
    todayAppointments: number;
    completedToday: number;
  };
  todayStats: {
    scheduled: number;
    checkedIn: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    revenue: number;
  };
  upcomingAppointments: Array<{
    id: string;
    time: string;
    patient: string;
    type: string;
    status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed';
    duration: number;
  }>;
  recentPatients: Array<{
    id: string;
    name: string;
    lastVisit: string;
    nextAppointment: string;
    treatment: string;
    status: 'active' | 'pending' | 'completed';
  }>;
  quickActions: Array<{
    icon: string;
    label: string;
    count?: number;
  }>;
}

const DentalDashboard = () => {
  const [dentalData, setDentalData] = useState<DentalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDentalData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData: DentalData = {
        practiceInfo: {
          name: 'DentalCare Pro',
          todayDate: new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          activePatients: 847,
          todayAppointments: 16,
          completedToday: 8
        },
        todayStats: {
          scheduled: 16,
          checkedIn: 3,
          inProgress: 2,
          completed: 8,
          cancelled: 1,
          revenue: 3240
        },
        upcomingAppointments: [
          {
            id: '1',
            time: '2:30 PM',
            patient: 'Sarah Johnson',
            type: 'Cleaning',
            status: 'checked-in',
            duration: 60
          },
          {
            id: '2',
            time: '3:00 PM',
            patient: 'Michael Chen',
            type: 'Root Canal',
            status: 'scheduled',
            duration: 90
          },
          {
            id: '3',
            time: '3:45 PM',
            patient: 'Emma Davis',
            type: 'Consultation',
            status: 'scheduled',
            duration: 30
          },
          {
            id: '4',
            time: '4:30 PM',
            patient: 'David Wilson',
            type: 'Filling',
            status: 'scheduled',
            duration: 45
          },
          {
            id: '5',
            time: '5:15 PM',
            patient: 'Lisa Brown',
            type: 'Whitening',
            status: 'scheduled',
            duration: 75
          }
        ],
        recentPatients: [
          {
            id: '1',
            name: 'Jennifer Smith',
            lastVisit: '2 days ago',
            nextAppointment: 'Jan 15, 2025',
            treatment: 'Orthodontics',
            status: 'active'
          },
          {
            id: '2',
            name: 'Robert Lee',
            lastVisit: '1 week ago',
            nextAppointment: 'Jan 20, 2025',
            treatment: 'Crown Prep',
            status: 'pending'
          },
          {
            id: '3',
            name: 'Maria Garcia',
            lastVisit: '3 days ago',
            nextAppointment: 'Completed',
            treatment: 'Extraction',
            status: 'completed'
          },
          {
            id: '4',
            name: 'Thomas Anderson',
            lastVisit: '5 days ago',
            nextAppointment: 'Jan 18, 2025',
            treatment: 'Implant',
            status: 'active'
          }
        ],
        quickActions: [
          { icon: '📅', label: 'Schedule', count: 5 },
          { icon: '👤', label: 'New Patient' },
          { icon: '💰', label: 'Billing', count: 3 },
          { icon: '📊', label: 'Reports' }
        ]
      };
      
      setDentalData(mockData);
      setLoading(false);
    };

    fetchDentalData();
  }, []);

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
        <LoadingText>Loading dashboard...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!dentalData) {
    return (
      <ErrorContainer>
        <ErrorText>Unable to load dashboard</ErrorText>
      </ErrorContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Header */}
      <DashboardHeader>
        <HeaderLeft>
          <PracticeIcon>🦷</PracticeIcon>
          <PracticeInfo>
            <PracticeName>{dentalData.practiceInfo.name}</PracticeName>
            <PracticeDate>{dentalData.practiceInfo.todayDate}</PracticeDate>
            <CurrentTime>{formatTime(currentTime)}</CurrentTime>
          </PracticeInfo>
        </HeaderLeft>
        
        <HeaderStats>
          <StatItem>
            <StatValue>{dentalData.practiceInfo.activePatients}</StatValue>
            <StatLabel>Active Patients</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{dentalData.practiceInfo.todayAppointments}</StatValue>
            <StatLabel>Today's Appointments</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{dentalData.practiceInfo.completedToday}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatItem>
        </HeaderStats>
      </DashboardHeader>

      {/* Today's Overview */}
      <OverviewSection>
        <SectionTitle>Today's Overview</SectionTitle>
        <OverviewGrid>
          <OverviewCard>
            <CardIcon>📋</CardIcon>
            <CardContent>
              <CardValue>{dentalData.todayStats.scheduled}</CardValue>
              <CardLabel>Scheduled</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard>
            <CardIcon>✅</CardIcon>
            <CardContent>
              <CardValue>{dentalData.todayStats.checkedIn}</CardValue>
              <CardLabel>Checked In</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard>
            <CardIcon>🔄</CardIcon>
            <CardContent>
              <CardValue>{dentalData.todayStats.inProgress}</CardValue>
              <CardLabel>In Progress</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard>
            <CardIcon>✨</CardIcon>
            <CardContent>
              <CardValue>{dentalData.todayStats.completed}</CardValue>
              <CardLabel>Completed</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard>
            <CardIcon>❌</CardIcon>
            <CardContent>
              <CardValue>{dentalData.todayStats.cancelled}</CardValue>
              <CardLabel>Cancelled</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard revenue>
            <CardIcon>💰</CardIcon>
            <CardContent>
              <CardValue>${dentalData.todayStats.revenue.toLocaleString()}</CardValue>
              <CardLabel>Today's Revenue</CardLabel>
            </CardContent>
          </OverviewCard>
        </OverviewGrid>
      </OverviewSection>

      {/* Main Content */}
      <MainContent>
        {/* Upcoming Appointments */}
        <AppointmentsSection>
          <SectionHeader>
            <SectionTitle>Upcoming Appointments</SectionTitle>
            <ViewAllLink>View Schedule</ViewAllLink>
          </SectionHeader>
          
          <AppointmentsList>
            {dentalData.upcomingAppointments.map((appointment) => (
              <AppointmentItem key={appointment.id}>
                <AppointmentTime>
                  <TimeText>{appointment.time}</TimeText>
                  <DurationText>{appointment.duration}min</DurationText>
                </AppointmentTime>
                
                <AppointmentInfo>
                  <PatientName>{appointment.patient}</PatientName>
                  <TreatmentType>{appointment.type}</TreatmentType>
                </AppointmentInfo>
                
                <AppointmentStatus status={appointment.status}>
                  {appointment.status === 'checked-in' ? 'Checked In' :
                   appointment.status === 'in-progress' ? 'In Progress' :
                   appointment.status === 'completed' ? 'Completed' : 'Scheduled'}
                </AppointmentStatus>
              </AppointmentItem>
            ))}
          </AppointmentsList>
        </AppointmentsSection>

        {/* Sidebar */}
        <Sidebar>
          {/* Recent Patients */}
          <RecentPatientsSection>
            <SectionHeader>
              <SectionTitle>Recent Patients</SectionTitle>
              <ViewAllLink>View All</ViewAllLink>
            </SectionHeader>
            
            <PatientsList>
              {dentalData.recentPatients.map((patient) => (
                <PatientItem key={patient.id}>
                  <PatientAvatar>
                    {patient.name.split(' ').map(n => n[0]).join('')}
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
          </RecentPatientsSection>

          {/* Quick Actions */}
          {/* <QuickActionsSection>
            <SectionTitle>Quick Actions</SectionTitle>
            <ActionsList>
              {dentalData.quickActions.map((action, index) => (
                <ActionItem key={index}>
                  <ActionIcon>{action.icon}</ActionIcon>
                  <ActionLabel>{action.label}</ActionLabel>
                  {action.count && (
                    <ActionBadge>{action.count}</ActionBadge>
                  )}
                </ActionItem>
              ))}
            </ActionsList>
          </QuickActionsSection> */}
        </Sidebar>
      </MainContent>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 14px;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  padding: 16px 20px;
  border-radius: 10px;
  color: white;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PracticeIcon = styled.div`
  font-size: 32px;
`;

const PracticeInfo = styled.div``;

const PracticeName = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 2px 0;
`;

const PracticeDate = styled.div`
  font-size: 11px;
  opacity: 0.9;
  margin-bottom: 1px;
`;

const CurrentTime = styled.div`
  font-size: 10px;
  opacity: 0.8;
`;

const HeaderStats = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 9px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const OverviewSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
`;

const OverviewCard = styled.div<{ revenue?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: ${props => props.revenue ? '#f0f9ff' : 'white'};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    transform: translateY(-1px);
  }
`;

const CardIcon = styled.div`
  font-size: 14px;
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1px;
`;

const CardLabel = styled.div`
  font-size: 9px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const AppointmentsSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ViewAllLink = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AppointmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AppointmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #f3f4f6;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #e2e8f0;
    background: #f9fafb;
  }
`;

const AppointmentTime = styled.div`
  min-width: 60px;
  text-align: center;
`;

const TimeText = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #3b82f6;
`;

const DurationText = styled.div`
  font-size: 9px;
  color: #6b7280;
`;

const AppointmentInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 1px;
`;

const TreatmentType = styled.div`
  font-size: 10px;
  color: #6b7280;
`;

const AppointmentStatus = styled.span<{ status: string }>`
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: ${props => {
    switch (props.status) {
      case 'checked-in': return '#dbeafe';
      case 'in-progress': return '#fef3c7';
      case 'completed': return '#d1fae5';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'checked-in': return '#1e40af';
      case 'in-progress': return '#92400e';
      case 'completed': return '#065f46';
      default: return '#374151';
    }
  }};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RecentPatientsSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
`;

const PatientsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PatientItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px solid #f3f4f6;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #e2e8f0;
    background: #f9fafb;
  }
`;

const PatientAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
`;

const PatientInfo = styled.div`
  flex: 1;
`;

const PatientDetails = styled.div`
  margin-top: 2px;
`;

const DetailText = styled.div`
  font-size: 9px;
  color: #6b7280;
  margin-bottom: 1px;
`;

const TreatmentText = styled.div`
  font-size: 9px;
  color: #3b82f6;
  font-weight: 500;
`;

const PatientStatus = styled.span<{ status: string }>`
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 500;
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
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
`;

const ActionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #f3f4f6;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
`;

const ActionIcon = styled.div`
  font-size: 14px;
`;

const ActionLabel = styled.div`
  flex: 1;
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  color: #374151;
`;

const ActionBadge = styled.div`
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 600;
`;

export default DentalDashboard;