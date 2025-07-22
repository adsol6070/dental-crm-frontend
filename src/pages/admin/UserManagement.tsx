import { useCreateUserAdmin } from '@/hooks/useAdmin';
import React, { useState } from 'react';
import styled from 'styled-components';

const theme = {
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

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const createUserMutation = useCreateUserAdmin();
  // Mock data
  const users = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@hospital.com',
      phone: '+91 9876543210',
      role: 'Doctor',
      status: 'Active',
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T09:00:00Z'
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 's.wilson@hospital.com',
      phone: '+91 9876543211',
      role: 'Nurse',
      status: 'Active',
      lastLogin: '2024-01-14T16:45:00Z',
      createdAt: '2024-01-03T11:15:00Z'
    },
    {
      id: 3,
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'm.johnson@hospital.com',
      phone: '+91 9876543212',
      role: 'Admin',
      status: 'Inactive',
      lastLogin: '2024-01-10T14:20:00Z',
      createdAt: '2024-01-02T08:30:00Z'
    },
    {
      id: 4,
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'e.davis@hospital.com',
      phone: '+91 9876543213',
      role: 'Receptionist',
      status: 'Active',
      lastLogin: '2024-01-15T09:15:00Z',
      createdAt: '2024-01-04T10:45:00Z'
    }
  ];

  const roles = ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Manager'];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    sendCredentials: true
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Creating user:', formData);
      const response = createUserMutation.mutateAsync(formData);
      // Handle user creation
      setShowCreateModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        sendCredentials: true
      });
    }
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getStatusColor = (status) => {
    return status === 'Active' ? theme.colors.success : theme.colors.gray400;
  };

  const getRoleColor = (role) => {
    const colors = {
      'Admin': '#ef4444',
      'Doctor': '#6366f1',
      'Nurse': '#10b981',
      'Receptionist': '#f59e0b',
      'Manager': '#8b5cf6'
    };
    return colors[role] || theme.colors.gray500;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderContent>
          <Title>User Management</Title>
          <Subtitle>Manage users, roles, and permissions for your organization</Subtitle>
        </HeaderContent>
        <HeaderActions>
          <CreateButton onClick={() => setShowCreateModal(true)}>
            <PlusIcon>+</PlusIcon>
            Create User
          </CreateButton>
        </HeaderActions>
      </Header>

      {/* Stats Cards */}
      <StatsGrid>
        <StatCard>
          <StatIcon style={{ background: '#eff6ff', color: '#2563eb' }}>👥</StatIcon>
          <StatContent>
            <StatNumber>248</StatNumber>
            <StatLabel>Total Users</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon style={{ background: '#f0fdf4', color: '#16a34a' }}>✅</StatIcon>
          <StatContent>
            <StatNumber>234</StatNumber>
            <StatLabel>Active Users</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon style={{ background: '#fef3c7', color: '#d97706' }}>⏸️</StatIcon>
          <StatContent>
            <StatNumber>14</StatNumber>
            <StatLabel>Inactive Users</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon style={{ background: '#fce7f3', color: '#be185d' }}>🆕</StatIcon>
          <StatContent>
            <StatNumber>12</StatNumber>
            <StatLabel>New This Month</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Main Content */}
      <ContentContainer>
        {/* Filters and Search */}
        <FiltersSection>
          <SearchContainer>
            <SearchIcon>🔍</SearchIcon>
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
            <FilterButton>⚙️ Filters</FilterButton>
            {selectedUsers.size > 0 && (
              <BulkActions>
                <span>{selectedUsers.size} selected</span>
                <BulkButton>Activate</BulkButton>
                <BulkButton variant="danger">Deactivate</BulkButton>
              </BulkActions>
            )}
          </FiltersRight>
        </FiltersSection>

        {/* Users Table */}
        <TableContainer>
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
                        {user.firstName[0]}{user.lastName[0]}
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
                    <StatusBadge color={getStatusColor(user.status)}>
                      <StatusDot color={getStatusColor(user.status)} />
                      {user.status}
                    </StatusBadge>
                  </td>
                  <td>{formatDate(user.lastLogin)}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <ActionsContainer>
                      <ActionButton title="Edit">✏️</ActionButton>
                      <ActionButton title="View Details">👁️</ActionButton>
                      <ActionButton title="More Options">⋯</ActionButton>
                    </ActionsContainer>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>

        {/* Pagination */}
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
      </ContentContainer>

      {/* Create User Modal */}
      {showCreateModal && (
        <ModalOverlay onClick={() => setShowCreateModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Create New User</ModalTitle>
              <ModalSubtitle>Add a new user to your organization</ModalSubtitle>
              <CloseButton onClick={() => setShowCreateModal(false)}>×</CloseButton>
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
                  <SecondaryButton type="button" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton type="submit">
                    Create User
                  </PrimaryButton>
                </ModalActions>
              </Form>
            </ModalContent>
          </ModalContainer>
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

const PlusIcon = styled.span`
  font-size: 16px;
  font-weight: 700;
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
  font-size: 20px;
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
  font-size: 14px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 36px;
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

const BulkButton = styled.button`
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

const RoleBadge = styled.span`
  padding: 4px 8px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.color};
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
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
  font-size: 14px;
  
  &:hover {
    background: ${theme.colors.gray100};
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

const PaginationNumber = styled.button`
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
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  animation: modalEnter 0.2s ease-out;
  
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
  padding: 24px;
  border-bottom: 1px solid ${theme.colors.gray200};
  position: relative;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.gray900};
  margin: 0 0 4px 0;
`;

const ModalSubtitle = styled.p`
  font-size: 14px;
  color: ${theme.colors.gray600};
  margin: 0;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.gray100};
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

const Input = styled.input`
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
`;

const Select = styled.select`
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
  
  &:hover {
    background: ${theme.colors.gray50};
    border-color: ${theme.colors.gray400};
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
  
  &:hover {
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

export default UserManagement;