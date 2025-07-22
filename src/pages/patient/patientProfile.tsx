import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { usePatientProfile } from '@/hooks/usePatient';

const theme = {
  colors: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    white: "#ffffff",
    primaryDark: "#4f46e5",
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
    lightGray: "#e5e7eb",
  },
};

interface PatientData {
  _id: string;
  patientId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup?: string;
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
  medicalInfo: {
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  preferences: {
    preferredLanguage: string;
    communicationMethod: string;
    reminderSettings: {
      enableReminders: boolean;
      reminderTime: number;
    };
  };
  authentication: {
    isVerified: boolean;
  };
  statistics: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowCount: number;
    lastVisit: string;
  };
  registrationSource: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  age: number;
}

const PatientProfileDashboard = () => {
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Use the custom hook to fetch patient profile data
  const { 
    data: apiResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = usePatientProfile();

  // Extract patient data from API response
  const patientData = apiResponse?.data?.patient;

  const [editableData, setEditableData] = useState<PatientData | null>(null);

  useEffect(() => {
    if (patientData) {
      setEditableData(patientData);
    }
  }, [patientData]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getGenderIcon = (gender: string) => {
    return gender === "male" ? "👨" : gender === "female" ? "👩" : "👤";
  };

  const handleEdit = () => {
    if (editing) {
      handleSave();
    } else {
      setEditing(true);
    }
  };

  const handleSave = async () => {
    if (!editableData) return;
    
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual update API call
      // await updatePatientProfile(editableData);
      
      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Refetch the data to get the latest from the server
      await refetch();
      
      setEditing(false);
      console.log("Patient profile updated:", editableData);
      alert("Patient profile updated successfully!");
    } catch (error) {
      console.error("Error updating patient profile:", error);
      alert("Error updating patient profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (patientData) {
      setEditableData(patientData);
    }
    setEditing(false);
  };

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handlePersonalInfoChange = (
    field: keyof PatientData["personalInfo"],
    value: string
  ) => {
    if (!editableData) return;
    
    setEditableData((prev) => ({
      ...prev!,
      personalInfo: {
        ...prev!.personalInfo,
        [field]: value,
      },
    }));
  };

  const handleContactInfoChange = (
    field: keyof PatientData["contactInfo"],
    value: string
  ) => {
    if (!editableData) return;
    
    setEditableData((prev) => ({
      ...prev!,
      contactInfo: {
        ...prev!.contactInfo,
        [field]: value,
      },
    }));
  };

  const handleAddressChange = (
    field: keyof PatientData["contactInfo"]["address"],
    value: string
  ) => {
    if (!editableData) return;
    
    setEditableData((prev) => ({
      ...prev!,
      contactInfo: {
        ...prev!.contactInfo,
        address: {
          ...prev!.contactInfo.address,
          [field]: value,
        },
      },
    }));
  };

  // Handle loading state
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading patient profile...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  // Handle error state
  if (isError || error) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Failed to load patient profile</ErrorTitle>
          <ErrorMessage>
            {error instanceof Error ? error.message : 'An unexpected error occurred while fetching patient data.'}
          </ErrorMessage>
          <RetryButton onClick={handleRefresh}>
            <RefreshIcon>🔄</RefreshIcon>
            Try Again
          </RetryButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // Handle empty/no data state
  if (!patientData) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorIcon>👤</ErrorIcon>
          <ErrorTitle>No patient data found</ErrorTitle>
          <ErrorMessage>
            Unable to load patient profile information. Please try refreshing the page.
          </ErrorMessage>
          <RetryButton onClick={handleRefresh}>
            <RefreshIcon>🔄</RefreshIcon>
            Refresh
          </RetryButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader>
        <HeaderContent>
          <Title>Patient Profile</Title>
          <Subtitle>Manage patient information and medical records</Subtitle>
        </HeaderContent>
        <HeaderActions>
          {!editing ? (
            <>
              <ActionButton variant="secondary" onClick={handleRefresh} disabled={isLoading}>
                🔄 Refresh
              </ActionButton>
              <ActionButton variant="secondary" onClick={handleEdit}>
                ✏️ Edit Profile
              </ActionButton>
              <ActionButton variant="primary">📋 View Records</ActionButton>
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
                {isSubmitting ? "Saving..." : "💾 Save Changes"}
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
                <AvatarText>{getInitials(patientData.fullName || `${patientData.personalInfo.firstName} ${patientData.personalInfo.lastName}`)}</AvatarText>
              </AvatarRing>
              <StatusIndicator
                status={patientData.isActive ? "active" : "inactive"}
              />
            </AvatarContainer>

            <UserInfo>
              <UserName>{patientData.fullName || `${patientData.personalInfo.firstName} ${patientData.personalInfo.lastName}`}</UserName>
              <UserDetails>
                <DetailRow>
                  <span>
                    {getGenderIcon(patientData.personalInfo.gender)}{" "}
                    {capitalizeFirstLetter(patientData.personalInfo.gender)}
                  </span>
                  <span>
                    • Age {patientData.age || calculateAge(patientData.personalInfo.dateOfBirth)}
                  </span>
                </DetailRow>
                <PatientId>ID: {patientData.patientId}</PatientId>
              </UserDetails>
              <StatusBadge
                status={patientData.isActive ? "active" : "inactive"}
              >
                {patientData.isActive ? "Active Patient" : "Inactive"}
              </StatusBadge>
            </UserInfo>
          </AvatarSection>

          {/* Quick Stats */}
          <QuickStats>
            <StatItem>
              <StatIcon>🩺</StatIcon>
              <StatContent>
                <StatLabel>Blood Group</StatLabel>
                <StatValue>{patientData.personalInfo.bloodGroup}</StatValue>
              </StatContent>
            </StatItem>
            <StatItem>
              <StatIcon>📅</StatIcon>
              <StatContent>
                <StatLabel>Total Visits</StatLabel>
                <StatValue>
                  {patientData.statistics?.totalAppointments || 0}
                </StatValue>
              </StatContent>
            </StatItem>
            <StatItem>
              <StatIcon>🕒</StatIcon>
              <StatContent>
                <StatLabel>Last Visit</StatLabel>
                <StatValue>
                  {patientData.statistics?.lastVisit 
                    ? new Date(patientData.statistics.lastVisit).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "No visits"
                  }
                </StatValue>
              </StatContent>
            </StatItem>
            <StatItem>
              <StatIcon>✅</StatIcon>
              <StatContent>
                <StatLabel>Completed</StatLabel>
                <StatValue>
                  {patientData.statistics?.completedAppointments || 0}
                </StatValue>
              </StatContent>
            </StatItem>
          </QuickStats>
        </ProfileCard>

        {/* Details Section */}
        <DetailsSection>
          {/* Tab Navigation */}
          <TabNavigation>
            <TabButton
              active={activeTab === "personal"}
              onClick={() => setActiveTab("personal")}
            >
              👤 Personal Info
            </TabButton>
            <TabButton
              active={activeTab === "medical"}
              onClick={() => setActiveTab("medical")}
            >
              🏥 Medical Info
            </TabButton>
            <TabButton
              active={activeTab === "statistics"}
              onClick={() => setActiveTab("statistics")}
            >
              📊 Statistics
            </TabButton>
            <TabButton
              active={activeTab === "preferences"}
              onClick={() => setActiveTab("preferences")}
            >
              ⚙️ Preferences
            </TabButton>
          </TabNavigation>

          {/* Tab Content */}
          <TabContent>
            {activeTab === "personal" && editableData && (
              <PersonalTab>
                <SectionTitle>Personal Information</SectionTitle>

                <FormGrid>
                  <FormGroup>
                    <Label>First Name</Label>
                    {editing ? (
                      <Input
                        type="text"
                        value={editableData.personalInfo.firstName}
                        onChange={(e) =>
                          handlePersonalInfoChange("firstName", e.target.value)
                        }
                        placeholder="Enter first name"
                      />
                    ) : (
                      <DisplayValue>
                        {patientData.personalInfo.firstName}
                      </DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Last Name</Label>
                    {editing ? (
                      <Input
                        type="text"
                        value={editableData.personalInfo.lastName}
                        onChange={(e) =>
                          handlePersonalInfoChange("lastName", e.target.value)
                        }
                        placeholder="Enter last name"
                      />
                    ) : (
                      <DisplayValue>
                        {patientData.personalInfo.lastName}
                      </DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Date of Birth</Label>
                    {editing ? (
                      <Input
                        type="date"
                        value={
                          editableData.personalInfo.dateOfBirth.split("T")[0]
                        }
                        onChange={(e) =>
                          handlePersonalInfoChange(
                            "dateOfBirth",
                            e.target.value + "T00:00:00.000Z"
                          )
                        }
                      />
                    ) : (
                      <DisplayValue>
                        {new Date(
                          patientData.personalInfo.dateOfBirth
                        ).toLocaleDateString("en-IN")}
                      </DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Gender</Label>
                    {editing ? (
                      <Select
                        value={editableData.personalInfo.gender}
                        onChange={(e) =>
                          handlePersonalInfoChange("gender", e.target.value)
                        }
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Select>
                    ) : (
                      <DisplayValue>
                        {capitalizeFirstLetter(patientData.personalInfo.gender)}
                      </DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Blood Group</Label>
                    {editing ? (
                      <Select
                        value={editableData.personalInfo.bloodGroup}
                        onChange={(e) =>
                          handlePersonalInfoChange("bloodGroup", e.target.value)
                        }
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </Select>
                    ) : (
                      <DisplayValue>
                        {patientData.personalInfo.bloodGroup}
                      </DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Email</Label>
                    {editing ? (
                      <Input
                        type="email"
                        value={editableData.contactInfo.email}
                        onChange={(e) =>
                          handleContactInfoChange("email", e.target.value)
                        }
                        placeholder="Enter email address"
                      />
                    ) : (
                      <DisplayValue>
                        {patientData.contactInfo.email}
                      </DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Phone Number</Label>
                    {editing ? (
                      <Input
                        type="tel"
                        value={editableData.contactInfo.phone}
                        onChange={(e) =>
                          handleContactInfoChange("phone", e.target.value)
                        }
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <DisplayValue>
                        {patientData.contactInfo.phone}
                      </DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Alternate Phone</Label>
                    {editing ? (
                      <Input
                        type="tel"
                        value={editableData.contactInfo.alternatePhone}
                        onChange={(e) =>
                          handleContactInfoChange(
                            "alternatePhone",
                            e.target.value
                          )
                        }
                        placeholder="Enter alternate phone"
                      />
                    ) : (
                      <DisplayValue>
                        {patientData.contactInfo.alternatePhone}
                      </DisplayValue>
                    )}
                  </FormGroup>
                </FormGrid>

                <SectionTitle style={{ marginTop: "32px" }}>
                  Address Information
                </SectionTitle>

                <FormGrid>
                  <FormGroup>
                    <Label>Street Address</Label>
                    {editing ? (
                      <Input
                        type="text"
                        value={editableData.contactInfo.address.street}
                        onChange={(e) =>
                          handleAddressChange("street", e.target.value)
                        }
                        placeholder="Enter street address"
                      />
                    ) : (
                      <DisplayValue>
                        {patientData.contactInfo.address?.street}
                      </DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>City</Label>
                    {editing ? (
                      <Input
                        type="text"
                        value={editableData.contactInfo.address.city}
                        onChange={(e) =>
                          handleAddressChange("city", e.target.value)
                        }
                        placeholder="Enter city"
                      />
                    ) : (
                      <DisplayValue>
                        {patientData.contactInfo.address?.city}
                      </DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>State</Label>
                    {editing ? (
                      <Input
                        type="text"
                        value={editableData.contactInfo.address.state}
                        onChange={(e) =>
                          handleAddressChange("state", e.target.value)
                        }
                        placeholder="Enter state"
                      />
                    ) : (
                      <DisplayValue>
                        {patientData.contactInfo.address?.state}
                      </DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>ZIP Code</Label>
                    {editing ? (
                      <Input
                        type="text"
                        value={editableData.contactInfo.address.zipCode}
                        onChange={(e) =>
                          handleAddressChange("zipCode", e.target.value)
                        }
                        placeholder="Enter ZIP code"
                      />
                    ) : (
                      <DisplayValue>
                        {patientData.contactInfo.address?.zipCode}
                      </DisplayValue>
                    )}
                  </FormGroup>
                </FormGrid>

                <SectionTitle style={{ marginTop: "32px" }}>
                  Account Information
                </SectionTitle>

                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Patient Since</InfoLabel>
                    <InfoValue>
                      {formatTimestamp(patientData.createdAt)}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Last Updated</InfoLabel>
                    <InfoValue>
                      {formatTimestamp(patientData.updatedAt)}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Registration Source</InfoLabel>
                    <InfoValue>
                      {capitalizeFirstLetter(patientData.registrationSource)}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Verification Status</InfoLabel>
                    <InfoValue>
                      <VerificationBadge
                        verified={patientData.authentication?.isVerified}
                      >
                        {patientData.authentication?.isVerified
                          ? "✅ Verified"
                          : "❌ Not Verified"}
                      </VerificationBadge>
                    </InfoValue>
                  </InfoItem>
                </InfoGrid>
              </PersonalTab>
            )}

            {activeTab === "medical" && (
              <MedicalTab>
                <SectionTitle>Medical Information</SectionTitle>

                <MedicalGrid>
                  <MedicalSection>
                    <MedicalSectionTitle>🚨 Allergies</MedicalSectionTitle>
                    <TagContainer>
                      {patientData.medicalInfo?.allergies?.map(
                        (allergy, index) => (
                          <MedicalTag key={index} type="danger">
                            {allergy}
                          </MedicalTag>
                        )
                      )}
                      {(!patientData.medicalInfo?.allergies || patientData.medicalInfo.allergies.length === 0) && (
                        <EmptyState>No known allergies</EmptyState>
                      )}
                    </TagContainer>
                  </MedicalSection>

                  <MedicalSection>
                    <MedicalSectionTitle>
                      🏥 Chronic Conditions
                    </MedicalSectionTitle>
                    <TagContainer>
                      {patientData.medicalInfo?.chronicConditions?.map(
                        (condition, index) => (
                          <MedicalTag key={index} type="warning">
                            {condition}
                          </MedicalTag>
                        )
                      )}
                      {(!patientData.medicalInfo?.chronicConditions || patientData.medicalInfo.chronicConditions.length === 0) && (
                        <EmptyState>No chronic conditions</EmptyState>
                      )}
                    </TagContainer>
                  </MedicalSection>

                  <MedicalSection>
                    <MedicalSectionTitle>
                      💊 Current Medications
                    </MedicalSectionTitle>
                    <TagContainer>
                      {patientData.medicalInfo?.currentMedications?.map(
                        (medication, index) => (
                          <MedicalTag key={index} type="primary">
                            {medication}
                          </MedicalTag>
                        )
                      )}
                      {(!patientData.medicalInfo?.currentMedications || patientData.medicalInfo.currentMedications.length === 0) && (
                        <EmptyState>No current medications</EmptyState>
                      )}
                    </TagContainer>
                  </MedicalSection>
                </MedicalGrid>

                {patientData.medicalInfo?.emergencyContact && (
                  <>
                    <SectionTitle style={{ marginTop: "32px" }}>
                      Emergency Contact
                    </SectionTitle>

                    <EmergencyContactCard>
                      <EmergencyIcon>🚨</EmergencyIcon>
                      <EmergencyInfo>
                        <EmergencyName>
                          {patientData.medicalInfo.emergencyContact.name}
                        </EmergencyName>
                        <EmergencyRelation>
                          {patientData.medicalInfo.emergencyContact.relationship}
                        </EmergencyRelation>
                        <EmergencyPhone>
                          {patientData.medicalInfo.emergencyContact.phone}
                        </EmergencyPhone>
                      </EmergencyInfo>
                      <EmergencyAction>
                        <ActionButton variant="primary" size="small">
                          📞 Call
                        </ActionButton>
                      </EmergencyAction>
                    </EmergencyContactCard>
                  </>
                )}
              </MedicalTab>
            )}

            {activeTab === "statistics" && (
              <StatisticsTab>
                <SectionTitle>Appointment Statistics</SectionTitle>

                <StatsGrid>
                  <StatCard>
                    <StatCardIcon>📅</StatCardIcon>
                    <StatCardContent>
                      <StatCardNumber>
                        {patientData.statistics?.totalAppointments || 0}
                      </StatCardNumber>
                      <StatCardLabel>Total Appointments</StatCardLabel>
                    </StatCardContent>
                  </StatCard>

                  <StatCard>
                    <StatCardIcon>✅</StatCardIcon>
                    <StatCardContent>
                      <StatCardNumber>
                        {patientData.statistics?.completedAppointments || 0}
                      </StatCardNumber>
                      <StatCardLabel>Completed</StatCardLabel>
                    </StatCardContent>
                  </StatCard>

                  <StatCard>
                    <StatCardIcon>❌</StatCardIcon>
                    <StatCardContent>
                      <StatCardNumber>
                        {patientData.statistics?.cancelledAppointments || 0}
                      </StatCardNumber>
                      <StatCardLabel>Cancelled</StatCardLabel>
                    </StatCardContent>
                  </StatCard>

                  <StatCard>
                    <StatCardIcon>👻</StatCardIcon>
                    <StatCardContent>
                      <StatCardNumber>
                        {patientData.statistics?.noShowCount || 0}
                      </StatCardNumber>
                      <StatCardLabel>No Shows</StatCardLabel>
                    </StatCardContent>
                  </StatCard>
                </StatsGrid>

                {patientData.statistics?.lastVisit && (
                  <>
                    <SectionTitle style={{ marginTop: "32px" }}>
                      Visit History
                    </SectionTitle>

                    <VisitHistoryCard>
                      <VisitHistoryItem>
                        <VisitDate>Last Visit</VisitDate>
                        <VisitDetails>
                          {formatTimestamp(patientData.statistics.lastVisit)}
                        </VisitDetails>
                      </VisitHistoryItem>
                      <VisitHistoryItem>
                        <VisitDate>Completion Rate</VisitDate>
                        <VisitDetails>
                          {patientData.statistics.totalAppointments > 0 
                            ? Math.round(
                                (patientData.statistics.completedAppointments /
                                  patientData.statistics.totalAppointments) *
                                  100
                              )
                            : 0
                          }%
                        </VisitDetails>
                      </VisitHistoryItem>
                    </VisitHistoryCard>
                  </>
                )}
              </StatisticsTab>
            )}

            {activeTab === "preferences" && (
              <PreferencesTab>
                <SectionTitle>Communication Preferences</SectionTitle>

                <PreferencesGrid>
                  <PreferenceItem>
                    <PreferenceIcon>🌐</PreferenceIcon>
                    <PreferenceContent>
                      <PreferenceLabel>Preferred Language</PreferenceLabel>
                      <PreferenceValue>
                        {patientData.preferences?.preferredLanguage 
                          ? capitalizeFirstLetter(patientData.preferences.preferredLanguage)
                          : "Not specified"
                        }
                      </PreferenceValue>
                    </PreferenceContent>
                  </PreferenceItem>

                  <PreferenceItem>
                    <PreferenceIcon>💬</PreferenceIcon>
                    <PreferenceContent>
                      <PreferenceLabel>Communication Method</PreferenceLabel>
                      <PreferenceValue>
                        {patientData.preferences?.communicationMethod 
                          ? capitalizeFirstLetter(patientData.preferences.communicationMethod)
                          : "Not specified"
                        }
                      </PreferenceValue>
                    </PreferenceContent>
                  </PreferenceItem>

                  <PreferenceItem>
                    <PreferenceIcon>🔔</PreferenceIcon>
                    <PreferenceContent>
                      <PreferenceLabel>Reminder Settings</PreferenceLabel>
                      <PreferenceValue>
                        {patientData.preferences?.reminderSettings?.enableReminders
                          ? `Enabled (${patientData.preferences.reminderSettings.reminderTime}h before)`
                          : "Disabled"}
                      </PreferenceValue>
                    </PreferenceContent>
                  </PreferenceItem>
                </PreferencesGrid>
              </PreferencesTab>
            )}
          </TabContent>
        </DetailsSection>
      </ContentContainer>

      {/* Loading overlay for mutations */}
      {isSubmitting && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>Saving patient data...</LoadingText>
        </LoadingOverlay>
      )}
    </PageContainer>
  );
};

// Styled Components (keeping all the existing styles)
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;

  @media (max-width: 768px) {
    padding: 16px;
  }
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
  border: 3px solid #e5e7eb;
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

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #dc2626;
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  max-width: 400px;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

const RefreshIcon = styled.span`
  font-size: 14px;
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

const ActionButton = styled.button<{
  variant: "primary" | "secondary" | "danger";
  size?: "small" | "normal";
}>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: ${(props) => (props.size === "small" ? "6px 12px" : "8px 16px")};
  border-radius: 6px;
  font-size: ${(props) => (props.size === "small" ? "12px" : "14px")};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: ${theme.colors.primary};
          color: white;
          border-color: ${theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.primaryDark};
            transform: translateY(-1px);
          }
        `;
      case "secondary":
        return `
          background: white;
          color: ${theme.colors.textPrimary};
          border-color: ${theme.colors.lightGray};
          
          &:hover:not(:disabled) {
            background: #f9fafb;
          }
        `;
      case "danger":
        return `
          background: white;
          color: ${theme.colors.danger};
          border-color: ${theme.colors.danger}30;
          
          &:hover:not(:disabled) {
            background: ${theme.colors.danger}10;
          }
        `;
      default:
        return "";
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
  background: linear-gradient(
    135deg,
    ${theme.colors.primary} 0%,
    ${theme.colors.secondary} 100%
  );
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

const StatusIndicator = styled.div<{ status: "active" | "inactive" }>`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${(props) =>
    props.status === "active"
      ? theme.colors.success
      : theme.colors.textSecondary};
  border: 3px solid white;
`;

const UserInfo = styled.div``;

const UserName = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
`;

const UserDetails = styled.div`
  margin-bottom: 12px;
`;

const DetailRow = styled.div`
  font-size: 14px;
  margin-bottom: 4px;
  opacity: 0.9;
`;

const PatientId = styled.div`
  font-size: 12px;
  opacity: 0.8;
  font-family: monospace;
`;

const StatusBadge = styled.span<{ status: "active" | "inactive" }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);

  ${(props) =>
    props.status === "active"
      ? `
    color: ${theme.colors.success};
    background: white;
    border-color: ${theme.colors.success}30;
  `
      : `
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

const TabButton = styled.button<{ active: boolean }>`
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

  ${(props) =>
    props.active
      ? `
    color: ${theme.colors.primary};
    border-bottom-color: ${theme.colors.primary};
    background: white;
  `
      : `
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

const PersonalTab = styled.div``;
const MedicalTab = styled.div``;
const StatisticsTab = styled.div``;
const PreferencesTab = styled.div``;

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

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
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

const VerificationBadge = styled.span<{ verified: boolean }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  ${(props) =>
    props.verified
      ? `
    background: ${theme.colors.success}15;
    color: ${theme.colors.success};
  `
      : `
    background: ${theme.colors.danger}15;
    color: ${theme.colors.danger};
  `}
`;

// Medical Tab Styles
const MedicalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const MedicalSection = styled.div`
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const MedicalSectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const MedicalTag = styled.span<{ type: "danger" | "warning" | "primary" }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;

  ${(props) => {
    switch (props.type) {
      case "danger":
        return `
          background: ${theme.colors.danger}15;
          color: ${theme.colors.danger};
          border: 1px solid ${theme.colors.danger}30;
        `;
      case "warning":
        return `
          background: ${theme.colors.warning}15;
          color: ${theme.colors.warning};
          border: 1px solid ${theme.colors.warning}30;
        `;
      case "primary":
        return `
          background: ${theme.colors.primary}15;
          color: ${theme.colors.primary};
          border: 1px solid ${theme.colors.primary}30;
        `;
      default:
        return "";
    }
  }}
`;

const EmptyState = styled.div`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  font-style: italic;
`;

const EmergencyContactCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff5f5;
  border-radius: 8px;
  border: 1px solid #fed7d7;
`;

const EmergencyIcon = styled.div`
  font-size: 24px;
  width: 48px;
  height: 48px;
  background: ${theme.colors.danger}15;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmergencyInfo = styled.div`
  flex: 1;
`;

const EmergencyName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: 2px;
`;

const EmergencyRelation = styled.div`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const EmergencyPhone = styled.div`
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  font-weight: 500;
`;

const EmergencyAction = styled.div``;

// Statistics Tab Styles
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatCardIcon = styled.div`
  font-size: 24px;
  width: 48px;
  height: 48px;
  background: ${theme.colors.primary}15;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatCardContent = styled.div`
  flex: 1;
`;

const StatCardNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const StatCardLabel = styled.div`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  font-weight: 500;
`;

const VisitHistoryCard = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const VisitHistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const VisitDate = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const VisitDetails = styled.div`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
`;

// Preferences Tab Styles
const PreferencesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const PreferenceItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const PreferenceIcon = styled.div`
  font-size: 20px;
  width: 40px;
  height: 40px;
  background: ${theme.colors.primary}15;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PreferenceContent = styled.div`
  flex: 1;
`;

const PreferenceLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: 2px;
`;

const PreferenceValue = styled.div`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
`;

export default PatientProfileDashboard;