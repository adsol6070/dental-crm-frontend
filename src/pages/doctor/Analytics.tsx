import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDoctorAnalytics } from '@/hooks/useDoctor';

const AnalyticsPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Use the custom hook for fetching analytics data
  const { 
    data: analyticsData, 
    isLoading: loading, 
    isError, 
    error,
    refetch 
  } = useDoctorAnalytics();
  console.log("Analytics Data:", analyticsData);

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

  // Safe calculation helpers to prevent division by zero
  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return '0.0';
    return ((value / total) * 100).toFixed(1);
  };

  // Enhanced loading state
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading analytics data...</LoadingText>
      </LoadingContainer>
    );
  }

  // Enhanced error handling
  if (isError) {
    return (
      <ErrorContainer>
        <ErrorContent>
          <ErrorText>
            {error?.message || 'Unable to load analytics data'}
          </ErrorText>
          <RetryButton onClick={() => refetch()}>
            Try Again
          </RetryButton>
        </ErrorContent>
      </ErrorContainer>
    );
  }

  // Check if data exists and has the expected structure
  if (!analyticsData || !analyticsData.success || !analyticsData.data?.statistics) {
    return (
      <ErrorContainer>
        <ErrorContent>
          <ErrorText>No analytics data available</ErrorText>
          <RetryButton onClick={() => refetch()}>
            Refresh Data
          </RetryButton>
        </ErrorContent>
      </ErrorContainer>
    );
  }

  const { statistics } = analyticsData.data;

  return (
    <AnalyticsContainer>
      {/* Header with refresh functionality */}
      <AnalyticsHeader>
        <HeaderLeft>
          <AnalyticsIcon>📊</AnalyticsIcon>
          <AnalyticsInfo>
            <AnalyticsTitle>Practice Analytics</AnalyticsTitle>
            <AnalyticsDate>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </AnalyticsDate>
            <CurrentTime>{formatTime(currentTime)}</CurrentTime>
          </AnalyticsInfo>
        </HeaderLeft>
        
        <HeaderStats>
          <StatItem>
            <StatValue>{statistics.totalPatients}</StatValue>
            <StatLabel>Total Patients</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{statistics.totalAppointments}</StatValue>
            <StatLabel>Total Appointments</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{statistics.completionRate}%</StatValue>
            <StatLabel>Completion Rate</StatLabel>
          </StatItem>
          <RefreshButton onClick={() => refetch()} title="Refresh Data">
            🔄
          </RefreshButton>
        </HeaderStats>
      </AnalyticsHeader>

      {/* Key Metrics Overview */}
      <MetricsSection>
        <SectionTitle>Key Performance Metrics</SectionTitle>
        <MetricsGrid>
          <MetricCard primary>
            <CardIcon>✅</CardIcon>
            <CardContent>
              <CardValue>{statistics.completedAppointments}</CardValue>
              <CardLabel>Completed Appointments</CardLabel>
            </CardContent>
          </MetricCard>
          
          <MetricCard>
            <CardIcon>📅</CardIcon>
            <CardContent>
              <CardValue>{statistics.upcomingAppointments}</CardValue>
              <CardLabel>Upcoming Appointments</CardLabel>
            </CardContent>
          </MetricCard>
          
          <MetricCard warning>
            <CardIcon>❌</CardIcon>
            <CardContent>
              <CardValue>{statistics.cancelledAppointments}</CardValue>
              <CardLabel>Cancelled Appointments</CardLabel>
            </CardContent>
          </MetricCard>
          
          <MetricCard danger>
            <CardIcon>👻</CardIcon>
            <CardContent>
              <CardValue>{statistics.noShowAppointments}</CardValue>
              <CardLabel>No-Show Appointments</CardLabel>
            </CardContent>
          </MetricCard>
          
          <MetricCard success>
            <CardIcon>📈</CardIcon>
            <CardContent>
              <CardValue>{statistics.completionRate}%</CardValue>
              <CardLabel>Completion Rate</CardLabel>
            </CardContent>
          </MetricCard>
          
          <MetricCard warning>
            <CardIcon>📉</CardIcon>
            <CardContent>
              <CardValue>{statistics.cancellationRate}%</CardValue>
              <CardLabel>Cancellation Rate</CardLabel>
            </CardContent>
          </MetricCard>
        </MetricsGrid>
      </MetricsSection>

      {/* Main Analytics Content */}
      <MainAnalyticsContent>
        {/* Appointment Breakdown */}
        <AppointmentBreakdown>
          <SectionHeader>
            <SectionTitle>Appointment Breakdown</SectionTitle>
            <ViewAllLink onClick={() => refetch()}>
              Refresh Data
            </ViewAllLink>
          </SectionHeader>
          
          <BreakdownList>
            <BreakdownItem>
              <BreakdownIcon completed>✓</BreakdownIcon>
              <BreakdownInfo>
                <BreakdownLabel>Completed Appointments</BreakdownLabel>
                <BreakdownValue>{statistics.completedAppointments} appointments</BreakdownValue>
              </BreakdownInfo>
              <BreakdownPercentage completed>
                {calculatePercentage(statistics.completedAppointments, statistics.totalAppointments)}%
              </BreakdownPercentage>
            </BreakdownItem>
            
            <BreakdownItem>
              <BreakdownIcon upcoming>📅</BreakdownIcon>
              <BreakdownInfo>
                <BreakdownLabel>Upcoming Appointments</BreakdownLabel>
                <BreakdownValue>{statistics.upcomingAppointments} appointments</BreakdownValue>
              </BreakdownInfo>
              <BreakdownPercentage upcoming>
                {calculatePercentage(statistics.upcomingAppointments, statistics.totalAppointments)}%
              </BreakdownPercentage>
            </BreakdownItem>
            
            <BreakdownItem>
              <BreakdownIcon cancelled>❌</BreakdownIcon>
              <BreakdownInfo>
                <BreakdownLabel>Cancelled Appointments</BreakdownLabel>
                <BreakdownValue>{statistics.cancelledAppointments} appointments</BreakdownValue>
              </BreakdownInfo>
              <BreakdownPercentage cancelled>
                {calculatePercentage(statistics.cancelledAppointments, statistics.totalAppointments)}%
              </BreakdownPercentage>
            </BreakdownItem>
            
            <BreakdownItem>
              <BreakdownIcon noshow>👻</BreakdownIcon>
              <BreakdownInfo>
                <BreakdownLabel>No-Show Appointments</BreakdownLabel>
                <BreakdownValue>{statistics.noShowAppointments} appointments</BreakdownValue>
              </BreakdownInfo>
              <BreakdownPercentage noshow>
                {calculatePercentage(statistics.noShowAppointments, statistics.totalAppointments)}%
              </BreakdownPercentage>
            </BreakdownItem>
          </BreakdownList>
        </AppointmentBreakdown>

        {/* Performance Insights */}
        <PerformanceInsights>
          <SectionHeader>
            <SectionTitle>Performance Insights</SectionTitle>
            <ViewAllLink>Export Report</ViewAllLink>
          </SectionHeader>
          
          <InsightsList>
            <InsightItem success>
              <InsightIcon>🎯</InsightIcon>
              <InsightContent>
                <InsightTitle>Excellent Completion Rate</InsightTitle>
                <InsightDescription>
                  Your {statistics.completionRate}% completion rate exceeds industry standards
                </InsightDescription>
              </InsightContent>
            </InsightItem>
            
            <InsightItem warning>
              <InsightIcon>⚠️</InsightIcon>
              <InsightContent>
                <InsightTitle>Monitor Cancellations</InsightTitle>
                <InsightDescription>
                  {statistics.cancellationRate}% cancellation rate - consider reminder strategies
                </InsightDescription>
              </InsightContent>
            </InsightItem>
            
            <InsightItem info>
              <InsightIcon>📊</InsightIcon>
              <InsightContent>
                <InsightTitle>Patient Volume</InsightTitle>
                <InsightDescription>
                  Managing {statistics.totalPatients} active patients efficiently
                </InsightDescription>
              </InsightContent>
            </InsightItem>
            
            <InsightItem primary>
              <InsightIcon>🚀</InsightIcon>
              <InsightContent>
                <InsightTitle>Growth Opportunity</InsightTitle>
                <InsightDescription>
                  {statistics.upcomingAppointments} upcoming appointments scheduled
                </InsightDescription>
              </InsightContent>
            </InsightItem>
          </InsightsList>
        </PerformanceInsights>
      </MainAnalyticsContent>
    </AnalyticsContainer>
  );
};

// Styled Components
const AnalyticsContainer = styled.div`
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

const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 14px;
  text-align: center;
`;

const RetryButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #2563eb;
  }
`;

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  margin-left: 12px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(180deg);
  }
`;

const AnalyticsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
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

const AnalyticsIcon = styled.div`
  font-size: 32px;
`;

const AnalyticsInfo = styled.div``;

const AnalyticsTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 2px 0;
`;

const AnalyticsDate = styled.div`
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
  align-items: center;
  
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

const MetricsSection = styled.div`
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

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const MetricCard = styled.div<{ primary?: boolean; success?: boolean; warning?: boolean; danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: ${props => {
    if (props.primary) return '#f0f9ff';
    if (props.success) return '#f0fdf4';
    if (props.warning) return '#fffbeb';
    if (props.danger) return '#fef2f2';
    return 'white';
  }};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardIcon = styled.div`
  font-size: 20px;
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
`;

const CardLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const MainAnalyticsContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const AppointmentBreakdown = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
`;

const PerformanceInsights = styled.div`
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

const BreakdownList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BreakdownItem = styled.div`
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
  }
`;

const BreakdownIcon = styled.div<{ completed?: boolean; upcoming?: boolean; cancelled?: boolean; noshow?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: ${props => {
    if (props.completed) return '#d1fae5';
    if (props.upcoming) return '#dbeafe';
    if (props.cancelled) return '#fef3c7';
    if (props.noshow) return '#fecaca';
    return '#f3f4f6';
  }};
  color: ${props => {
    if (props.completed) return '#065f46';
    if (props.upcoming) return '#1e40af';
    if (props.cancelled) return '#92400e';
    if (props.noshow) return '#dc2626';
    return '#374151';
  }};
`;

const BreakdownInfo = styled.div`
  flex: 1;
`;

const BreakdownLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
`;

const BreakdownValue = styled.div`
  font-size: 10px;
  color: #6b7280;
`;

const BreakdownPercentage = styled.div<{ completed?: boolean; upcoming?: boolean; cancelled?: boolean; noshow?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => {
    if (props.completed) return '#065f46';
    if (props.upcoming) return '#1e40af';
    if (props.cancelled) return '#92400e';
    if (props.noshow) return '#dc2626';
    return '#374151';
  }};
`;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InsightItem = styled.div<{ success?: boolean; warning?: boolean; info?: boolean; primary?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid ${props => {
    if (props.success) return '#10b981';
    if (props.warning) return '#f59e0b';
    if (props.info) return '#6b7280';
    if (props.primary) return '#3b82f6';
    return '#e5e7eb';
  }};
  background: ${props => {
    if (props.success) return '#f0fdf4';
    if (props.warning) return '#fffbeb';
    if (props.info) return '#f9fafb';
    if (props.primary) return '#f0f9ff';
    return 'white';
  }};
`;

const InsightIcon = styled.div`
  font-size: 16px;
  margin-top: 2px;
`;

const InsightContent = styled.div`
  flex: 1;
`;

const InsightTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const InsightDescription = styled.div`
  font-size: 10px;
  color: #6b7280;
  line-height: 1.4;
`;

export default AnalyticsPage;
