// @ts-nocheck
import { UserStatusPayload } from '@/api/admin/adminTypes';
import { useCreateUserAdmin, useGetUserAdmin, useUpdateUserStatus, useDeleteUser } from '@/hooks/useAdmin';
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus, 
  Settings,
  X,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  sendCredentials: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

interface ApiResponse {
  data: {
    users: User[];
  };
}

interface Theme {
  colors: {
    primary: string;
    primaryDark: string;
    success: string;
    danger: string;
    warning: string;
    gray50: string;
    gray100: string;
    gray200: string;
    gray300: string;
    gray400: string;
    gray500: string;
    gray600: string;
    gray700: string;
    gray800: string;
    gray900: string;
    white: string;
  };
}

const theme: Theme = {
  colors: {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    white: '#ffffff'
  }
};

const UserManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // React Query hooks
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useGetUserAdmin();

  const users: User[] = (data as ApiResponse)?.data?.users || [];
  
  const createUserMutation = useCreateUserAdmin({
    onSuccess: () => {
      refetch();
      setShowCreateModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        sendCredentials: true
      });
    },
    onError: (error: Error) => {
      console.error('Failed to create user:', error);
    }
  });

  const updateUserStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();

  const roles: string[] = ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Manager', 'SuperAdmin'];

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    sendCredentials: true
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Calculate stats from actual data
  const stats: Stats = useMemo(() => {
    if (!users.length) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        newThisMonth: 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return {
      total: users.length,
      active: users.filter(user => user.status === 'active').length,
      inactive: users.filter(user => user.status === 'inactive').length,
      newThisMonth: users.filter(user => {
        const createdDate = new Date(user.createdAt);
        return createdDate.getMonth() === currentMonth && 
               createdDate.getFullYear() === currentYear;
      }).length
    };
  }, [users]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.role) newErrors.role = 'Role is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await createUserMutation.mutateAsync(formData);
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (selectedUser) {
      try {
        await deleteUserMutation.mutateAsync(selectedUser.id);
        setShowDeleteModal(false);
        setSelectedUser(null);
        refetch();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };
// Modified handleStatusChange function
const handleStatusChange = async (user: User, newStatus: 'active' | 'inactive' | 'suspended') => {
  try {
    // Create payload according to UserStatusPayload interface
    const userStatusPayload: UserStatusPayload = {
      status: newStatus,
      isActive: newStatus === 'active'
    };

    await updateUserStatusMutation.mutateAsync({
      id: user.id,
      userStatusData: userStatusPayload // Changed from { status: newStatus }
    });
    refetch();
  } catch (error) {
    console.error('Failed to update user status:', error);
  }
};

// Modified handleBulkStatusUpdate function
const handleBulkStatusUpdate = async (status: 'active' | 'inactive' | 'suspended') => {
  const selectedUserIds = Array.from(selectedUsers);
  try {
    // Create payload according to UserStatusPayload interface
    const userStatusPayload: UserStatusPayload = {
      status: status,
      isActive: status === 'active'
    };

    await Promise.all(
      selectedUserIds.map(id => 
        updateUserStatusMutation.mutateAsync({
          id,
          userStatusData: userStatusPayload // Changed from { status }
        })
      )
    );
    setSelectedUsers(new Set());
    refetch();
  } catch (error) {
    console.error('Failed to update users status:', error);
  }
};

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  const getStatusColor = (status: string): string => {
    return status === 'active' ? theme.colors.success : theme.colors.gray400;
  };

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      'Admin': '#ef4444',
      'Doctor': '#6366f1',
      'Nurse': '#10b981',
      'Receptionist': '#f59e0b',
      'Manager': '#8b5cf6',
      'SuperAdmin': '#dc2626'
    };
    return colors[role] || theme.colors.gray500;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isSuperAdmin = (user: User): boolean => {
    return user.role === 'Super_admin';
  };

  // Loading state
  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading users...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  // Error state
  if (isError) {
    return (
      <Container>
        <ErrorContainer>
          <AlertTriangle size={48} color={theme.colors.danger} />
          <ErrorTitle>Failed to load users</ErrorTitle>
          <ErrorMessage>
            {(error as Error)?.message || 'An unexpected error occurred while loading users.'}
          </ErrorMessage>
          <RetryButton onClick={() => refetch()}>
            Try Again
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
      {/* Header */}
      <Header>
        <HeaderContent>
          <Title>User Management</Title>
          <Subtitle>Manage users, roles, and permissions for your organization</Subtitle>
        </HeaderContent>
        <HeaderActions>
          <CreateButton onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Create User
          </CreateButton>
        </HeaderActions>
      </Header>

      {/* Stats Cards */}
      <StatsGrid>
        <StatCard>
          <StatIcon style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Users size={20} />
          </StatIcon>
          <StatContent>
            <StatNumber>{stats.total}</StatNumber>
            <StatLabel>Total Users</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <UserCheck size={20} />
          </StatIcon>
          <StatContent>
            <StatNumber>{stats.active}</StatNumber>
            <StatLabel>Active Users</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon style={{ background: '#fef3c7', color: '#d97706' }}>
            <UserX size={20} />
          </StatIcon>
          <StatContent>
            <StatNumber>{stats.inactive}</StatNumber>
            <StatLabel>Inactive Users</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon style={{ background: '#fce7f3', color: '#be185d' }}>
            <UserPlus size={20} />
          </StatIcon>
          <StatContent>
            <StatNumber>{stats.newThisMonth}</StatNumber>
            <StatLabel>New This Month</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Main Content */}
      <ContentContainer>
        {/* Filters and Search */}
        <FiltersSection>
          <SearchContainer>
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          <FiltersRight>
            <RoleFilter>
              <select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </RoleFilter>
            <FilterButton>
              <Settings size={16} />
              Filters
            </FilterButton>
            {selectedUsers.size > 0 && (
              <BulkActions>
                <span>{selectedUsers.size} selected</span>
                <BulkButton 
                  onClick={() => handleBulkStatusUpdate('active')}
                  disabled={updateUserStatusMutation.isPending}
                >
                  Activate
                </BulkButton>
                <BulkButton 
                  variant="danger" 
                  onClick={() => handleBulkStatusUpdate('inactive')}
                  disabled={updateUserStatusMutation.isPending}
                >
                  Deactivate
                </BulkButton>
              </BulkActions>
            )}
          </FiltersRight>
        </FiltersSection>

        {/* Users Table */}
        <TableContainer>
          {filteredUsers.length === 0 ? (
            <EmptyState>
              <Users size={64} color={theme.colors.gray400} />
              <EmptyTitle>No users found</EmptyTitle>
              <EmptyMessage>
                {searchTerm || selectedRole !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by creating your first user.'
                }
              </EmptyMessage>
              {(!searchTerm && selectedRole === 'all') && (
                <CreateButton onClick={() => setShowCreateModal(true)}>
                  <Plus size={16} />
                  Create First User
                </CreateButton>
              )}
            </EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <th>
                    <Checkbox 
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                        } else {
                          setSelectedUsers(new Set());
                        }
                      }}
                    />
                  </th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </TableHeader>
              <tbody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <td>
                      <Checkbox 
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td>
                      <UserInfo>
                        <UserAvatar>
                          {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                        </UserAvatar>
                        <UserDetails>
                          <UserName>{user.firstName} {user.lastName}</UserName>
                          <UserEmail>{user.email}</UserEmail>
                          <UserPhone>{user.phone}</UserPhone>
                        </UserDetails>
                      </UserInfo>
                    </td>
                    <td>
                      <RoleBadge color={getRoleColor(user.role)}>
                        {user.role}
                      </RoleBadge>
                    </td>
                    <td>
                      {!isSuperAdmin(user) ? (
                        <StatusDropdown>
                          <StatusSelect
                            value={user.status}
                            onChange={(e) => handleStatusChange(user, e.target.value as 'active' | 'inactive' | 'suspended')}
                            disabled={updateUserStatusMutation.isPending}
                            statusColor={getStatusColor(user.status)}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                          </StatusSelect>
                          <ChevronDown size={12} />
                        </StatusDropdown>
                      ) : (
                        <StatusBadge color={getStatusColor(user.status)}>
                          <StatusDot color={getStatusColor(user.status)} />
                          {user.status}
                        </StatusBadge>
                      )}
                    </td>
                    <td>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <ActionsContainer>
                        <ActionButton 
                          title="View Details" 
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye size={16} />
                        </ActionButton>
                        {!isSuperAdmin(user) && (
                          <ActionButton 
                            title="Delete User" 
                            onClick={() => handleDeleteUser(user)}
                            variant="danger"
                          >
                            <Trash2 size={16} />
                          </ActionButton>
                        )}
                      </ActionsContainer>
                    </td>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </TableContainer>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <Pagination>
            <PaginationInfo>
              Showing 1-{filteredUsers.length} of {users.length} users
            </PaginationInfo>
            <PaginationControls>
              <PaginationButton disabled>← Previous</PaginationButton>
              <PaginationNumber active>1</PaginationNumber>
              <PaginationNumber>2</PaginationNumber>
              <PaginationNumber>3</PaginationNumber>
              <PaginationButton>Next →</PaginationButton>
            </PaginationControls>
          </Pagination>
        )}
      </ContentContainer>

      {/* Create User Modal */}
      {showCreateModal && (
        <ModalOverlay onClick={() => setShowCreateModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>Create New User</ModalTitle>
                <ModalSubtitle>Add a new user to your organization</ModalSubtitle>
              </div>
              <CloseButton onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            
            <ModalContent>
              <Form onSubmit={handleSubmit}>
                <FormGrid>
                  <FormGroup>
                    <Label>First Name *</Label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      hasError={!!errors.firstName}
                      placeholder="Enter first name"
                      disabled={createUserMutation.isPending}
                    />
                    {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Last Name *</Label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      hasError={!!errors.lastName}
                      placeholder="Enter last name"
                      disabled={createUserMutation.isPending}
                    />
                    {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
                  </FormGroup>

                  <FormGroup className="full-width">
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      hasError={!!errors.email}
                      placeholder="user@hospital.com"
                      disabled={createUserMutation.isPending}
                    />
                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Phone Number *</Label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      hasError={!!errors.phone}
                      placeholder="+91 9876543210"
                      disabled={createUserMutation.isPending}
                    />
                    {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Role *</Label>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      hasError={!!errors.role}
                      disabled={createUserMutation.isPending}
                    >
                      <option value="">Select a role</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </Select>
                    {errors.role && <ErrorText>{errors.role}</ErrorText>}
                  </FormGroup>

                  <FormGroup className="full-width">
                    <CheckboxContainer>
                      <Checkbox
                        type="checkbox"
                        name="sendCredentials"
                        checked={formData.sendCredentials}
                        onChange={handleInputChange}
                        disabled={createUserMutation.isPending}
                      />
                      <CheckboxLabel>
                        Send login credentials via email
                        <CheckboxHelper>
                          User will receive an email with their login details and a link to set their password
                        </CheckboxHelper>
                      </CheckboxLabel>
                    </CheckboxContainer>
                  </FormGroup>
                </FormGrid>

                <ModalActions>
                  <SecondaryButton 
                    type="button" 
                    onClick={() => setShowCreateModal(false)}
                    disabled={createUserMutation.isPending}
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton 
                    type="submit"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                  </PrimaryButton>
                </ModalActions>
              </Form>
            </ModalContent>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <ModalOverlay onClick={() => setShowDetailsModal(false)}>
          <UserDetailsModalContainer onClick={(e) => e.stopPropagation()}>
            <UserDetailsHeader>
              <UserDetailsHeaderLeft>
                <UserDetailsAvatar>
                  {selectedUser.firstName?.[0] || ''}{selectedUser.lastName?.[0] || ''}
                </UserDetailsAvatar>
                <UserDetailsInfo>
                  <UserDetailsName>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </UserDetailsName>
                  <UserDetailsRole color={getRoleColor(selectedUser.role)}>
                    {selectedUser.role}
                  </UserDetailsRole>
                  <UserDetailsStatus>
                    <StatusDot color={getStatusColor(selectedUser.status)} />
                    {selectedUser.status}
                  </UserDetailsStatus>
                </UserDetailsInfo>
              </UserDetailsHeaderLeft>
              <UserDetailsActions>
                <CloseButton onClick={() => setShowDetailsModal(false)}>
                  <X size={20} />
                </CloseButton>
              </UserDetailsActions>
            </UserDetailsHeader>

            <UserDetailsContent>
              <UserDetailsSection>
                <SectionTitle>Personal Information</SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>First Name</InfoLabel>
                    <InfoValue>{selectedUser.firstName}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Last Name</InfoLabel>
                    <InfoValue>{selectedUser.lastName}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Email Address</InfoLabel>
                    <InfoValue>{selectedUser.email}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Phone Number</InfoLabel>
                    <InfoValue>{selectedUser.phone}</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </UserDetailsSection>

              <UserDetailsSection>
                <SectionTitle>Account Information</SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>User ID</InfoLabel>
                    <InfoValue>#{selectedUser.id}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Role</InfoLabel>
                    <InfoValue>
                      <RoleBadge color={getRoleColor(selectedUser.role)}>
                        {selectedUser.role}
                      </RoleBadge>
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Status</InfoLabel>
                    <InfoValue>
                      <StatusBadge color={getStatusColor(selectedUser.status)}>
                        <StatusDot color={getStatusColor(selectedUser.status)} />
                        {selectedUser.status}
                      </StatusBadge>
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Account Created</InfoLabel>
                    <InfoValue>{formatDate(selectedUser.createdAt)}</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </UserDetailsSection>

              <UserDetailsSection>
                <SectionTitle>Activity Information</SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Last Login</InfoLabel>
                    <InfoValue>
                      {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never logged in'}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Login Frequency</InfoLabel>
                    <InfoValue>Daily</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Total Sessions</InfoLabel>
                    <InfoValue>147</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Average Session Duration</InfoLabel>
                    <InfoValue>2h 34m</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </UserDetailsSection>
            </UserDetailsContent>
          </UserDetailsModalContainer>
        </ModalOverlay>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <ModalOverlay onClick={() => setShowDeleteModal(false)}>
          <ConfirmationModalContainer onClick={(e) => e.stopPropagation()}>
            <ConfirmationHeader>
              <ConfirmationIcon variant="danger">
                <AlertTriangle size={32} />
              </ConfirmationIcon>
              <ConfirmationTitle>Delete User</ConfirmationTitle>
              <ConfirmationMessage>
                Are you sure you want to delete <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>? 
                This action cannot be undone and will permanently remove all user data.
              </ConfirmationMessage>
            </ConfirmationHeader>
            
            <ConfirmationActions>
              <SecondaryButton 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteUserMutation.isPending}
              >
                Cancel
              </SecondaryButton>
              <DangerButton 
                onClick={confirmDeleteUser}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
              </DangerButton>
            </ConfirmationActions>
          </ConfirmationModalContainer>
        </ModalOverlay>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.gray50};
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
  border: 3px solid ${theme.colors.gray200};
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: ${theme.colors.gray600};
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${theme.colors.gray900};
  margin: 0;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: ${theme.colors.gray600};
  margin: 0;
  max-width: 400px;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.gray900};
  margin: 16px 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 16px;
  color: ${theme.colors.gray600};
  margin: 0 0 24px 0;
  max-width: 400px;
`;

const Header = styled.div`
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
  font-size: 32px;
  font-weight: 700;
  color: ${theme.colors.gray900};
  margin: 0 0 4px 0;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${theme.colors.gray600};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${theme.colors.gray200};
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div``;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.gray900};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${theme.colors.gray600};
  font-weight: 500;
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${theme.colors.gray200};
  overflow: hidden;
`;

const FiltersSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${theme.colors.gray200};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  
  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.gray400};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid ${theme.colors.gray300};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${theme.colors.gray400};
  }
`;

const FiltersRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const RoleFilter = styled.div`
  select {
    padding: 8px 12px;
    border: 1px solid ${theme.colors.gray300};
    border-radius: 6px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
    }
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid ${theme.colors.gray300};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.gray50};
  }
`;

const BulkActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${theme.colors.gray50};
  border-radius: 6px;
  font-size: 14px;
  color: ${theme.colors.gray600};
`;

const BulkButton = styled.button<{ variant?: string }>`
  padding: 4px 8px;
  background: ${props => props.variant === 'danger' ? theme.colors.danger : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: ${theme.colors.gray50};
  
  th {
    padding: 16px 24px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: ${theme.colors.gray600};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid ${theme.colors.gray200};
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.gray200};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.gray50};
  }
  
  td {
    padding: 16px 24px;
    vertical-align: middle;
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${theme.colors.primary};
  cursor: pointer;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
`;

const UserDetails = styled.div``;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.gray900};
  margin-bottom: 2px;
`;

const UserEmail = styled.div`
  font-size: 13px;
  color: ${theme.colors.gray600};
  margin-bottom: 1px;
`;

const UserPhone = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray500};
`;

const RoleBadge = styled.span<{ color: string }>`
  padding: 4px 8px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const StatusBadge = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.color};
`;

const StatusDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const StatusDropdown = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const StatusSelect = styled.select<{ statusColor: string }>`
  appearance: none;
  padding: 6px 24px 6px 8px;
  border: 1px solid ${theme.colors.gray300};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.statusColor};
  background: white;
  cursor: pointer;
  min-width: 80px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button<{ variant?: string }>`
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.variant === 'danger' ? '#fef2f2' : theme.colors.gray100};
    color: ${props => props.variant === 'danger' ? theme.colors.danger : 'inherit'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid ${theme.colors.gray200};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: ${theme.colors.gray600};
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${theme.colors.gray300};
  background: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${theme.colors.gray50};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationNumber = styled.button<{ active?: boolean }>`
  width: 36px;
  height: 36px;
  border: 1px solid ${props => props.active ? theme.colors.primary : theme.colors.gray300};
  background: ${props => props.active ? theme.colors.primary : 'white'};
  color: ${props => props.active ? 'white' : theme.colors.gray700};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? theme.colors.primaryDark : theme.colors.gray50};
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  animation: modalEnter 0.3s ease-out;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  @keyframes modalEnter {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid ${theme.colors.gray200};
  background: linear-gradient(135deg, ${theme.colors.primary}08, ${theme.colors.primary}03);
`;

const ModalTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${theme.colors.gray900};
  margin: 0 0 4px 0;
`;

const ModalSubtitle = styled.p`
  font-size: 14px;
  color: ${theme.colors.gray600};
  margin: 0;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.gray500};
  
  &:hover {
    background: ${theme.colors.gray100};
    color: ${theme.colors.gray700};
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
`;

const Form = styled.form``;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  
  .full-width {
    grid-column: 1 / -1;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.gray700};
  margin-bottom: 6px;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 12px 16px;
  border: 1px solid ${props => props.hasError ? theme.colors.danger : theme.colors.gray300};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: ${props => props.hasError ? '#fef2f2' : 'white'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.hasError ? '#fca5a520' : `${theme.colors.primary}20`};
  }
  
  &::placeholder {
    color: ${theme.colors.gray400};
  }
  
  &:disabled {
    background: ${theme.colors.gray100};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  padding: 12px 16px;
  border: 1px solid ${props => props.hasError ? theme.colors.danger : theme.colors.gray300};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.hasError ? '#fef2f2' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.hasError ? '#fca5a520' : `${theme.colors.primary}20`};
  }
  
  &:disabled {
    background: ${theme.colors.gray100};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: ${theme.colors.gray50};
  border-radius: 8px;
  border: 1px solid ${theme.colors.gray200};
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.gray700};
  cursor: pointer;
  line-height: 1.4;
`;

const CheckboxHelper = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray500};
  margin-top: 4px;
  font-weight: normal;
`;

const ErrorText = styled.span`
  color: ${theme.colors.danger};
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: "⚠";
    font-size: 10px;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid ${theme.colors.gray200};
  
  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const SecondaryButton = styled.button`
  padding: 12px 20px;
  background: white;
  color: ${theme.colors.gray700};
  border: 1px solid ${theme.colors.gray300};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${theme.colors.gray50};
    border-color: ${theme.colors.gray400};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PrimaryButton = styled.button`
  padding: 12px 20px;
  background: ${theme.colors.primary};
  color: white;
  border: 1px solid ${theme.colors.primary};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${theme.colors.primaryDark};
    border-color: ${theme.colors.primaryDark};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

// User Details Modal Styles
const UserDetailsModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  animation: modalEnter 0.3s ease-out;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const UserDetailsHeader = styled.div`
  padding: 32px;
  background: linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.primary}05);
  border-bottom: 1px solid ${theme.colors.gray200};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const UserDetailsHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const UserDetailsAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark});
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  box-shadow: 0 8px 25px -8px ${theme.colors.primary}50;
`;

const UserDetailsInfo = styled.div``;

const UserDetailsName = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.gray900};
  margin: 0 0 8px 0;
`;

const UserDetailsRole = styled.div<{ color: string }>`
  display: inline-block;
  padding: 6px 12px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const UserDetailsStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.gray600};
`;

const UserDetailsActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
`;

const UserDetailsContent = styled.div`
  padding: 32px;
  max-height: 60vh;
  overflow-y: auto;
`;

const UserDetailsSection = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.gray900};
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid ${theme.colors.gray100};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InfoLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.gray500};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.gray900};
  padding: 8px 0;
`;

// Confirmation Modal Styles
const ConfirmationModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  position: relative;
  animation: modalEnter 0.3s ease-out;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const ConfirmationHeader = styled.div`
  padding: 32px;
  text-align: center;
`;

const ConfirmationIcon = styled.div<{ variant?: string }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  
  ${props => {
    switch (props.variant) {
      case 'danger':
        return `
          background: #fef2f2;
          color: ${theme.colors.danger};
        `;
      default:
        return `
          background: ${theme.colors.gray100};
          color: ${theme.colors.gray600};
        `;
    }
  }}
`;

const ConfirmationTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.gray900};
  margin: 0 0 12px 0;
`;

const ConfirmationMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.gray600};
  line-height: 1.5;
  margin: 0;
`;

const ConfirmationActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 24px 32px 32px;
  justify-content: center;
`;

const DangerButton = styled.button`
  padding: 12px 20px;
  background: ${theme.colors.danger};
  color: white;
  border: 1px solid ${theme.colors.danger};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #dc2626;
    border-color: #dc2626;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export default UserManagement;