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

interface UserData {
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  profileCreated: string;
  lastLogin: string;
  status: 'active' | 'inactive';
}

const ProfessionalProfile = () => {
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Mock user data
  const [userData, setUserData] = useState<UserData>({
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@hospital.com",
    role: "Senior Cardiologist",
    department: "Cardiology",
    phone: "+91 9876543210",
    profileCreated: "2023-01-15T10:30:00Z",
    lastLogin: "2025-07-03T14:20:00Z",
    status: 'active'
  });

  const [editableData, setEditableData] = useState<UserData>(userData);

  useEffect(() => {
    setEditableData(userData);
  }, [userData]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      setUserData(editableData);
      setEditing(false);
      console.log('Profile updated:', editableData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditableData(userData);
    setEditing(false);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    alert('Logged out successfully!');
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader>
        <HeaderContent>
          <Title>My Profile</Title>
          <Subtitle>Manage your account information and preferences</Subtitle>
        </HeaderContent>
        <HeaderActions>
          {!editing ? (
            <>
              <ActionButton variant="secondary" onClick={handleEdit}>
                ✏️ Edit Profile
              </ActionButton>
              <ActionButton variant="danger" onClick={handleLogout}>
                🚪 Logout
              </ActionButton>
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
                <AvatarText>{getInitials(userData.name)}</AvatarText>
              </AvatarRing>
              <StatusIndicator status={userData.status} />
            </AvatarContainer>
            
            <UserInfo>
              <UserName>{userData.name}</UserName>
              <UserRole>{userData.role}</UserRole>
              <UserDepartment>{userData.department}</UserDepartment>
              <StatusBadge status={userData.status}>
                {capitalizeFirstLetter(userData.status)}
              </StatusBadge>
            </UserInfo>
          </AvatarSection>

          {/* Quick Stats */}
          <QuickStats>
            <StatItem>
              <StatIcon>📅</StatIcon>
              <StatContent>
                <StatLabel>Member Since</StatLabel>
                <StatValue>{new Date(userData.profileCreated).getFullYear()}</StatValue>
              </StatContent>
            </StatItem>
            <StatItem>
              <StatIcon>🕒</StatIcon>
              <StatContent>
                <StatLabel>Last Login</StatLabel>
                <StatValue>{new Date(userData.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</StatValue>
              </StatContent>
            </StatItem>
            <StatItem>
              <StatIcon>👥</StatIcon>
              <StatContent>
                <StatLabel>Department</StatLabel>
                <StatValue>{userData.department}</StatValue>
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
              active={activeTab === 'security'} 
              onClick={() => setActiveTab('security')}
            >
              🔒 Security
            </TabButton>
            <TabButton 
              active={activeTab === 'activity'} 
              onClick={() => setActiveTab('activity')}
            >
              📊 Activity
            </TabButton>
          </TabNavigation>

          {/* Tab Content */}
          <TabContent>
            {activeTab === 'profile' && (
              <ProfileTab>
                <SectionTitle>Personal Information</SectionTitle>
                
                <FormGrid>
                  <FormGroup>
                    <Label>Full Name</Label>
                    {editing ? (
                      <Input
                        type="text"
                        value={editableData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <DisplayValue>{userData.name}</DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Email Address</Label>
                    {editing ? (
                      <Input
                        type="email"
                        value={editableData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                      />
                    ) : (
                      <DisplayValue>{userData.email}</DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Phone Number</Label>
                    {editing ? (
                      <Input
                        type="tel"
                        value={editableData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <DisplayValue>{userData.phone}</DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Role</Label>
                    {editing ? (
                      <Input
                        type="text"
                        value={editableData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        placeholder="Enter your role"
                      />
                    ) : (
                      <DisplayValue>{userData.role}</DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Department</Label>
                    {editing ? (
                      <Select
                        value={editableData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                      >
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Surgery">Surgery</option>
                      </Select>
                    ) : (
                      <DisplayValue>{userData.department}</DisplayValue>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>Status</Label>
                    {editing ? (
                      <Select
                        value={editableData.status}
                        onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Select>
                    ) : (
                      <StatusBadge status={userData.status}>
                        {capitalizeFirstLetter(userData.status)}
                      </StatusBadge>
                    )}
                  </FormGroup>
                </FormGrid>

                <SectionTitle style={{ marginTop: '32px' }}>Account Information</SectionTitle>
                
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Profile Created</InfoLabel>
                    <InfoValue>{formatTimestamp(userData.profileCreated)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Last Login</InfoLabel>
                    <InfoValue>{formatTimestamp(userData.lastLogin)}</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </ProfileTab>
            )}

            {activeTab === 'security' && (
              <SecurityTab>
                <SectionTitle>Security Settings</SectionTitle>
                
                <SecurityGrid>
                  <SecurityItem>
                    <SecurityIcon>🔐</SecurityIcon>
                    <SecurityContent>
                      <SecurityLabel>Password</SecurityLabel>
                      <SecurityDescription>Change your account password</SecurityDescription>
                    </SecurityContent>
                    <SecurityAction>
                      <ActionButton variant="secondary" size="small">
                        Change Password
                      </ActionButton>
                    </SecurityAction>
                  </SecurityItem>

                  <SecurityItem>
                    <SecurityIcon>📱</SecurityIcon>
                    <SecurityContent>
                      <SecurityLabel>Two-Factor Authentication</SecurityLabel>
                      <SecurityDescription>Add an extra layer of security</SecurityDescription>
                    </SecurityContent>
                    <SecurityAction>
                      <ActionButton variant="secondary" size="small">
                        Enable 2FA
                      </ActionButton>
                    </SecurityAction>
                  </SecurityItem>

                  <SecurityItem>
                    <SecurityIcon>🔔</SecurityIcon>
                    <SecurityContent>
                      <SecurityLabel>Login Notifications</SecurityLabel>
                      <SecurityDescription>Get notified of new sign-ins</SecurityDescription>
                    </SecurityContent>
                    <SecurityAction>
                      <ToggleSwitch>
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </ToggleSwitch>
                    </SecurityAction>
                  </SecurityItem>
                </SecurityGrid>
              </SecurityTab>
            )}

            {activeTab === 'activity' && (
              <ActivityTab>
                <SectionTitle>Recent Activity</SectionTitle>
                
                <ActivityList>
                  <ActivityItem>
                    <ActivityIcon>🔐</ActivityIcon>
                    <ActivityContent>
                      <ActivityTitle>Password Changed</ActivityTitle>
                      <ActivityTime>2 days ago</ActivityTime>
                    </ActivityContent>
                  </ActivityItem>

                  <ActivityItem>
                    <ActivityIcon>👤</ActivityIcon>
                    <ActivityContent>
                      <ActivityTitle>Profile Updated</ActivityTitle>
                      <ActivityTime>1 week ago</ActivityTime>
                    </ActivityContent>
                  </ActivityItem>

                  <ActivityItem>
                    <ActivityIcon>🔑</ActivityIcon>
                    <ActivityContent>
                      <ActivityTitle>Successful Login</ActivityTitle>
                      <ActivityTime>Today at 2:20 PM</ActivityTime>
                    </ActivityContent>
                  </ActivityItem>

                  <ActivityItem>
                    <ActivityIcon>📧</ActivityIcon>
                    <ActivityContent>
                      <ActivityTitle>Email Verified</ActivityTitle>
                      <ActivityTime>2 weeks ago</ActivityTime>
                    </ActivityContent>
                  </ActivityItem>
                </ActivityList>
              </ActivityTab>
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

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' | 'danger'; size?: 'small' | 'normal' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: ${props => props.size === 'small' ? '6px 12px' : '8px 16px'};
  border-radius: 6px;
  font-size: ${props => props.size === 'small' ? '12px' : '14px'};
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

const StatusIndicator = styled.div<{ status: 'active' | 'inactive' }>`
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

const StatusBadge = styled.span<{ status: 'active' | 'inactive' }>`
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
const SecurityTab = styled.div``;
const ActivityTab = styled.div``;

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

const SecurityGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SecurityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const SecurityIcon = styled.div`
  font-size: 20px;
  width: 40px;
  height: 40px;
  background: ${theme.colors.primary}15;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SecurityContent = styled.div`
  flex: 1;
`;

const SecurityLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: 2px;
`;

const SecurityDescription = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const SecurityAction = styled.div``;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #ccc;
    transition: 0.2s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background: white;
      transition: 0.2s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background: ${theme.colors.primary};
  }
  
  input:checked + span:before {
    transform: translateX(20px);
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ActivityIcon = styled.div`
  font-size: 16px;
  width: 32px;
  height: 32px;
  background: ${theme.colors.primary}15;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
  margin-bottom: 2px;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

export default ProfessionalProfile;