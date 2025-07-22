import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    white: '#ffffff',
    primaryDark: '#4f46e5',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    lightGray: '#e5e7eb'
  }
};

// Mock hook implementation - replace with your actual hook
const useDoctorProfile = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData({
        success: true,
        data: {
          doctor: {
            personalInfo: {
              firstName: "rakesh",
              lastName: "kumar",
              email: "jatingmttf@gmail.com",
              phone: "9898898989"
            },
            professionalInfo: {
              specialization: "Cardiology",
              qualifications: ["MBBS"],
              experience: 10,
              licenseNumber: "TEST1234",
              department: "Emergency Department"
            },
            schedule: {
              workingDays: [
                {
                  day: "monday",
                  startTime: "09:00",
                  endTime: "17:00",
                  isWorking: true,
                  _id: "687a0ae91507ffa697a17d23",
                  id: "687a0ae91507ffa697a17d23"
                },
                {
                  day: "tuesday",
                  startTime: "09:00",
                  endTime: "17:00",
                  isWorking: true,
                  _id: "687a0ae91507ffa697a17d24",
                  id: "687a0ae91507ffa697a17d24"
                },
                {
                  day: "wednesday",
                  startTime: "09:00",
                  endTime: "17:00",
                  isWorking: true,
                  _id: "687a0ae91507ffa697a17d25",
                  id: "687a0ae91507ffa697a17d25"
                },
                {
                  day: "thursday",
                  startTime: "09:00",
                  endTime: "17:00",
                  isWorking: true,
                  _id: "687a0ae91507ffa697a17d26",
                  id: "687a0ae91507ffa697a17d26"
                },
                {
                  day: "friday",
                  startTime: "09:00",
                  endTime: "17:00",
                  isWorking: true,
                  _id: "687a0ae91507ffa697a17d27",
                  id: "687a0ae91507ffa697a17d27"
                },
                {
                  day: "saturday",
                  startTime: "09:00",
                  endTime: "17:00",
                  isWorking: true,
                  _id: "687a0ae91507ffa697a17d28",
                  id: "687a0ae91507ffa697a17d28"
                },
                {
                  day: "sunday",
                  startTime: "09:00",
                  endTime: "17:00",
                  isWorking: false,
                  _id: "687a0ae91507ffa697a17d29",
                  id: "687a0ae91507ffa697a17d29"
                }
              ],
              slotDuration: 30,
              breakTimes: [
                {
                  startTime: "13:00",
                  endTime: "14:00",
                  description: "Lunch Break",
                  _id: "687a0ae91507ffa697a17d2a",
                  id: "687a0ae91507ffa697a17d2a"
                }
              ]
            },
            availability: {
              isAvailable: true,
              unavailableDates: [],
              maxAppointmentsPerDay: 20
            },
            fees: {
              consultationFee: 500,
              followUpFee: 200,
              emergencyFee: 1000
            },
            statistics: {
              totalAppointments: 0,
              completedAppointments: 0,
              cancelledAppointments: 0,
              rating: 0,
              reviewCount: 0
            },
            authentication: {
              isVerified: true,
              twoFactorEnabled: false,
              lastPasswordChange: "2025-07-18T08:50:49.864Z"
            },
            _id: "687a0ae91507ffa697a17d22",
            isActive: true,
            isVerifiedByAdmin: false,
            doctorId: "DOC-1752828649567-qlmgkug2i",
            registrationDate: "2025-07-18T08:50:49.567Z",
            createdAt: "2025-07-18T08:50:49.581Z",
            updatedAt: "2025-07-19T10:51:30.784Z",
            fullName: "Dr. rakesh kumar",
            id: "687a0ae91507ffa697a17d22"
          }
        }
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  return { data, isLoading, error };
};

const DoctorProfile = () => {
  const { data, isLoading, error } = useDoctorProfile();
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading doctor profile...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !data?.success) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <ErrorText>Failed to load doctor profile</ErrorText>
        <RetryButton onClick={() => window.location.reload()}>
          Retry
        </RetryButton>
      </ErrorContainer>
    );
  }

  const doctor = data.data.doctor;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getWorkingDaysCount = () => {
    return doctor.schedule.workingDays.filter(day => day.isWorking).length;
  };

  const handleEdit = () => {
    if (editing) {
      handleSave();
    } else {
      setEditing(true);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
  };

  // const handleLogout = () => {
  //   console.log('Logging out...');
  //   alert('Logged out successfully!');
  // };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader>
        <HeaderContent>
          <Title>Doctor Profile</Title>
          <Subtitle>Manage your professional information and settings</Subtitle>
        </HeaderContent>
        <HeaderActions>
          {!editing ? (
            <>
              <ActionButton variant="secondary" onClick={handleEdit}>
                ✏️ Edit Profile
              </ActionButton>
              {/* <ActionButton variant="danger" onClick={handleLogout}>
                🚪 Logout
              </ActionButton> */}
            </>
          ) : (
            <>
              <ActionButton variant="secondary" onClick={handleCancel}>
                Cancel
              </ActionButton>
              <ActionButton 
                variant="primary" 
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : '💾 Save Changes'}
              </ActionButton>
            </>
          )}
        </HeaderActions>
      </PageHeader>

      {/* Profile Content */}
      <ContentContainer>
        {/* Profile Card */}
        <ProfileCard>
          {/* Avatar Section */}
          <AvatarSection>
            <AvatarContainer>
              <AvatarRing>
                <AvatarText>{getInitials(doctor.fullName)}</AvatarText>
              </AvatarRing>
              <StatusIndicator status={doctor.isActive ? 'active' : 'inactive'} />
            </AvatarContainer>
            
            <UserInfo>
              <UserName>{doctor.fullName}</UserName>
              <UserRole>{doctor.professionalInfo.specialization} Specialist</UserRole>
              <UserDepartment>{doctor.professionalInfo.department}</UserDepartment>
              <StatusBadge status={doctor.isActive ? 'active' : 'inactive'}>
                {doctor.isActive ? 'Active' : 'Inactive'}
              </StatusBadge>
            </UserInfo>
          </AvatarSection>

          {/* Quick Stats */}
          <QuickStats>
            <StatItem>
              <StatIcon>👨‍⚕️</StatIcon>
              <StatContent>
                <StatLabel>Experience</StatLabel>
                <StatValue>{doctor.professionalInfo.experience} Years</StatValue>
              </StatContent>
            </StatItem>
            <StatItem>
              <StatIcon>📅</StatIcon>
              <StatContent>
                <StatLabel>Working Days</StatLabel>
                <StatValue>{getWorkingDaysCount()}/7 Days</StatValue>
              </StatContent>
            </StatItem>
            <StatItem>
              <StatIcon>⭐</StatIcon>
              <StatContent>
                <StatLabel>Rating</StatLabel>
                <StatValue>{doctor.statistics.rating > 0 ? `${doctor.statistics.rating}/5` : 'New'}</StatValue>
              </StatContent>
            </StatItem>
            <StatItem>
              <StatIcon>🏥</StatIcon>
              <StatContent>
                <StatLabel>Total Appointments</StatLabel>
                <StatValue>{doctor.statistics.totalAppointments}</StatValue>
              </StatContent>
            </StatItem>
          </QuickStats>
        </ProfileCard>

        {/* Details Section */}
        <DetailsSection>
          {/* Tab Navigation */}
          <TabNavigation>
            <TabButton 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile Details
            </TabButton>
            <TabButton 
              active={activeTab === 'schedule'} 
              onClick={() => setActiveTab('schedule')}
            >
              📅 Schedule & Availability
            </TabButton>
            <TabButton 
              active={activeTab === 'fees'} 
              onClick={() => setActiveTab('fees')}
            >
              💰 Fees & Billing
            </TabButton>
            <TabButton 
              active={activeTab === 'statistics'} 
              onClick={() => setActiveTab('statistics')}
            >
              📊 Statistics
            </TabButton>
          </TabNavigation>

          {/* Tab Content */}
          <TabContent>
            {activeTab === 'profile' && (
              <ProfileTab>
                <SectionTitle>Personal Information</SectionTitle>
                
                <FormGrid>
                  <FormGroup>
                    <Label>First Name</Label>
                    <DisplayValue>{capitalizeFirstLetter(doctor.personalInfo.firstName)}</DisplayValue>
                  </FormGroup>

                  <FormGroup>
                    <Label>Last Name</Label>
                    <DisplayValue>{capitalizeFirstLetter(doctor.personalInfo.lastName)}</DisplayValue>
                  </FormGroup>

                  <FormGroup>
                    <Label>Email Address</Label>
                    <DisplayValue>{doctor.personalInfo.email}</DisplayValue>
                  </FormGroup>

                  <FormGroup>
                    <Label>Phone Number</Label>
                    <DisplayValue>+91 {doctor.personalInfo.phone}</DisplayValue>
                  </FormGroup>

                  <FormGroup>
                    <Label>Doctor ID</Label>
                    <DisplayValue>{doctor.doctorId}</DisplayValue>
                  </FormGroup>

                  <FormGroup>
                    <Label>License Number</Label>
                    <DisplayValue>{doctor.professionalInfo.licenseNumber}</DisplayValue>
                  </FormGroup>
                </FormGrid>

                <SectionTitle style={{ marginTop: '32px' }}>Professional Information</SectionTitle>
                
                <FormGrid>
                  <FormGroup>
                    <Label>Specialization</Label>
                    <DisplayValue>{doctor.professionalInfo.specialization}</DisplayValue>
                  </FormGroup>

                  <FormGroup>
                    <Label>Department</Label>
                    <DisplayValue>{doctor.professionalInfo.department}</DisplayValue>
                  </FormGroup>

                  <FormGroup>
                    <Label>Experience</Label>
                    <DisplayValue>{doctor.professionalInfo.experience} Years</DisplayValue>
                  </FormGroup>

                  <FormGroup>
                    <Label>Qualifications</Label>
                    <DisplayValue>{doctor.professionalInfo.qualifications.join(', ')}</DisplayValue>
                  </FormGroup>

                  <FormGroup>
                    <Label>Verification Status</Label>
                    <StatusBadge status={doctor.authentication.isVerified ? 'active' : 'inactive'}>
                      {doctor.authentication.isVerified ? 'Verified' : 'Pending Verification'}
                    </StatusBadge>
                  </FormGroup>

                  <FormGroup>
                    <Label>Admin Approval</Label>
                    <StatusBadge status={doctor.isVerifiedByAdmin ? 'active' : 'inactive'}>
                      {doctor.isVerifiedByAdmin ? 'Approved' : 'Pending Approval'}
                    </StatusBadge>
                  </FormGroup>
                </FormGrid>

                <SectionTitle style={{ marginTop: '32px' }}>Account Information</SectionTitle>
                
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Registration Date</InfoLabel>
                    <InfoValue>{formatTimestamp(doctor.registrationDate)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Last Updated</InfoLabel>
                    <InfoValue>{formatTimestamp(doctor.updatedAt)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Last Password Change</InfoLabel>
                    <InfoValue>{formatTimestamp(doctor.authentication.lastPasswordChange)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Two-Factor Auth</InfoLabel>
                    <InfoValue>{doctor.authentication.twoFactorEnabled ? 'Enabled' : 'Disabled'}</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </ProfileTab>
            )}

            {activeTab === 'schedule' && (
              <ScheduleTab>
                <SectionTitle>Working Schedule</SectionTitle>
                
                <ScheduleGrid>
                  {doctor.schedule.workingDays.map((day) => (
                    <ScheduleDay key={day.id} isWorking={day.isWorking}>
                      <DayName>{capitalizeFirstLetter(day.day)}</DayName>
                      <DayTime>
                        {day.isWorking 
                          ? `${day.startTime} - ${day.endTime}`
                          : 'Off Day'
                        }
                      </DayTime>
                    </ScheduleDay>
                  ))}
                </ScheduleGrid>

                <SectionTitle style={{ marginTop: '32px' }}>Schedule Settings</SectionTitle>
                
                <ScheduleSettings>
                  <SettingItem>
                    <SettingIcon>⏱️</SettingIcon>
                    <SettingContent>
                      <SettingLabel>Slot Duration</SettingLabel>
                      <SettingValue>{doctor.schedule.slotDuration} minutes</SettingValue>
                    </SettingContent>
                  </SettingItem>

                  <SettingItem>
                    <SettingIcon>📅</SettingIcon>
                    <SettingContent>
                      <SettingLabel>Max Appointments/Day</SettingLabel>
                      <SettingValue>{doctor.availability.maxAppointmentsPerDay}</SettingValue>
                    </SettingContent>
                  </SettingItem>

                  <SettingItem>
                    <SettingIcon>✅</SettingIcon>
                    <SettingContent>
                      <SettingLabel>Currently Available</SettingLabel>
                      <SettingValue>{doctor.availability.isAvailable ? 'Yes' : 'No'}</SettingValue>
                    </SettingContent>
                  </SettingItem>
                </ScheduleSettings>

                {doctor.schedule.breakTimes.length > 0 && (
                  <>
                    <SectionTitle style={{ marginTop: '32px' }}>Break Times</SectionTitle>
                    <BreakTimes>
                      {doctor.schedule.breakTimes.map((breakTime) => (
                        <BreakTimeItem key={breakTime.id}>
                          <BreakIcon>☕</BreakIcon>
                          <BreakContent>
                            <BreakLabel>{breakTime.description}</BreakLabel>
                            <BreakTime>{breakTime.startTime} - {breakTime.endTime}</BreakTime>
                          </BreakContent>
                        </BreakTimeItem>
                      ))}
                    </BreakTimes>
                  </>
                )}
              </ScheduleTab>
            )}

            {activeTab === 'fees' && (
              <FeesTab>
                <SectionTitle>Fee Structure</SectionTitle>
                
                <FeesGrid>
                  <FeeCard>
                    <FeeIcon>💊</FeeIcon>
                    <FeeContent>
                      <FeeLabel>Consultation Fee</FeeLabel>
                      <FeeAmount>{formatCurrency(doctor.fees.consultationFee)}</FeeAmount>
                      <FeeDescription>Regular consultation charges</FeeDescription>
                    </FeeContent>
                  </FeeCard>

                  <FeeCard>
                    <FeeIcon>🔄</FeeIcon>
                    <FeeContent>
                      <FeeLabel>Follow-up Fee</FeeLabel>
                      <FeeAmount>{formatCurrency(doctor.fees.followUpFee)}</FeeAmount>
                      <FeeDescription>Follow-up appointment charges</FeeDescription>
                    </FeeContent>
                  </FeeCard>

                  <FeeCard>
                    <FeeIcon>🚨</FeeIcon>
                    <FeeContent>
                      <FeeLabel>Emergency Fee</FeeLabel>
                      <FeeAmount>{formatCurrency(doctor.fees.emergencyFee)}</FeeAmount>
                      <FeeDescription>Emergency consultation charges</FeeDescription>
                    </FeeContent>
                  </FeeCard>
                </FeesGrid>
              </FeesTab>
            )}

            {activeTab === 'statistics' && (
              <StatisticsTab>
                <SectionTitle>Performance Statistics</SectionTitle>
                
                <StatsGrid>
                  <StatCard>
                    <StatCardIcon>📊</StatCardIcon>
                    <StatCardContent>
                      <StatCardLabel>Total Appointments</StatCardLabel>
                      <StatCardValue>{doctor.statistics.totalAppointments}</StatCardValue>
                    </StatCardContent>
                  </StatCard>

                  <StatCard>
                    <StatCardIcon>✅</StatCardIcon>
                    <StatCardContent>
                      <StatCardLabel>Completed</StatCardLabel>
                      <StatCardValue>{doctor.statistics.completedAppointments}</StatCardValue>
                    </StatCardContent>
                  </StatCard>

                  <StatCard>
                    <StatCardIcon>❌</StatCardIcon>
                    <StatCardContent>
                      <StatCardLabel>Cancelled</StatCardLabel>
                      <StatCardValue>{doctor.statistics.cancelledAppointments}</StatCardValue>
                    </StatCardContent>
                  </StatCard>

                  <StatCard>
                    <StatCardIcon>⭐</StatCardIcon>
                    <StatCardContent>
                      <StatCardLabel>Rating</StatCardLabel>
                      <StatCardValue>{doctor.statistics.rating > 0 ? `${doctor.statistics.rating}/5` : 'No Rating'}</StatCardValue>
                    </StatCardContent>
                  </StatCard>

                  <StatCard>
                    <StatCardIcon>💬</StatCardIcon>
                    <StatCardContent>
                      <StatCardLabel>Reviews</StatCardLabel>
                      <StatCardValue>{doctor.statistics.reviewCount}</StatCardValue>
                    </StatCardContent>
                  </StatCard>

                  <StatCard>
                    <StatCardIcon>📈</StatCardIcon>
                    <StatCardContent>
                      <StatCardLabel>Success Rate</StatCardLabel>
                      <StatCardValue>
                        {doctor.statistics.totalAppointments > 0 
                          ? `${Math.round((doctor.statistics.completedAppointments / doctor.statistics.totalAppointments) * 100)}%`
                          : 'N/A'
                        }
                      </StatCardValue>
                    </StatCardContent>
                  </StatCard>
                </StatsGrid>
              </StatisticsTab>
            )}
          </TabContent>
        </DetailsSection>
      </ContentContainer>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${theme.colors.lightGray};
  border-top: 4px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: 14px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
`;

const ErrorText = styled.div`
  color: ${theme.colors.danger};
  font-size: 16px;
  font-weight: 500;
`;

const RetryButton = styled.button`
  padding: 8px 16px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  margin: 0 0 4px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          color: white;
          border-color: ${theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.primaryDark};
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: white;
          color: ${theme.colors.textPrimary};
          border-color: ${theme.colors.lightGray};
          
          &:hover:not(:disabled) {
            background: #f9fafb;
          }
        `;
      case 'danger':
        return `
          background: white;
          color: ${theme.colors.danger};
          border-color: ${theme.colors.danger}30;
          
          &:hover:not(:disabled) {
            background: ${theme.colors.danger}10;
          }
        `;
      default:
        return '';
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const AvatarSection = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  color: white;
  padding: 24px;
  text-align: center;
  position: relative;
`;

const AvatarContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
`;

const AvatarRing = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const AvatarText = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: white;
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.status === 'active' ? theme.colors.success : theme.colors.textSecondary};
  border: 3px solid white;
`;

const UserInfo = styled.div``;

const UserName = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: white;
`;

const UserRole = styled.div`
  font-size: 14px;
  margin-bottom: 2px;
  opacity: 0.9;
`;

const UserDepartment = styled.div`
  font-size: 13px;
  margin-bottom: 12px;
  opacity: 0.8;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  ${props => props.status === 'active' ? `
    color: ${theme.colors.success};
    background: white;
    border-color: ${theme.colors.success}30;
  ` : `
    color: ${theme.colors.textSecondary};
    background: white;
    border-color: ${theme.colors.textSecondary}30;
  `}
`;

const QuickStats = styled.div`
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatIcon = styled.div`
  font-size: 16px;
  width: 32px;
  height: 32px;
  background: ${theme.colors.primary}10;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  font-weight: 600;
`;

const DetailsSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const TabNavigation = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
  
  @media (max-width: 768px) {
    overflow-x: auto;
  }
`;

const TabButton = styled.button`
  padding: 16px 20px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  
  ${props => props.active ? `
    color: ${theme.colors.primary};
    border-bottom-color: ${theme.colors.primary};
    background: white;
  ` : `
    color: ${theme.colors.textSecondary};
    
    &:hover {
      color: ${theme.colors.textPrimary};
      background: rgba(255, 255, 255, 0.5);
    }
  `}
`;

const TabContent = styled.div`
  padding: 24px;
`;

const ProfileTab = styled.div``;
const ScheduleTab = styled.div``;
const FeesTab = styled.div``;
const StatisticsTab = styled.div``;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 20px 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const DisplayValue = styled.div`
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  border: 1px solid #e2e8f0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  font-weight: 500;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  font-weight: 500;
`;

const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const ScheduleDay = styled.div`
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e2e8f0;
  background: ${props => props.isWorking ? '#f0fdf4' : '#fef2f2'};
  border-color: ${props => props.isWorking ? theme.colors.success + '30' : theme.colors.danger + '30'};
`;

const DayName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const DayTime = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const ScheduleSettings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const SettingIcon = styled.div`
  font-size: 20px;
  width: 40px;
  height: 40px;
  background: ${theme.colors.primary}15;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SettingContent = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: 2px;
`;

const SettingValue = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
`;

const BreakTimes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BreakTimeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fefce8;
  border-radius: 8px;
  border: 1px solid ${theme.colors.warning}30;
`;

const BreakIcon = styled.div`
  font-size: 16px;
  width: 32px;
  height: 32px;
  background: ${theme.colors.warning}15;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BreakContent = styled.div`
  flex: 1;
`;

const BreakLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
  margin-bottom: 2px;
`;

const BreakTime = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const FeesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const FeeCard = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const FeeIcon = styled.div`
  font-size: 24px;
  width: 48px;
  height: 48px;
  background: ${theme.colors.primary}15;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const FeeContent = styled.div``;

const FeeLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const FeeAmount = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: 4px;
`;

const FeeDescription = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatCardIcon = styled.div`
  font-size: 20px;
  width: 40px;
  height: 40px;
  background: ${theme.colors.primary}15;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatCardContent = styled.div`
  flex: 1;
`;

const StatCardLabel = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  font-weight: 500;
  margin-bottom: 4px;
`;

const StatCardValue = styled.div`
  font-size: 18px;
  color: ${theme.colors.textPrimary};
  font-weight: 700;
`;

export default DoctorProfile;