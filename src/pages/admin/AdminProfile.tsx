import { useState } from "react";
import styled from "styled-components";
import {
  useAdminProfile,
  useEnableTwoFA,
  useVerifyTwoFA,
  useDisableTwoFA,
  useChangePassword,
} from "@/hooks/useAdmin";
import { TwoFAModal, DisableTwoFAModal, ChangePasswordModal } from "@/components";

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

const AdminProfile = () => {
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [twoFAData, setTwoFAData] = useState(null);

  // Fetch admin profile data
  const {
    data: profileResponse,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useAdminProfile();

  const enableTwoFAMutation = useEnableTwoFA();
  const verifyTwoFAMutation = useVerifyTwoFA();
  const disableTwoFAMutation = useDisableTwoFA();
  const changePasswordMutation = useChangePassword();

  // Extract admin data from response
  const adminData = profileResponse?.data?.user;

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

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  // Add this new function to handle password change
  const handlePasswordChange = async (data: { 
    currentPassword: string; 
    newPassword: string; 
    confirmPassword: string; 
  }) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      setShowChangePasswordModal(false);
      refetch(); // Refresh the profile data
      // Optional: Show success toast
      alert("Password changed successfully! Please log in again with your new password.");
    } catch (error) {
      console.error("Failed to change password:", error);
      throw error; 
    }
  };

  const handleToggle2FA = async () => {
    if (adminData.twoFactorEnabled) {
      setShowDisable2FAModal(true);
    } else {
      try {
        const response = await enableTwoFAMutation.mutateAsync();
        setTwoFAData(response);
        setShow2FAModal(true);
      } catch (err) {
        console.error(err);
        alert("Failed to initiate 2FA");
      }
    }
  };

  const handleDisable2FA = async (data: {
    password: string;
    twoFactorCode: string;
  }) => {
    try {
      await disableTwoFAMutation.mutateAsync(data);
      setShowDisable2FAModal(false);
      refetch(); // Refresh the profile data
      // Optional: Show success toast
      alert("Two-factor authentication has been disabled successfully");
    } catch (error) {
      console.error("Failed to disable 2FA:", error);
      // Error will be shown by the modal's error handling or you can add custom error handling here
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleVerify2FA = async () => {
    try {
      const verifyResponse = await verifyTwoFAMutation.mutateAsync(otp);
      console.log("response", verifyResponse);
      // alert("2FA enabled successfully");
      setShow2FAModal(false);
      setOtp("");
      refetch();
    } catch (err) {
      console.error(err);
      alert("Invalid code. Please try again.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading profile...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  // Error state
  if (isError || !adminData) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Failed to Load Profile</ErrorTitle>
          <ErrorMessage>
            {error?.message || "Unable to load admin profile data"}
          </ErrorMessage>
          <RetryButton onClick={() => refetch()}>Try Again</RetryButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer>
        {/* Header */}
        <PageHeader>
          <HeaderContent>
            <Title>Admin Profile</Title>
            <Subtitle>
              Manage your administrative account settings and preferences
            </Subtitle>
          </HeaderContent>
          {/* <HeaderActions>
            <ActionButton variant="secondary" onClick={handleChangePassword}>
              🔐 Change Password
            </ActionButton>
          </HeaderActions> */}
        </PageHeader>

        {/* Profile Content */}
        <ContentContainer>
          {/* Profile Card */}
          <ProfileCard>
            {/* Avatar Section */}
            <AvatarSection>
              <AvatarContainer>
                <AvatarRing>
                  <AvatarText>
                    {getInitials(adminData.firstName, adminData.lastName)}
                  </AvatarText>
                </AvatarRing>
                <StatusIndicator
                  status={adminData.isActive ? "active" : "inactive"}
                />
              </AvatarContainer>

              <UserInfo>
                <UserName>{adminData.fullName}</UserName>
                <UserRole>{adminData.role}</UserRole>
                <UserEmail>{adminData.email}</UserEmail>
                <StatusBadge status={adminData.status.toLowerCase()}>
                  {capitalizeFirstLetter(adminData.status)}
                </StatusBadge>
              </UserInfo>
            </AvatarSection>

            {/* Quick Stats */}
            <QuickStats>
              <StatItem>
                <StatIcon>📅</StatIcon>
                <StatContent>
                  <StatLabel>Admin Since</StatLabel>
                  <StatValue>
                    {new Date(adminData.createdAt).getFullYear()}
                  </StatValue>
                </StatContent>
              </StatItem>
              <StatItem>
                <StatIcon>🕒</StatIcon>
                <StatContent>
                  <StatLabel>Last Login</StatLabel>
                  <StatValue>
                    {adminData.lastLogin
                      ? new Date(adminData.lastLogin).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short" }
                        )
                      : "Never"}
                  </StatValue>
                </StatContent>
              </StatItem>
              <StatItem>
                <StatIcon>🛡️</StatIcon>
                <StatContent>
                  <StatLabel>Permissions</StatLabel>
                  <StatValue>{adminData.permissions.length}</StatValue>
                </StatContent>
              </StatItem>
              <StatItem>
                <StatIcon>🔐</StatIcon>
                <StatContent>
                  <StatLabel>2FA Status</StatLabel>
                  <StatValue>
                    {adminData.twoFactorEnabled ? "Enabled" : "Disabled"}
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
                active={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
              >
                👤 Profile Details
              </TabButton>
              <TabButton
                active={activeTab === "permissions"}
                onClick={() => setActiveTab("permissions")}
              >
                🛡️ Permissions
              </TabButton>
              <TabButton
                active={activeTab === "security"}
                onClick={() => setActiveTab("security")}
              >
                🔒 Security
              </TabButton>
              <TabButton
                active={activeTab === "activity"}
                onClick={() => setActiveTab("activity")}
              >
                📊 Activity
              </TabButton>
            </TabNavigation>

            {/* Tab Content */}
            <TabContent>
              {activeTab === "profile" && (
                <ProfileTab>
                  <SectionTitle>Personal Information</SectionTitle>

                  <FormGrid>
                    <FormGroup>
                      <Label>First Name</Label>
                      <DisplayValue>{adminData.firstName}</DisplayValue>
                    </FormGroup>

                    <FormGroup>
                      <Label>Last Name</Label>
                      <DisplayValue>{adminData.lastName}</DisplayValue>
                    </FormGroup>

                    <FormGroup>
                      <Label>Email Address</Label>
                      <DisplayValue>{adminData.email}</DisplayValue>
                    </FormGroup>

                    <FormGroup>
                      <Label>Phone Number</Label>
                      <DisplayValue>{adminData.phone}</DisplayValue>
                    </FormGroup>

                    <FormGroup>
                      <Label>Role</Label>
                      <DisplayValue>{adminData.role}</DisplayValue>
                    </FormGroup>

                    <FormGroup>
                      <Label>Status</Label>
                      <StatusBadge status={adminData.status.toLowerCase()}>
                        {capitalizeFirstLetter(adminData.status)}
                      </StatusBadge>
                    </FormGroup>
                  </FormGrid>

                  <SectionTitle style={{ marginTop: "32px" }}>
                    Account Information
                  </SectionTitle>

                  <InfoGrid>
                    <InfoItem>
                      <InfoLabel>Account Created</InfoLabel>
                      <InfoValue>
                        {formatTimestamp(adminData.createdAt)}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Last Updated</InfoLabel>
                      <InfoValue>
                        {formatTimestamp(adminData.updatedAt)}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Last Login</InfoLabel>
                      <InfoValue>
                        {adminData.lastLogin
                          ? formatTimestamp(adminData.lastLogin)
                          : "Never logged in"}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Account Status</InfoLabel>
                      <InfoValue>
                        <StatusIndicatorInline active={adminData.isActive} />
                        {adminData.isActive ? "Active" : "Inactive"}
                      </InfoValue>
                    </InfoItem>
                  </InfoGrid>
                </ProfileTab>
              )}

              {activeTab === "permissions" && (
                <PermissionsTab>
                  <SectionTitle>Admin Permissions</SectionTitle>
                  <PermissionsDescription>
                    Your current administrative permissions and access levels
                    within the system.
                  </PermissionsDescription>

                  <PermissionsGrid>
                    {adminData.permissions.map((permission, index) => (
                      <PermissionCard key={index}>
                        <PermissionIcon>🔐</PermissionIcon>
                        <PermissionContent>
                          <PermissionName>{permission}</PermissionName>
                          <PermissionDescription>
                            {getPermissionDescription(permission)}
                          </PermissionDescription>
                        </PermissionContent>
                        <PermissionStatus>
                          <ActiveBadge>Active</ActiveBadge>
                        </PermissionStatus>
                      </PermissionCard>
                    ))}
                  </PermissionsGrid>

                  {adminData.permissions.length === 0 && (
                    <EmptyPermissions>
                      <EmptyIcon>🚫</EmptyIcon>
                      <EmptyTitle>No Permissions Assigned</EmptyTitle>
                      <EmptyDescription>
                        Contact your system administrator to request
                        permissions.
                      </EmptyDescription>
                    </EmptyPermissions>
                  )}
                </PermissionsTab>
              )}

              {activeTab === "security" && (
                <SecurityTab>
                  <SectionTitle>Security Settings</SectionTitle>

                  <SecurityGrid>
                    <SecurityItem>
                      <SecurityIcon>🔐</SecurityIcon>
                      <SecurityContent>
                        <SecurityLabel>Password</SecurityLabel>
                        <SecurityDescription>
                          {adminData.mustChangePassword
                            ? "Password change required on next login"
                            : "Change your account password"}
                          {adminData.tempPassword && (
                            <SecurityWarning>
                              ⚠️ Using temporary password
                            </SecurityWarning>
                          )}
                        </SecurityDescription>
                      </SecurityContent>
                      <SecurityAction>
                        <ActionButton
                          variant={
                            adminData.mustChangePassword
                              ? "primary"
                              : "secondary"
                          }
                          size="small"
                          onClick={handleChangePassword}
                        >
                          {adminData.mustChangePassword
                            ? "Change Required"
                            : "Change Password"}
                        </ActionButton>
                      </SecurityAction>
                    </SecurityItem>

                    <SecurityItem>
                      <SecurityIcon>📱</SecurityIcon>
                      <SecurityContent>
                        <SecurityLabel>Two-Factor Authentication</SecurityLabel>
                        <SecurityDescription>
                          {adminData.twoFactorEnabled
                            ? "2FA is enabled for your account"
                            : "Add an extra layer of security to your account"}
                        </SecurityDescription>
                      </SecurityContent>
                      <SecurityAction>
                        <ActionButton
                          variant={
                            adminData.twoFactorEnabled ? "danger" : "primary"
                          }
                          size="small"
                          onClick={handleToggle2FA}
                        >
                          {adminData.twoFactorEnabled
                            ? "Disable 2FA"
                            : "Enable 2FA"}
                        </ActionButton>
                      </SecurityAction>
                    </SecurityItem>

                    {/* <SecurityItem>
                    <SecurityIcon>🔔</SecurityIcon>
                    <SecurityContent>
                      <SecurityLabel>Login Notifications</SecurityLabel>
                      <SecurityDescription>Get notified of new sign-ins to your account</SecurityDescription>
                    </SecurityContent>
                    <SecurityAction>
                      <ToggleSwitch>
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </ToggleSwitch>
                    </SecurityAction>
                  </SecurityItem> */}

                    <SecurityItem>
                      <SecurityIcon>🛡️</SecurityIcon>
                      <SecurityContent>
                        <SecurityLabel>Account Security</SecurityLabel>
                        <SecurityDescription>
                          Account ID: {adminData.id}
                          <br />
                          Admin since:{" "}
                          {new Date(adminData.createdAt).getFullYear()}
                        </SecurityDescription>
                      </SecurityContent>
                      <SecurityAction>
                        <SecurityBadge active={adminData.isActive}>
                          {adminData.isActive ? "Secure" : "Inactive"}
                        </SecurityBadge>
                      </SecurityAction>
                    </SecurityItem>
                  </SecurityGrid>
                </SecurityTab>
              )}

              {activeTab === "activity" && (
                <ActivityTab>
                  <SectionTitle>Recent Activity</SectionTitle>

                  <ActivityList>
                    <ActivityItem>
                      <ActivityIcon>🔑</ActivityIcon>
                      <ActivityContent>
                        <ActivityTitle>Last Login</ActivityTitle>
                        <ActivityTime>
                          {adminData.lastLogin
                            ? formatTimestamp(adminData.lastLogin)
                            : "No login records"}
                        </ActivityTime>
                      </ActivityContent>
                    </ActivityItem>

                    <ActivityItem>
                      <ActivityIcon>👤</ActivityIcon>
                      <ActivityContent>
                        <ActivityTitle>Profile Updated</ActivityTitle>
                        <ActivityTime>
                          {formatTimestamp(adminData.updatedAt)}
                        </ActivityTime>
                      </ActivityContent>
                    </ActivityItem>

                    <ActivityItem>
                      <ActivityIcon>🛡️</ActivityIcon>
                      <ActivityContent>
                        <ActivityTitle>Account Created</ActivityTitle>
                        <ActivityTime>
                          {formatTimestamp(adminData.createdAt)}
                        </ActivityTime>
                      </ActivityContent>
                    </ActivityItem>

                    {adminData.twoFactorEnabled && (
                      <ActivityItem>
                        <ActivityIcon>📱</ActivityIcon>
                        <ActivityContent>
                          <ActivityTitle>
                            Two-Factor Authentication Enabled
                          </ActivityTitle>
                          <ActivityTime>Security enhanced</ActivityTime>
                        </ActivityContent>
                      </ActivityItem>
                    )}

                    {adminData.mustChangePassword && (
                      <ActivityItem>
                        <ActivityIcon>⚠️</ActivityIcon>
                        <ActivityContent>
                          <ActivityTitle>
                            Password Change Required
                          </ActivityTitle>
                          <ActivityTime>Action needed</ActivityTime>
                        </ActivityContent>
                      </ActivityItem>
                    )}
                  </ActivityList>
                </ActivityTab>
              )}
            </TabContent>
          </DetailsSection>
        </ContentContainer>
      </PageContainer>
      {show2FAModal && (
        <TwoFAModal
          data={twoFAData}
          onClose={() => setShow2FAModal(false)}
          onSubmit={handleVerify2FA}
          otp={otp}
          setOtp={setOtp}
        />
      )}
      <DisableTwoFAModal
        isOpen={showDisable2FAModal}
        onClose={() => setShowDisable2FAModal(false)}
        onSubmit={handleDisable2FA}
        isLoading={disableTwoFAMutation.isLoading}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSubmit={handlePasswordChange}
        isLoading={changePasswordMutation.isLoading}
        mustChangePassword={adminData?.mustChangePassword || false}
      />
    </>
  );
};

// Helper function to get permission descriptions
const getPermissionDescription = (permission: string) => {
  const descriptions: { [key: string]: string } = {
    "admin:read": "View administrative data and reports",
    "admin:write": "Modify administrative settings",
    "admin:delete": "Delete administrative records",
    "users:manage": "Manage user accounts and permissions",
    "doctors:manage": "Manage doctor profiles and verification",
    "patients:manage": "Manage patient records and appointments",
    "appointments:manage": "Manage appointment scheduling",
    "reports:view": "Access system reports and analytics",
    "settings:manage": "Modify system settings and configurations",
    "billing:manage": "Manage billing and payment settings",
  };

  return descriptions[permission] || "Administrative permission";
};

// Styled Components (keeping all existing styles and adding new ones)
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
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  margin-top: 12px;
  color: ${theme.colors.textSecondary};
  font-size: 14px;
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
  color: ${theme.colors.danger};
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin: 0 0 16px 0;
  max-width: 400px;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
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
  margin: 0 0 4px 0;
  color: white;
`;

const UserRole = styled.div`
  font-size: 14px;
  margin-bottom: 2px;
  opacity: 0.9;
`;

const UserEmail = styled.div`
  font-size: 13px;
  margin-bottom: 12px;
  opacity: 0.8;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);

  ${(props) => {
    const status = props.status.toLowerCase();
    if (status === "active") {
      return `
        color: ${theme.colors.success};
        background: white;
        border-color: ${theme.colors.success}30;
      `;
    } else if (status === "pending") {
      return `
        color: ${theme.colors.warning};
        background: white;
        border-color: ${theme.colors.warning}30;
      `;
    } else {
      return `
        color: ${theme.colors.textSecondary};
        background: white;
        border-color: ${theme.colors.textSecondary}30;
      `;
    }
  }}
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

const ProfileTab = styled.div``;
const PermissionsTab = styled.div``;
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
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIndicatorInline = styled.div<{ active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) =>
    props.active ? theme.colors.success : theme.colors.textSecondary};
`;

const PermissionsDescription = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const PermissionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PermissionCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    border-color: ${theme.colors.primary}30;
  }
`;

const PermissionIcon = styled.div`
  font-size: 18px;
  width: 40px;
  height: 40px;
  background: ${theme.colors.primary}15;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PermissionContent = styled.div`
  flex: 1;
`;

const PermissionName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: 2px;
`;

const PermissionDescription = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const PermissionStatus = styled.div``;

const ActiveBadge = styled.span`
  padding: 4px 8px;
  background: ${theme.colors.success}15;
  color: ${theme.colors.success};
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
`;

const EmptyPermissions = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const EmptyTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin: 0;
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

const SecurityWarning = styled.div`
  color: ${theme.colors.warning};
  font-weight: 500;
  margin-top: 4px;
`;

const SecurityAction = styled.div``;

const SecurityBadge = styled.span<{ active: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  background: ${(props) =>
    props.active ? theme.colors.success : theme.colors.textSecondary}15;
  color: ${(props) =>
    props.active ? theme.colors.success : theme.colors.textSecondary};
`;

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

export default AdminProfile;
