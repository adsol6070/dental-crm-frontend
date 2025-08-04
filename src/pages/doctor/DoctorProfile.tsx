// @ts-nocheck
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  useDoctorProfile, 
  useUpdateDoctorProfessionalInfo,
  useUpdateDoctorContactInfo 
} from '@/hooks/useDoctor';

// Types - Aligned with your doctor model
interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ProfessionalInfo {
  specialization: string;
  department?: string;
  experience: number;
  qualifications: string[];
  licenseNumber: string;
}

interface WorkingDay {
  day: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
}

interface BreakTime {
  day: string;
  startTime: string;
  endTime: string;
  title?: string;
}

interface Schedule {
  workingDays: WorkingDay[];
  slotDuration: number;
  breakTimes: BreakTime[];
}

interface UnavailableDate {
  id?: string;
  date: string;
  reason: string;
  type: "full-day" | "half-day" | "morning" | "afternoon";
  notes?: string;
}

interface Availability {
  isAvailable: boolean;
  maxAppointmentsPerDay: number;
  unavailableDates: UnavailableDate[];
}

interface Fees {
  consultationFee: number;
  followUpFee?: number;
  emergencyFee?: number;
}

interface Statistics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments?: number;
  rating: number;
  reviewCount: number;
}

interface Authentication {
  isVerified?: boolean;
  lastPasswordChange?: Date;
  twoFactorEnabled?: boolean;
}

interface Doctor {
  doctorId: string;
  fullName: string;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  schedule: Schedule;
  availability: Availability;
  fees: Fees;
  statistics: Statistics;
  authentication: Authentication;
  isActive: boolean;
  isVerifiedByAdmin?: boolean;
  registrationDate?: Date;
  approvalDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiResponse {
  success: boolean;
  data: {
    doctor: Doctor;
  };
}

type TabType = 'profile' | 'schedule' | 'fees' | 'statistics';
type EditSectionType = 'personal' | 'professional' | 'none';

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

const DoctorProfile: React.FC = () => {
  const { data, isLoading, error, refetch } = useDoctorProfile();
  const updateProfessionalInfo = useUpdateDoctorProfessionalInfo();
  const updateContactInfo = useUpdateDoctorContactInfo();
  
  const [editingSection, setEditingSection] = useState<EditSectionType>('none');
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Form states - Only required fields
  const [personalFormData, setPersonalFormData] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const [professionalFormData, setProfessionalFormData] = useState<ProfessionalInfo>({
    specialization: '',
    department: '',
    experience: 0,
    qualifications: [],
    licenseNumber: ''
  });

  const [qualificationInput, setQualificationInput] = useState('');

  // Initialize form data when doctor data is loaded
  useEffect(() => {
    if (data?.success && data.data?.doctor) {
      const doctor = data.data.doctor;
      setPersonalFormData(doctor.personalInfo);
      setProfessionalFormData(doctor.professionalInfo);
    }
  }, [data]);

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
        <ErrorSubtext>
          {error instanceof Error ? error.message : 'Please check your connection and try again.'}
        </ErrorSubtext>
        <RetryButton onClick={() => refetch()}>
          🔄 Retry
        </RetryButton>
      </ErrorContainer>
    );
  }

  const doctor = data.data.doctor;

  // Helper functions
  const formatTimestamp = (timestamp: string | Date): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getWorkingDaysCount = (): number => {
    return doctor.schedule.workingDays.filter(day => day.isWorking).length;
  };

  const getSuccessRate = (): string => {
    if (doctor.statistics.totalAppointments === 0) return 'N/A';
    return `${Math.round((doctor.statistics.completedAppointments / doctor.statistics.totalAppointments) * 100)}%`;
  };

  // Form handlers
  const handlePersonalInputChange = (field: keyof PersonalInfo, value: string): void => {
    setPersonalFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfessionalInputChange = (field: keyof ProfessionalInfo, value: string | number | string[]): void => {
    setProfessionalFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddQualification = (): void => {
    if (qualificationInput.trim() && !professionalFormData.qualifications.includes(qualificationInput.trim())) {
      setProfessionalFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, qualificationInput.trim()]
      }));
      setQualificationInput('');
    }
  };

  const handleRemoveQualification = (qualification: string): void => {
    setProfessionalFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q !== qualification)
    }));
  };

  const handleEditSection = (section: EditSectionType): void => {
    if (editingSection === section) {
      setEditingSection('none');
    } else {
      setEditingSection(section);
    }
  };

  const handleSavePersonal = async (): Promise<void> => {
    try {
      // Use the contact info API - only send required fields
      await updateContactInfo.mutateAsync({
        firstName: personalFormData.firstName,
        lastName: personalFormData.lastName,
        email: personalFormData.email,
        phone: personalFormData.phone
      });

      setEditingSection('none');
      refetch(); // Refresh data
    } catch (error) {
      console.error('Error updating personal info:', error);
    }
  };

  const handleSaveProfessional = async (): Promise<void> => {
    try {
      // Use the professional info API - only send required fields
      const data = {
        specialization: professionalFormData.specialization,
        qualifications: professionalFormData.qualifications,
        experience: professionalFormData.experience,
        licenseNumber: professionalFormData.licenseNumber, 
        department: professionalFormData.department 
      }
      await updateProfessionalInfo.mutateAsync(data);

      setEditingSection('none');
      refetch(); // Refresh data
    } catch (error) {
      console.error('Error updating professional info:', error);
    }
  };

  const handleCancel = (): void => {
    // Reset form data to original values
    if (data?.success && data.data?.doctor) {
      const doctor = data.data.doctor;
      setPersonalFormData(doctor.personalInfo);
      setProfessionalFormData(doctor.professionalInfo);
    }
    setEditingSection('none');
  };

  const isSubmitting = updateProfessionalInfo.isPending || updateContactInfo.isPending;

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader>
        <HeaderContent>
          <Title>Doctor Profile</Title>
          <Subtitle>Manage your professional information and settings</Subtitle>
        </HeaderContent>
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
              <StatusIndicator $status={doctor.isActive ? 'active' : 'inactive'} />
            </AvatarContainer>
            
            <UserInfo>
              <UserName>{doctor.fullName}</UserName>
              <UserRole>{doctor.professionalInfo.specialization} Specialist</UserRole>
              {doctor.professionalInfo.department && (
                <UserDepartment>{doctor.professionalInfo.department}</UserDepartment>
              )}
              <StatusBadge $status={doctor.isActive ? 'active' : 'inactive'}>
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
              $active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile Details
            </TabButton>
            <TabButton 
              $active={activeTab === 'schedule'} 
              onClick={() => setActiveTab('schedule')}
            >
              📅 Schedule & Availability
            </TabButton>
            <TabButton 
              $active={activeTab === 'fees'} 
              onClick={() => setActiveTab('fees')}
            >
              💰 Fees & Billing
            </TabButton>
            <TabButton 
              $active={activeTab === 'statistics'} 
              onClick={() => setActiveTab('statistics')}
            >
              📊 Statistics
            </TabButton>
          </TabNavigation>

          {/* Tab Content */}
          <TabContent>
            {activeTab === 'profile' && (
              <ProfileTab>
                {/* Personal Information Section */}
                <SectionContainer>
                  <SectionHeader>
                    <SectionTitle>Personal Information</SectionTitle>
                    <SectionActions>
                      {editingSection !== 'personal' ? (
                        <ActionButton 
                          $variant="secondary" 
                          onClick={() => handleEditSection('personal')}
                          disabled={isSubmitting || editingSection !== 'none'}
                        >
                          ✏️ Edit Personal
                        </ActionButton>
                      ) : (
                        <>
                          <ActionButton 
                            $variant="secondary" 
                            onClick={handleCancel} 
                            disabled={isSubmitting}
                          >
                            Cancel
                          </ActionButton>
                          <ActionButton 
                            $variant="primary" 
                            onClick={handleSavePersonal}
                            disabled={isSubmitting}
                          >
                            {updateContactInfo.isPending ? 'Saving...' : '💾 Save'}
                          </ActionButton>
                        </>
                      )}
                    </SectionActions>
                  </SectionHeader>
                
                  <FormGrid>
                    <FormGroup>
                      <Label>First Name</Label>
                      {editingSection === 'personal' ? (
                        <Input
                          type="text"
                          value={personalFormData.firstName}
                          onChange={(e) => handlePersonalInputChange('firstName', e.target.value)}
                          placeholder="Enter first name"
                        />
                      ) : (
                        <DisplayValue>{capitalizeFirstLetter(doctor.personalInfo.firstName)}</DisplayValue>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>Last Name</Label>
                      {editingSection === 'personal' ? (
                        <Input
                          type="text"
                          value={personalFormData.lastName}
                          onChange={(e) => handlePersonalInputChange('lastName', e.target.value)}
                          placeholder="Enter last name"
                        />
                      ) : (
                        <DisplayValue>{capitalizeFirstLetter(doctor.personalInfo.lastName)}</DisplayValue>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>Email Address</Label>
                      {editingSection === 'personal' ? (
                        <Input
                          type="email"
                          value={personalFormData.email}
                          onChange={(e) => handlePersonalInputChange('email', e.target.value)}
                          placeholder="Enter email address"
                        />
                      ) : (
                        <DisplayValue>{doctor.personalInfo.email}</DisplayValue>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>Phone Number</Label>
                      {editingSection === 'personal' ? (
                        <Input
                          type="tel"
                          value={personalFormData.phone}
                          onChange={(e) => handlePersonalInputChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <DisplayValue>+91 {doctor.personalInfo.phone}</DisplayValue>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>Doctor ID</Label>
                      <DisplayValue>{doctor.doctorId}</DisplayValue>
                    </FormGroup>
                  </FormGrid>
                </SectionContainer>

                {/* Professional Information Section */}
                <SectionContainer>
                  <SectionHeader>
                    <SectionTitle>Professional Information</SectionTitle>
                    <SectionActions>
                      {editingSection !== 'professional' ? (
                        <ActionButton 
                          $variant="secondary" 
                          onClick={() => handleEditSection('professional')}
                          disabled={isSubmitting || editingSection !== 'none'}
                        >
                          ✏️ Edit Professional
                        </ActionButton>
                      ) : (
                        <>
                          <ActionButton 
                            $variant="secondary" 
                            onClick={handleCancel} 
                            disabled={isSubmitting}
                          >
                            Cancel
                          </ActionButton>
                          <ActionButton 
                            $variant="primary" 
                            onClick={handleSaveProfessional}
                            disabled={isSubmitting}
                          >
                            {updateProfessionalInfo.isPending ? 'Saving...' : '💾 Save'}
                          </ActionButton>
                        </>
                      )}
                    </SectionActions>
                  </SectionHeader>
                
                  <FormGrid>
                    <FormGroup>
                      <Label>Specialization</Label>
                      {editingSection === 'professional' ? (
                        <Input
                          type="text"
                          value={professionalFormData.specialization}
                          onChange={(e) => handleProfessionalInputChange('specialization', e.target.value)}
                          placeholder="Enter specialization"
                        />
                      ) : (
                        <DisplayValue>{doctor.professionalInfo.specialization}</DisplayValue>
                      )}
                    </FormGroup>

                    {doctor.professionalInfo.department && (
                      <FormGroup>
                        <Label>Department</Label>
                        {editingSection === 'professional' ? (
                          <Input
                            type="text"
                            value={professionalFormData.department || ''}
                            onChange={(e) => handleProfessionalInputChange('department', e.target.value)}
                            placeholder="Enter department"
                          />
                        ) : (
                          <DisplayValue>{doctor.professionalInfo.department}</DisplayValue>
                        )}
                      </FormGroup>
                    )}

                    <FormGroup>
                      <Label>Experience (Years)</Label>
                      {editingSection === 'professional' ? (
                        <Input
                          type="number"
                          value={professionalFormData.experience.toString()}
                          onChange={(e) => handleProfessionalInputChange('experience', parseInt(e.target.value) || 0)}
                          placeholder="Enter years of experience"
                          min="0"
                          max="50"
                        />
                      ) : (
                        <DisplayValue>{doctor.professionalInfo.experience} Years</DisplayValue>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>License Number</Label>
                      {editingSection === 'professional' ? (
                        <Input
                          type="text"
                          value={professionalFormData.licenseNumber}
                          onChange={(e) => handleProfessionalInputChange('licenseNumber', e.target.value)}
                          placeholder="Enter license number"
                        />
                      ) : (
                        <DisplayValue>{doctor.professionalInfo.licenseNumber}</DisplayValue>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>Qualifications</Label>
                      {editingSection === 'professional' ? (
                        <QualificationsEditor>
                          <QualificationInputContainer>
                            <Input
                              type="text"
                              value={qualificationInput}
                              onChange={(e) => setQualificationInput(e.target.value)}
                              placeholder="Add qualification"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddQualification();
                                }
                              }}
                            />
                            <AddButton type="button" onClick={handleAddQualification}>
                              Add
                            </AddButton>
                          </QualificationInputContainer>
                          <QualificationsList>
                            {professionalFormData.qualifications.map((qualification, index) => (
                              <QualificationTag key={index}>
                                <span>{qualification}</span>
                                <RemoveButton onClick={() => handleRemoveQualification(qualification)}>
                                  ×
                                </RemoveButton>
                              </QualificationTag>
                            ))}
                          </QualificationsList>
                        </QualificationsEditor>
                      ) : (
                        <DisplayValue>{doctor.professionalInfo.qualifications.join(', ')}</DisplayValue>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>Verification Status</Label>
                      <VerificationBadge $status={doctor.authentication.isVerified ? 'verified' : 'pending'}>
                        {doctor.authentication.isVerified ? '✅ Verified' : '⏳ Pending Verification'}
                      </VerificationBadge>
                    </FormGroup>

                    <FormGroup>
                      <Label>Admin Approval</Label>
                      <VerificationBadge $status={doctor.isVerifiedByAdmin ? 'verified' : 'pending'}>
                        {doctor.isVerifiedByAdmin ? '✅ Approved' : '⏳ Pending Approval'}
                      </VerificationBadge>
                    </FormGroup>
                  </FormGrid>
                </SectionContainer>

                {/* Account Information Section */}
                <SectionContainer>
                  <SectionTitle>Account Information</SectionTitle>
                  
                  <InfoGrid>
                    {doctor.registrationDate && (
                      <InfoItem>
                        <InfoLabel>Registration Date</InfoLabel>
                        <InfoValue>{formatTimestamp(doctor.registrationDate)}</InfoValue>
                      </InfoItem>
                    )}
                    <InfoItem>
                      <InfoLabel>Last Updated</InfoLabel>
                      <InfoValue>{formatTimestamp(doctor.updatedAt)}</InfoValue>
                    </InfoItem>
                    {doctor.authentication.lastPasswordChange && (
                      <InfoItem>
                        <InfoLabel>Last Password Change</InfoLabel>
                        <InfoValue>{formatTimestamp(doctor.authentication.lastPasswordChange)}</InfoValue>
                      </InfoItem>
                    )}
                    <InfoItem>
                      <InfoLabel>Two-Factor Auth</InfoLabel>
                      <SecurityBadge $enabled={doctor.authentication.twoFactorEnabled || false}>
                        {doctor.authentication.twoFactorEnabled ? '🔐 Enabled' : '🔓 Disabled'}
                      </SecurityBadge>
                    </InfoItem>
                  </InfoGrid>
                </SectionContainer>
              </ProfileTab>
            )}

            {activeTab === 'schedule' && (
              <ScheduleTab>
                <SectionTitle>Working Schedule</SectionTitle>
                
                <ScheduleGrid>
                  {doctor.schedule.workingDays.map((day, index) => (
                    <ScheduleDay key={index} $isWorking={day.isWorking}>
                      <DayName>{capitalizeFirstLetter(day.day)}</DayName>
                      <DayTime>
                        {day.isWorking 
                          ? `${day.startTime} - ${day.endTime}`
                          : 'Off Day'
                        }
                      </DayTime>
                      <DayStatus $isWorking={day.isWorking}>
                        {day.isWorking ? '✅ Working' : '❌ Off'}
                      </DayStatus>
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
                      <SettingValue>{doctor.availability.maxAppointmentsPerDay} appointments</SettingValue>
                    </SettingContent>
                  </SettingItem>

                  <SettingItem>
                    <SettingIcon>✅</SettingIcon>
                    <SettingContent>
                      <SettingLabel>Currently Available</SettingLabel>
                      <AvailabilityBadge $available={doctor.availability.isAvailable}>
                        {doctor.availability.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                      </AvailabilityBadge>
                    </SettingContent>
                  </SettingItem>
                </ScheduleSettings>

                {doctor.schedule.breakTimes.length > 0 && (
                  <>
                    <SectionTitle style={{ marginTop: '32px' }}>Break Times</SectionTitle>
                    <BreakTimes>
                      {doctor.schedule.breakTimes.map((breakTime, index) => (
                        <BreakTimeItem key={index}>
                          <BreakIcon>☕</BreakIcon>
                          <BreakContent>
                            <BreakLabel>{breakTime.title || 'Break'}</BreakLabel>
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

                  {doctor.fees.followUpFee && (
                    <FeeCard>
                      <FeeIcon>🔄</FeeIcon>
                      <FeeContent>
                        <FeeLabel>Follow-up Fee</FeeLabel>
                        <FeeAmount>{formatCurrency(doctor.fees.followUpFee)}</FeeAmount>
                        <FeeDescription>Follow-up appointment charges</FeeDescription>
                      </FeeContent>
                    </FeeCard>
                  )}

                  {doctor.fees.emergencyFee && (
                    <FeeCard>
                      <FeeIcon>🚨</FeeIcon>
                      <FeeContent>
                        <FeeLabel>Emergency Fee</FeeLabel>
                        <FeeAmount>{formatCurrency(doctor.fees.emergencyFee)}</FeeAmount>
                        <FeeDescription>Emergency consultation charges</FeeDescription>
                      </FeeContent>
                    </FeeCard>
                  )}
                </FeesGrid>

                {doctor.fees.followUpFee && (
                  <>
                    <SectionTitle style={{ marginTop: '32px' }}>Fee Summary</SectionTitle>
                    
                    <FeeSummary>
                      <SummaryItem>
                        <SummaryLabel>Average Fee per Consultation</SummaryLabel>
                        <SummaryValue>
                          {formatCurrency(
                            (doctor.fees.consultationFee + (doctor.fees.followUpFee || 0)) / 2
                          )}
                        </SummaryValue>
                      </SummaryItem>
                      {doctor.fees.emergencyFee && (
                        <SummaryItem>
                          <SummaryLabel>Emergency Markup</SummaryLabel>
                          <SummaryValue>
                            {Math.round(
                              ((doctor.fees.emergencyFee - doctor.fees.consultationFee) / 
                              doctor.fees.consultationFee) * 100
                            )}% higher
                          </SummaryValue>
                        </SummaryItem>
                      )}
                    </FeeSummary>
                  </>
                )}
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

                  {doctor.statistics.cancelledAppointments !== undefined && (
                    <StatCard>
                      <StatCardIcon>❌</StatCardIcon>
                      <StatCardContent>
                        <StatCardLabel>Cancelled</StatCardLabel>
                        <StatCardValue>{doctor.statistics.cancelledAppointments}</StatCardValue>
                      </StatCardContent>
                    </StatCard>
                  )}

                  <StatCard>
                    <StatCardIcon>⭐</StatCardIcon>
                    <StatCardContent>
                      <StatCardLabel>Rating</StatCardLabel>
                      <StatCardValue>
                        {doctor.statistics.rating > 0 ? `${doctor.statistics.rating}/5` : 'No Rating'}
                      </StatCardValue>
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
                      <StatCardValue>{getSuccessRate()}</StatCardValue>
                    </StatCardContent>
                  </StatCard>
                </StatsGrid>

                {doctor.statistics.totalAppointments > 0 && (
                  <>
                    <SectionTitle style={{ marginTop: '32px' }}>Performance Insights</SectionTitle>
                    <InsightsGrid>
                      <InsightCard>
                        <InsightIcon>📈</InsightIcon>
                        <InsightContent>
                          <InsightTitle>Completion Rate</InsightTitle>
                          <InsightValue>
                            {Math.round((doctor.statistics.completedAppointments / 
                            doctor.statistics.totalAppointments) * 100)}%
                          </InsightValue>
                          <InsightDescription>
                            of all appointments completed successfully
                          </InsightDescription>
                        </InsightContent>
                      </InsightCard>

                      {doctor.statistics.cancelledAppointments !== undefined && (
                        <InsightCard>
                          <InsightIcon>📅</InsightIcon>
                          <InsightContent>
                            <InsightTitle>Cancellation Rate</InsightTitle>
                            <InsightValue>
                              {Math.round((doctor.statistics.cancelledAppointments / 
                              doctor.statistics.totalAppointments) * 100)}%
                            </InsightValue>
                            <InsightDescription>
                              of appointments were cancelled
                            </InsightDescription>
                          </InsightContent>
                        </InsightCard>
                      )}

                      {doctor.statistics.rating > 0 && (
                        <InsightCard>
                          <InsightIcon>⭐</InsightIcon>
                          <InsightContent>
                            <InsightTitle>Patient Satisfaction</InsightTitle>
                            <InsightValue>
                              {Math.round((doctor.statistics.rating / 5) * 100)}%
                            </InsightValue>
                            <InsightDescription>
                              based on {doctor.statistics.reviewCount} reviews
                            </InsightDescription>
                          </InsightContent>
                        </InsightCard>
                      )}
                    </InsightsGrid>
                  </>
                )}
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
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 12px;
  text-align: center;
  padding: 40px 20px;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const ErrorText = styled.div`
  color: ${theme.colors.danger};
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ErrorSubtext = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: 14px;
  max-width: 400px;
  line-height: 1.5;
  margin-bottom: 16px;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
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

const ActionButton = styled.button<{ $variant: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  white-space: nowrap;
  
  ${props => {
    switch (props.$variant) {
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
            border-color: ${theme.colors.textSecondary};
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
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  height: fit-content;
`;

const AvatarSection = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  color: white;
  padding: 32px 24px;
  text-align: center;
  position: relative;
`;

const AvatarContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
`;

const AvatarRing = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 4px solid rgba(255, 255, 255, 0.3);
`;

const AvatarText = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: white;
`;

const StatusIndicator = styled.div<{ $status: string }>`
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${props => props.$status === 'active' ? theme.colors.success : theme.colors.textSecondary};
  border: 4px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div``;

const UserName = styled.h2`
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: white;
`;

const UserRole = styled.div`
  font-size: 15px;
  margin-bottom: 4px;
  opacity: 0.9;
  font-weight: 500;
`;

const UserDepartment = styled.div`
  font-size: 14px;
  margin-bottom: 16px;
  opacity: 0.8;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  ${props => props.$status === 'active' ? `
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
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const StatIcon = styled.div`
  font-size: 18px;
  width: 36px;
  height: 36px;
  background: ${theme.colors.primary}15;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  font-weight: 500;
  margin-bottom: 2px;
`;

const StatValue = styled.div`
  font-size: 15px;
  color: ${theme.colors.textPrimary};
  font-weight: 600;
`;

const DetailsSection = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

const TabButton = styled.button<{ $active: boolean }>`
  padding: 18px 22px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  
  ${props => props.$active ? `
    color: ${theme.colors.primary};
    border-bottom-color: ${theme.colors.primary};
    background: white;
    font-weight: 600;
  ` : `
    color: ${theme.colors.textSecondary};
    
    &:hover {
      color: ${theme.colors.textPrimary};
      background: rgba(255, 255, 255, 0.7);
    }
  `}
`;

const TabContent = styled.div`
  padding: 32px;
`;

const ProfileTab = styled.div``;
const ScheduleTab = styled.div``;
const FeesTab = styled.div``;
const StatisticsTab = styled.div``;

const SectionContainer = styled.div`
  margin-bottom: 40px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const SectionActions = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: ${theme.colors.primary};
    border-radius: 2px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;

const DisplayValue = styled.div`
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  border: 1px solid #e2e8f0;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${theme.colors.textSecondary};
    font-weight: 400;
  }
`;

const QualificationsEditor = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const QualificationInputContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const AddButton = styled.button`
  padding: 8px 16px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const QualificationsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const QualificationTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${theme.colors.primary}15;
  border: 1px solid ${theme.colors.primary}30;
  border-radius: 16px;
  font-size: 13px;
  color: ${theme.colors.primary};
  font-weight: 500;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: ${theme.colors.danger}20;
  color: ${theme.colors.danger};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.danger}30;
  }
`;

const VerificationBadge = styled.div<{ $status: string }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  
  ${props => props.$status === 'verified' ? `
    background: ${theme.colors.success}15;
    color: ${theme.colors.success};
    border: 1px solid ${theme.colors.success}30;
  ` : `
    background: ${theme.colors.warning}15;
    color: ${theme.colors.warning};
    border: 1px solid ${theme.colors.warning}30;
  `}
`;

const SecurityBadge = styled.div<{ $enabled: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  
  ${props => props.$enabled ? `
    background: ${theme.colors.success}15;
    color: ${theme.colors.success};
    border: 1px solid ${theme.colors.success}30;
  ` : `
    background: ${theme.colors.danger}15;
    color: ${theme.colors.danger};
    border: 1px solid ${theme.colors.danger}30;
  `}
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
`;

const InfoItem = styled.div`
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const InfoLabel = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  font-weight: 600;
  margin-bottom: 6px;
`;

const InfoValue = styled.div`
  font-size: 15px;
  color: ${theme.colors.textPrimary};
  font-weight: 600;
`;

// Schedule components
const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const ScheduleDay = styled.div<{ $isWorking: boolean }>`
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  border: 2px solid;
  transition: all 0.2s ease;
  
  ${props => props.$isWorking ? `
    background: ${theme.colors.success}10;
    border-color: ${theme.colors.success}30;
    
    &:hover {
      background: ${theme.colors.success}15;
    }
  ` : `
    background: ${theme.colors.danger}10;
    border-color: ${theme.colors.danger}30;
    
    &:hover {
      background: ${theme.colors.danger}15;
    }
  `}
`;

const DayName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  margin-bottom: 6px;
  text-transform: capitalize;
`;

const DayTime = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 8px;
  font-weight: 500;
`;

const DayStatus = styled.div<{ $isWorking: boolean }>`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${props => props.$isWorking ? theme.colors.success : theme.colors.danger};
`;

const ScheduleSettings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const SettingIcon = styled.div`
  font-size: 22px;
  width: 44px;
  height: 44px;
  background: ${theme.colors.primary}15;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SettingContent = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const SettingValue = styled.div`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  font-weight: 500;
`;

const AvailabilityBadge = styled.div<{ $available: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  
  ${props => props.$available ? `
    background: ${theme.colors.success}15;
    color: ${theme.colors.success};
  ` : `
    background: ${theme.colors.danger}15;
    color: ${theme.colors.danger};
  `}
`;

const BreakTimes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const BreakTimeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: ${theme.colors.warning}10;
  border-radius: 10px;
  border: 1px solid ${theme.colors.warning}30;
`;

const BreakIcon = styled.div`
  font-size: 18px;
  width: 36px;
  height: 36px;
  background: ${theme.colors.warning}15;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BreakContent = styled.div`
  flex: 1;
`;

const BreakLabel = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: 3px;
`;

const BreakTime = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  font-weight: 500;
`;

// Fees components
const FeesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`;

const FeeCard = styled.div`
  padding: 28px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const FeeIcon = styled.div`
  font-size: 28px;
  width: 56px;
  height: 56px;
  background: ${theme.colors.primary}15;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const FeeContent = styled.div``;

const FeeLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: 10px;
`;

const FeeAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: 6px;
`;

const FeeDescription = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  line-height: 1.4;
`;

const FeeSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const SummaryItem = styled.div`
  padding: 20px;
  background: ${theme.colors.primary}10;
  border-radius: 12px;
  border: 1px solid ${theme.colors.primary}20;
`;

const SummaryLabel = styled.div`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  font-weight: 600;
  margin-bottom: 6px;
`;

const SummaryValue = styled.div`
  font-size: 18px;
  color: ${theme.colors.primary};
  font-weight: 700;
`;

// Statistics components
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div`
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
`;

const StatCardIcon = styled.div`
  font-size: 24px;
  width: 48px;
  height: 48px;
  background: ${theme.colors.primary}15;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatCardContent = styled.div`
  flex: 1;
`;

const StatCardLabel = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  font-weight: 600;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatCardValue = styled.div`
  font-size: 22px;
  color: ${theme.colors.textPrimary};
  font-weight: 700;
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`;

const InsightCard = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, ${theme.colors.primary}05, ${theme.colors.secondary}05);
  border-radius: 16px;
  border: 1px solid ${theme.colors.primary}20;
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const InsightIcon = styled.div`
  font-size: 24px;
  width: 48px;
  height: 48px;
  background: ${theme.colors.primary}15;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InsightContent = styled.div`
  flex: 1;
`;

const InsightTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const InsightValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: 6px;
`;

const InsightDescription = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  line-height: 1.4;
`;

export default DoctorProfile;