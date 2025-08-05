// @ts-nocheck
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAdminDashboard } from "@/hooks/useAdmin";

const MedicalDashboard = () => {
  const { data, isLoading, error } = useAdminDashboard();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

const calculateVerificationRate = () => {
  const { verifiedPatients = 0, totalPatients = 0 } = data?.data?.specializationStats || {};
  if (totalPatients === 0) return "0.0";
  return ((verifiedPatients / totalPatients) * 100).toFixed(1);
};

const getGenderStats = () => {
  const genderDistribution = data?.data?.specializationStats?.genderDistribution || {};
  return {
    male: genderDistribution.male || 0,
    female: genderDistribution.female || 0,
  };
};

  const getSpecializationIcon = (specialization: string) => {
    const icons: { [key: string]: string } = {
      'Cardiology': '❤️',
      'Neurology': '🧠',
      'Orthopedics': '🦴',
      'Pediatrics': '👶',
      'Dermatology': '🩺',
      'Oncology': '🎗️',
      'General': '👨‍⚕️'
    };
    return icons[specialization] || '🏥';
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading medical dashboard...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !data?.success) {
    return (
      <ErrorContainer>
        <ErrorText>Unable to load dashboard data</ErrorText>
        <RetryButton onClick={() => window.location.reload()}>
          Retry
        </RetryButton>
      </ErrorContainer>
    );
  }

  const dashboardData = data.data;
  const genderStats = getGenderStats();

  return (
    <DashboardContainer>
      {/* Header */}
      <DashboardHeader>
        <HeaderLeft>
          <PracticeIcon>🏥</PracticeIcon>
          <PracticeInfo>
            <PracticeName>Medical Analytics</PracticeName>
            <PracticeDate>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </PracticeDate>
            <CurrentTime>{formatTime(currentTime)}</CurrentTime>
          </PracticeInfo>
        </HeaderLeft>
        
        <HeaderStats>
          <StatItem>
            <StatValue>{dashboardData.specializationStats.totalPatients}</StatValue>
            <StatLabel>Total Patients</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{dashboardData.specializationStats.activePatients}</StatValue>
            <StatLabel>Active Patients</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{calculateVerificationRate()}%</StatValue>
            <StatLabel>Verified Rate</StatLabel>
          </StatItem>
        </HeaderStats>
      </DashboardHeader>

      {/* Overview Cards */}
      <OverviewSection>
        <SectionTitle>Dashboard Overview</SectionTitle>
        <OverviewGrid>
          <OverviewCard>
            <CardIcon>👥</CardIcon>
            <CardContent>
              <CardValue>{dashboardData.specializationStats.totalPatients}</CardValue>
              <CardLabel>Total Patients</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard>
            <CardIcon>✅</CardIcon>
            <CardContent>
              <CardValue>{dashboardData.specializationStats.verifiedPatients}</CardValue>
              <CardLabel>Verified Patients</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard>
            <CardIcon>📅</CardIcon>
            <CardContent>
              <CardValue>{dashboardData.appointmentTrends.patientsWithAppointments}</CardValue>
              <CardLabel>With Appointments</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard>
            <CardIcon>🎯</CardIcon>
            <CardContent>
              <CardValue>{dashboardData.appointmentTrends.engagementRate}%</CardValue>
              <CardLabel>Engagement Rate</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard>
            <CardIcon>📊</CardIcon>
            <CardContent>
              <CardValue>{dashboardData.appointmentTrends.averageAppointmentsPerPatient}</CardValue>
              <CardLabel>Avg Appointments</CardLabel>
            </CardContent>
          </OverviewCard>
          
          <OverviewCard highlight>
            <CardIcon>🏥</CardIcon>
            <CardContent>
              <CardValue>{dashboardData.doctorPerformance.stats.length}</CardValue>
              <CardLabel>Specializations</CardLabel>
            </CardContent>
          </OverviewCard>
        </OverviewGrid>
      </OverviewSection>

      {/* Main Content */}
      <MainContent>
        {/* Doctor Performance */}
        <PerformanceSection>
          <SectionHeader>
            <SectionTitle>Doctor Performance by Specialization</SectionTitle>
            <ViewAllLink>View All Doctors</ViewAllLink>
          </SectionHeader>
          
          <PerformanceList>
            {dashboardData.doctorPerformance.stats.map((stat, index) => (
              <PerformanceItem key={index}>
                <SpecializationInfo>
                  <SpecializationIcon>
                    {getSpecializationIcon(stat._id)}
                  </SpecializationIcon>
                  <SpecializationDetails>
                    <SpecializationName>{stat._id}</SpecializationName>
                    <DoctorCount>{stat.count} doctors</DoctorCount>
                  </SpecializationDetails>
                </SpecializationInfo>
                
                <PerformanceMetrics>
                  <MetricItem>
                    <MetricValue>{stat.averageExperience}y</MetricValue>
                    <MetricLabel>Avg Experience</MetricLabel>
                  </MetricItem>
                  
                  <MetricItem>
                    <MetricValue>
                      {stat.averageRating > 0 ? `⭐ ${stat.averageRating}` : 'No ratings'}
                    </MetricValue>
                    <MetricLabel>Rating</MetricLabel>
                  </MetricItem>
                </PerformanceMetrics>
                
                <StatusIndicator>
                  <StatusDot />
                  Active
                </StatusIndicator>
              </PerformanceItem>
            ))}
          </PerformanceList>
        </PerformanceSection>

        {/* Analytics Sidebar */}
        <Sidebar>
          {/* Patient Demographics */}
          <DemographicsSection>
            <SectionHeader>
              <SectionTitle>Patient Demographics</SectionTitle>
              <ViewAllLink>View Details</ViewAllLink>
            </SectionHeader>
            
            {/* Gender Distribution */}
            <DemographicBlock>
              <BlockTitle>Gender Distribution</BlockTitle>
              <GenderStats>
                <GenderItem>
                  <GenderLabel>
                    <GenderIcon>👨</GenderIcon>
                    Male
                  </GenderLabel>
                  <GenderBar>
                    <GenderFill 
                      percentage={(genderStats.male / (genderStats.male + genderStats.female)) * 100}
                      color="#3b82f6"
                    />
                  </GenderBar>
                  <GenderValue>{genderStats.male}</GenderValue>
                </GenderItem>
                
                <GenderItem>
                  <GenderLabel>
                    <GenderIcon>👩</GenderIcon>
                    Female
                  </GenderLabel>
                  <GenderBar>
                    <GenderFill 
                      percentage={(genderStats.female / (genderStats.male + genderStats.female)) * 100}
                      color="#ec4899"
                    />
                  </GenderBar>
                  <GenderValue>{genderStats.female}</GenderValue>
                </GenderItem>
              </GenderStats>
            </DemographicBlock>

            {/* Age Distribution */}
            <DemographicBlock>
              <BlockTitle>Age Distribution</BlockTitle>
              <AgeStats>
                {Object.entries(dashboardData.specializationStats.ageDistribution).map(([age, count]) => (
                  <AgeItem key={age}>
                    <AgeLabel>{age}</AgeLabel>
                    <AgeValue>{count}</AgeValue>
                  </AgeItem>
                ))}
              </AgeStats>
            </DemographicBlock>

            {/* Registration Sources */}
            <DemographicBlock>
              <BlockTitle>Registration Sources</BlockTitle>
              <SourceStats>
                {Object.entries(dashboardData.specializationStats.registrationSources).map(([source, count]) => (
                  <SourceItem key={source}>
                    <SourceLabel>{source.charAt(0).toUpperCase() + source.slice(1)}</SourceLabel>
                    <SourceValue>{count}</SourceValue>
                  </SourceItem>
                ))}
              </SourceStats>
            </DemographicBlock>
          </DemographicsSection>

          {/* Appointment Analytics */}
          <AppointmentSection>
            <SectionTitle>Appointment Analytics</SectionTitle>
            
            <AppointmentGrid>
              <AppointmentCard>
                <AppointmentValue>{dashboardData.appointmentTrends.averageAppointmentsPerPatient}</AppointmentValue>
                <AppointmentLabel>Avg per Patient</AppointmentLabel>
              </AppointmentCard>
              
              <AppointmentCard>
                <AppointmentValue>{dashboardData.appointmentTrends.engagementRate}%</AppointmentValue>
                <AppointmentLabel>Engagement</AppointmentLabel>
              </AppointmentCard>
            </AppointmentGrid>

            <DistributionTitle>Appointment Distribution</DistributionTitle>
            <DistributionList>
              {Object.entries(dashboardData.appointmentTrends.appointmentDistribution).map(([range, count]) => (
                <DistributionItem key={range}>
                  <DistributionRange>{range}</DistributionRange>
                  <DistributionCount>{count}</DistributionCount>
                </DistributionItem>
              ))}
            </DistributionList>
          </AppointmentSection>
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
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: #f8fafc;
  min-height: 100vh;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
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
  margin-top: 12px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: #f8fafc;
  min-height: 100vh;
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
`;

const RetryButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
  padding: 24px 28px;
  border-radius: 12px;
  color: white;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PracticeIcon = styled.div`
  font-size: 40px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
`;

const PracticeInfo = styled.div``;

const PracticeName = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
  letter-spacing: -0.025em;
`;

const PracticeDate = styled.div`
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 2px;
  font-weight: 500;
`;

const CurrentTime = styled.div`
  font-size: 11px;
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
  letter-spacing: -0.025em;
`;

const StatLabel = styled.div`
  font-size: 10px;
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const OverviewSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
  letter-spacing: -0.025em;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const OverviewCard = styled.div<{ highlight?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: ${props => props.highlight ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' : 'white'};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
`;

const CardIcon = styled.div`
  font-size: 20px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2px;
  letter-spacing: -0.025em;
`;

const CardLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const PerformanceSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
  transition: color 0.2s;
  
  &:hover {
    color: #2563eb;
    text-decoration: underline;
  }
`;

const PerformanceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PerformanceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #e2e8f0;
    background: #f9fafb;
    transform: translateX(4px);
  }
`;

const SpecializationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const SpecializationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const SpecializationDetails = styled.div``;

const SpecializationName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
`;

const DoctorCount = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
`;

const PerformanceMetrics = styled.div`
  display: flex;
  gap: 24px;
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
`;

const MetricLabel = styled.div`
  font-size: 10px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #059669;
  font-weight: 500;
`;

const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DemographicsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const DemographicBlock = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const BlockTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
`;

const GenderStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GenderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GenderLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #374151;
  font-weight: 500;
  min-width: 60px;
`;

const GenderIcon = styled.span`
  font-size: 14px;
`;

const GenderBar = styled.div`
  flex: 1;
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
`;

const GenderFill = styled.div<{ percentage: number; color: string }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: ${props => props.color};
  transition: width 0.3s ease;
`;

const GenderValue = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  min-width: 32px;
  text-align: right;
`;

const AgeStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AgeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
`;

const AgeLabel = styled.div`
  font-size: 12px;
  color: #374151;
  font-weight: 500;
`;

const AgeValue = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
`;

const SourceStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SourceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
`;

const SourceLabel = styled.div`
  font-size: 12px;
  color: #374151;
  font-weight: 500;
`;

const SourceValue = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 4px;
`;

const AppointmentSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const AppointmentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const AppointmentCard = styled.div`
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 8px;
  border: 1px solid #e0f2fe;
`;

const AppointmentValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 4px;
`;

const AppointmentLabel = styled.div`
  font-size: 10px;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const DistributionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
`;

const DistributionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DistributionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #f3f4f6;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    border-color: #e2e8f0;
  }
`;

const DistributionRange = styled.div`
  font-size: 12px;
  color: #374151;
  font-weight: 500;
`;

const DistributionCount = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  background: white;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
`;

export default MedicalDashboard;