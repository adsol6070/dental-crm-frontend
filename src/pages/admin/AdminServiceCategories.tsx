import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash, FiPlus, FiTag, FiFileText, FiSave, FiX, FiSearch } from "react-icons/fi";
import { MdCategory } from "react-icons/md";
import { ROUTES } from '@/config/route-paths.config';
import { theme } from '@/config/theme.config';
import Swal from "sweetalert2";

// Mock data - replace with actual API hooks
const mockCategories = [
  {
    _id: "1",
    name: "General Dentistry",
    description: "Basic dental care services including cleanings, fillings, and routine check-ups",
    serviceCount: 12,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-02-01T14:30:00Z",
    color: "#3b82f6"
  },
  {
    _id: "2",
    name: "Specialized Dental Services",
    description: "Advanced dental procedures requiring specialized equipment and expertise",
    serviceCount: 8,
    isActive: true,
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-25T11:20:00Z",
    color: "#f59e0b"
  },
  {
    _id: "3",
    name: "Cosmetic Dentistry",
    description: "Aesthetic dental treatments to improve the appearance of teeth and smile",
    serviceCount: 6,
    isActive: true,
    createdAt: "2024-01-05T13:45:00Z",
    updatedAt: "2024-01-30T16:10:00Z",
    color: "#8b5cf6"
  },
  {
    _id: "4",
    name: "Oral Surgery",
    description: "Surgical procedures for complex dental and oral health issues",
    serviceCount: 4,
    isActive: true,
    createdAt: "2023-12-20T11:30:00Z",
    updatedAt: "2024-01-20T09:45:00Z",
    color: "#ef4444"
  },
  {
    _id: "5",
    name: "Emergency Services",
    description: "Urgent dental care for dental emergencies and trauma",
    serviceCount: 3,
    isActive: false,
    createdAt: "2023-11-15T14:20:00Z",
    updatedAt: "2024-01-28T12:30:00Z",
    color: "#f97316"
  },
  {
    _id: "6",
    name: "Orthodontics",
    description: "Teeth alignment and bite correction treatments",
    serviceCount: 5,
    isActive: true,
    createdAt: "2023-10-10T16:45:00Z",
    updatedAt: "2024-01-15T10:20:00Z",
    color: "#10b981"
  }
];

const predefinedColors = [
  "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#f97316", "#10b981",
  "#06b6d4", "#ec4899", "#6366f1", "#84cc16", "#f43f5e", "#14b8a6"
];

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  isActive: boolean;
}

const AdminServiceCategories = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: predefinedColors[0],
    isActive: true
  });
  
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
  const itemsPerPage = 8;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Category description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: predefinedColors[0],
      isActive: true
    });
    setErrors({});
    setEditingCategory(null);
  };

  const handleCreateCategory = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditCategory = (category: any) => {
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      isActive: category.isActive
    });
    setEditingCategory(category._id);
    setShowCreateModal(true);
  };

  const handleDeleteCategory = async (id: string, categoryName: string, serviceCount: number) => {
    if (serviceCount > 0) {
      Swal.fire({
        title: 'Cannot Delete Category',
        text: `This category contains ${serviceCount} services. Please move or delete the services first.`,
        icon: 'warning',
        confirmButtonColor: theme.colors.primary
      });
      return;
    }

    const result = await Swal.fire({
      title: `Delete "${categoryName}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        // TODO: Implement delete category API call
        console.log('Deleting category:', id);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        Swal.fire({
          title: 'Success!',
          text: 'Category has been deleted successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete category. Please try again.',
          icon: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Implement create/update category API call
      console.log(editingCategory ? 'Updating category:' : 'Creating category:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Swal.fire({
        title: 'Success!',
        text: `Category has been ${editingCategory ? 'updated' : 'created'} successfully.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: `Failed to ${editingCategory ? 'update' : 'create'} category. Please try again.`,
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (formData.name || formData.description) {
      Swal.fire({
        title: 'Discard Changes?',
        text: 'You have unsaved changes. Are you sure you want to close?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, discard changes'
      }).then((result) => {
        if (result.isConfirmed) {
          setShowCreateModal(false);
          resetForm();
        }
      });
    } else {
      setShowCreateModal(false);
      resetForm();
    }
  };

  const handleBackToServices = () => {
    navigate(ROUTES.ADMIN.SERVICES_LIST);
  };

  // Client-side filtering
  const filteredCategories = mockCategories
    .filter(category => {
      const matchesSearch = 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'active' && category.isActive) ||
        (filterStatus === 'inactive' && !category.isActive);
      
      return matchesSearch && matchesStatus;
    });

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  // Calculate summary statistics
  const summaryStats = {
    total: mockCategories.length,
    active: mockCategories.filter(c => c.isActive).length,
    inactive: mockCategories.filter(c => !c.isActive).length,
    totalServices: mockCategories.reduce((sum, category) => sum + category.serviceCount, 0)
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackLink onClick={handleBackToServices}>
            ← Back to Services
          </BackLink>
          <Title>
            <MdCategory size={28} />
            Service Categories
            <TotalCount>({summaryStats.total} categories)</TotalCount>
          </Title>
          <Subtitle>Organize and manage service categories for better classification</Subtitle>
        </HeaderContent>
        <HeaderActions>
          <ActionButton onClick={handleCreateCategory}>
            <FiPlus size={16} />
            Add New Category
          </ActionButton>
        </HeaderActions>
      </Header>

      <SummaryCards>
        <SummaryCard>
          <SummaryIcon>
            <MdCategory size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{summaryStats.total}</SummaryValue>
            <SummaryLabel>Total Categories</SummaryLabel>
            <SummarySubtext>{summaryStats.active} active, {summaryStats.inactive} inactive</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon>
            <FiTag size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{summaryStats.totalServices}</SummaryValue>
            <SummaryLabel>Total Services</SummaryLabel>
            <SummarySubtext>Across all categories</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon>
            <FiTag size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{Math.round(summaryStats.totalServices / summaryStats.total)}</SummaryValue>
            <SummaryLabel>Avg Services</SummaryLabel>
            <SummarySubtext>Per category</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon>
            <FiTag size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{Math.round((summaryStats.active / summaryStats.total) * 100)}%</SummaryValue>
            <SummaryLabel>Active Rate</SummaryLabel>
            <SummarySubtext>Categories in use</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
      </SummaryCards>

      <Controls>
        <SearchAndFilter>
          <SearchInputContainer>
            <FiSearch size={16} />
            <SearchInput
              type="text"
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInputContainer>
          
          <FilterSelect
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">All Categories</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FilterSelect>
        </SearchAndFilter>
        
        <ResultsInfo>
          Showing {paginatedCategories.length} of {filteredCategories.length} categories
          {filteredCategories.length !== summaryStats.total && (
            <span> (filtered from {summaryStats.total} total)</span>
          )}
        </ResultsInfo>
      </Controls>

      <CategoriesGrid>
        {paginatedCategories.map((category) => (
          <CategoryCard key={category._id}>
            <CategoryHeader>
              <CategoryColorBadge color={category.color} />
              <CategoryMeta>
                <CategoryName>{category.name}</CategoryName>
                <CategoryServiceCount>{category.serviceCount} services</CategoryServiceCount>
              </CategoryMeta>
              <CategoryActions>
                <ActionButton variant="edit" onClick={() => handleEditCategory(category)}>
                  <FiEdit2 size={14} />
                </ActionButton>
                <ActionButton 
                  variant="delete" 
                  onClick={() => handleDeleteCategory(category._id, category.name, category.serviceCount)}
                  disabled={isLoading}
                >
                  <FiTrash size={14} />
                </ActionButton>
              </CategoryActions>
            </CategoryHeader>
            
            <CategoryDescription>{category.description}</CategoryDescription>
            
            <CategoryFooter>
              <CategoryDate>
                <span>Created: {formatDate(category.createdAt)}</span>
                <span>Updated: {formatDate(category.updatedAt)}</span>
              </CategoryDate>
              <CategoryStatus active={category.isActive}>
                {category.isActive ? 'Active' : 'Inactive'}
              </CategoryStatus>
            </CategoryFooter>
          </CategoryCard>
        ))}
      </CategoriesGrid>

      {filteredCategories.length === 0 && (
        <EmptyState>
          <EmptyIcon>📁</EmptyIcon>
          <EmptyTitle>No categories found</EmptyTitle>
          <EmptyMessage>
            {searchTerm || filterStatus !== 'all' 
              ? "No categories match your current filters. Try adjusting your search criteria."
              : "No categories have been created yet. Start by creating your first category!"
            }
          </EmptyMessage>
          {(!searchTerm && filterStatus === 'all') && (
            <ActionButton onClick={handleCreateCategory}>
              <FiPlus size={16} />
              Create First Category
            </ActionButton>
          )}
        </EmptyState>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationButton
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </PaginationButton>
          <PaginationButton
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PaginationButton>
          
          {[...Array(totalPages)].map((_, i) => {
            const pageNumber = i + 1;
            const isCurrentPage = pageNumber === currentPage;
            const shouldShow = 
              pageNumber === 1 || 
              pageNumber === totalPages || 
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
            
            if (!shouldShow) {
              if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                return <PaginationEllipsis key={pageNumber}>...</PaginationEllipsis>;
              }
              return null;
            }
            
            return (
              <PaginationButton
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                active={isCurrentPage}
              >
                {pageNumber}
              </PaginationButton>
            );
          })}
          
          <PaginationButton
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </PaginationButton>
          <PaginationButton
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </PaginationButton>
        </Pagination>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <MdCategory size={20} />
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </ModalTitle>
              <ModalCloseButton onClick={handleCloseModal}>
                <FiX size={20} />
              </ModalCloseButton>
            </ModalHeader>
            
            <ModalContent>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>
                    <FiTag size={14} />
                    Category Name *
                  </Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter category name"
                    hasError={!!errors.name}
                  />
                  {errors.name && <ErrorText>{errors.name}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>
                    <FiFileText size={14} />
                    Description *
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what services this category includes..."
                    rows={3}
                    hasError={!!errors.description}
                  />
                  {errors.description && <ErrorText>{errors.description}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Category Color</Label>
                  <ColorPicker>
                    {predefinedColors.map(color => (
                      <ColorOption
                        key={color}
                        color={color}
                        selected={formData.color === color}
                        onClick={() => handleInputChange('color', color)}
                      />
                    ))}
                  </ColorPicker>
                </FormGroup>

                <FormGroup>
                  <Label>Status</Label>
                  <StatusToggle>
                    <StatusOption>
                      <input
                        type="radio"
                        name="status"
                        checked={formData.isActive}
                        onChange={() => handleInputChange('isActive', true)}
                      />
                      <span>Active</span>
                    </StatusOption>
                    <StatusOption>
                      <input
                        type="radio"
                        name="status"
                        checked={!formData.isActive}
                        onChange={() => handleInputChange('isActive', false)}
                      />
                      <span>Inactive</span>
                    </StatusOption>
                  </StatusToggle>
                </FormGroup>
              </Form>
            </ModalContent>
            
            <ModalFooter>
              <ActionButton variant="secondary" onClick={handleCloseModal} disabled={isLoading}>
                Cancel
              </ActionButton>
              <ActionButton onClick={handleSubmit} disabled={isLoading}>
                <FiSave size={16} />
                {isLoading 
                  ? (editingCategory ? 'Updating...' : 'Creating...') 
                  : (editingCategory ? 'Update Category' : 'Create Category')
                }
              </ActionButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}

      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>Processing...</LoadingText>
        </LoadingOverlay>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #6366f1 100%);
  color: white;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div``;

const BackLink = styled.button`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 16px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const TotalCount = styled.span`
  font-size: 16px;
  font-weight: 400;
  opacity: 0.8;
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ActionButton = styled.button<{ variant?: 'secondary' | 'edit' | 'delete' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${props => props.variant === 'edit' || props.variant === 'delete' ? '6px 8px' : '10px 16px'};
  border: none;
  border-radius: ${props => props.variant === 'edit' || props.variant === 'delete' ? '4px' : '6px'};
  font-size: ${props => props.variant === 'edit' || props.variant === 'delete' ? '12px' : '14px'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    if (props.variant === 'secondary') {
      return `
        background: #e5e7eb;
        color: #374151;
        &:hover:not(:disabled) {
          background: #d1d5db;
        }
      `;
    } else if (props.variant === 'edit') {
      return `
        background: #f0f9ff;
        color: #0284c7;
        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `;
    } else if (props.variant === 'delete') {
      return `
        background: #fee2e2;
        color: #dc2626;
        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `;
    } else {
      return `
        background: white;
        color: ${theme.colors.primary};
        &:hover:not(:disabled) {
          background: #f9fafb;
          transform: translateY(-1px);
        }
      `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const SummaryCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const SummaryIcon = styled.div`
  padding: 8px;
  border-radius: 8px;
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
  flex-shrink: 0;
`;

const SummaryContent = styled.div`
  flex: 1;
`;

const SummaryValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
`;

const SummarySubtext = styled.div`
  font-size: 11px;
  color: #9ca3af;
`;

const Controls = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchAndFilter = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 300px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    min-width: auto;
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  
  svg {
    position: absolute;
    left: 12px;
    color: #6b7280;
    z-index: 1;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 120px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const ResultsInfo = styled.div`
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  padding: 24px;
`;

const CategoryCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
`;

const CategoryColorBadge = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.color};
  flex-shrink: 0;
  margin-top: 2px;
`;

const CategoryMeta = styled.div`
  flex: 1;
`;

const CategoryName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
`;

const CategoryServiceCount = styled.span`
  font-size: 12px;
  color: #6b7280;
`;

const CategoryActions = styled.div`
  display: flex;
  gap: 4px;
`;

const CategoryDescription = styled.p`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  margin: 0 0 16px 0;
`;

const CategoryFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
`;

const CategoryDate = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
  color: #9ca3af;
`;

const CategoryStatus = styled.span<{ active: boolean }>`
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  background: ${props => props.active ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.active ? '#065f46' : '#991b1b'};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 400px;
  line-height: 1.5;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.active ? theme.colors.primary : '#d1d5db'};
  background: ${props => props.active ? theme.colors.primary : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? theme.colors.primary : '#f9fafb'};
    border-color: ${theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationEllipsis = styled.span`
  padding: 8px 4px;
  color: #6b7280;
  font-size: 14px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
`;

const Form = styled.form``;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 12px;
  border: 1px solid ${props => props.hasError ? '#ef4444' : '#d1d5db'};
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.hasError ? '#ef444420' : `${theme.colors.primary}20`};
  }
`;

const Textarea = styled.textarea<{ hasError?: boolean }>`
  padding: 12px;
  border: 1px solid ${props => props.hasError ? '#ef4444' : '#d1d5db'};
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.hasError ? '#ef444420' : `${theme.colors.primary}20`};
  }
`;

const ColorPicker = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ColorOption = styled.button<{ color: string; selected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${props => props.color};
  border: 2px solid ${props => props.selected ? '#111827' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    border-color: #111827;
  }
`;

const StatusToggle = styled.div`
  display: flex;
  gap: 16px;
`;

const StatusOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input[type="radio"] {
    margin: 0;
  }
  
  span {
    font-size: 14px;
    color: #374151;
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #ef4444;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
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

export default AdminServiceCategories