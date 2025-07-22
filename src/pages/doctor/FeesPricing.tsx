import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { 
  FiSave, 
  FiRefreshCw, 
  FiEdit, 
  FiDollarSign,
  FiTrendingUp,
  FiEye,
  FiPercent,
  FiCopy,
  FiRotateCcw,
  FiCalendar,
  FiBarChart,
  FiDownload,
  FiAlertTriangle,
  FiCheck
} from "react-icons/fi";
import Swal from "sweetalert2";

// Theme configuration
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

// Mock hooks - Replace with your actual API hooks
const useDoctorFees = () => {
  const [feesData, setFeesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFeesData({
        consultationFees: {
          regular: 500,
          followUp: 300,
          emergency: 800,
          online: 400
        },
        specialServices: [
          { id: '1', name: 'Health Checkup', fee: 1200 },
          { id: '2', name: 'ECG Reading', fee: 300 },
          { id: '3', name: 'Blood Pressure Monitoring', fee: 150 }
        ],
        discounts: {
          senior: 10,
          student: 15,
          family: 20
        },
        paymentMethods: ['cash', 'card', 'insurance', 'upi'],
        currency: '₹',
        lastUpdated: '2025-07-20T10:30:00Z',
        effectiveDate: '2025-07-21T00:00:00Z'
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const updateFees = async (updatedFeesData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFeesData(updatedFeesData);
      return { success: true, data: updatedFeesData };
    } catch (error) {
      throw error;
    }
  };

  return {
    data: feesData,
    isLoading,
    error,
    updateFees,
    refetch: () => {}
  };
};

const DoctorFees = () => {
  const { data: currentFees, isLoading, error, updateFees, refetch } = useDoctorFees();

  // Local state
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form data when current fees load
  useEffect(() => {
    if (currentFees) {
      setFormData({ ...currentFees });
    }
  }, [currentFees]);

  // Fee templates
  const feeTemplates = [
    {
      id: 'budget',
      name: 'Budget-Friendly',
      description: 'Accessible pricing for all patients',
      fees: {
        regular: 300,
        followUp: 200,
        emergency: 500,
        online: 250
      }
    },
    {
      id: 'standard',
      name: 'Standard Market Rate',
      description: 'Competitive market pricing',
      fees: {
        regular: 500,
        followUp: 300,
        emergency: 800,
        online: 400
      }
    },
    {
      id: 'premium',
      name: 'Premium Service',
      description: 'Higher-end pricing model',
      fees: {
        regular: 800,
        followUp: 500,
        emergency: 1200,
        online: 600
      }
    }
  ];

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const validateFeeStructure = (fees) => {
    const errors = {};
    
    // Validate consultation fees
    Object.entries(fees.consultationFees || {}).forEach(([type, amount]) => {
      if (!amount || amount < 0) {
        errors[`consultationFees.${type}`] = 'Amount must be greater than 0';
      }
      if (amount > 10000) {
        errors[`consultationFees.${type}`] = 'Amount seems too high';
      }
    });

    // Validate discounts
    Object.entries(fees.discounts || {}).forEach(([type, percentage]) => {
      if (percentage < 0 || percentage > 50) {
        errors[`discounts.${type}`] = 'Discount must be between 0-50%';
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      fieldErrors: errors
    };
  };

  const calculateRevenueProjection = (fees) => {
    // Mock calculation based on average appointments
    const averageAppointments = {
      regular: 20,
      followUp: 15,
      emergency: 3,
      online: 10
    };

    // const monthlyRevenue = Object.entries(averageAppointments).reduce((total, [type, count]) => {
    //   return total + (fees.consultationFees[type] * count);
    // }, 0);

    // return monthlyRevenue;
  };

  const calculateChanges = (oldFees, newFees) => {
    if (!oldFees || !newFees) return {};
    
    const changes = {};
    Object.entries(newFees.consultationFees || {}).forEach(([type, newAmount]) => {
      const oldAmount = oldFees.consultationFees[type] || 0;
      const change = newAmount - oldAmount;
      if (change !== 0) {
        changes[type] = change;
      }
    });
    
    return changes;
  };

  // Event handlers
  const handleFieldChange = (field, value) => {
    const keys = field.split('.');
    const updatedData = { ...formData };
    
    let current = updatedData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setFormData(updatedData);
    setHasUnsavedChanges(true);
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleSave = async () => {
    // Validate before saving
    const validation = validateFeeStructure(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.fieldErrors);
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fix the errors before saving.',
        icon: 'error',
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateFees({
        ...formData,
        lastUpdated: new Date().toISOString()
      });
      
      setIsEditing(false);
      setHasUnsavedChanges(false);
      setValidationErrors({});
      
      Swal.fire({
        title: 'Success!',
        text: 'Fee structure updated successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update fee structure.',
        icon: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...currentFees });
    setHasUnsavedChanges(false);
    setValidationErrors({});
    Swal.fire({
      title: 'Reset Complete',
      text: 'Changes have been reset to saved values.',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleApplyTemplate = async (template) => {
    const result = await Swal.fire({
      title: `Apply ${template.name}?`,
      text: 'This will overwrite your current consultation fees.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: theme.colors.primary,
      cancelButtonColor: theme.colors.textSecondary,
      confirmButtonText: 'Yes, apply template'
    });

    if (result.isConfirmed) {
      setFormData(prev => ({
        ...prev,
        consultationFees: { ...template.fees }
      }));
      setHasUnsavedChanges(true);
      setShowTemplates(false);
    }
  };

  const handleBulkUpdate = (updateType, updateValue, selectedCategories) => {
    const updatedFees = { ...formData };
    
    selectedCategories.forEach(category => {
      if (updatedFees.consultationFees[category]) {
        if (updateType === 'percentage') {
          updatedFees.consultationFees[category] = Math.round(
            updatedFees.consultationFees[category] * (1 + updateValue / 100)
          );
        } else {
          updatedFees.consultationFees[category] = 
            Math.max(0, updatedFees.consultationFees[category] + updateValue);
        }
      }
    });
    
    setFormData(updatedFees);
    setHasUnsavedChanges(true);
    setShowBulkUpdate(false);
  };

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading fee structure...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Failed to Load Fee Structure</ErrorTitle>
          <ErrorMessage>Unable to load your fee information. Please try again.</ErrorMessage>
          <RetryButton onClick={refetch}>
            <FiRefreshCw size={16} />
            Try Again
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  const projectedChanges = calculateChanges(currentFees, formData);
  const hasChanges = Object.keys(projectedChanges).length > 0;

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderContent>
          <Title>Fee Management</Title>
          <Subtitle>Manage your consultation fees and pricing structure</Subtitle>
          <LastUpdated>
            Last updated: {new Date(currentFees?.lastUpdated).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </LastUpdated>
        </HeaderContent>
        <HeaderActions>
          {hasUnsavedChanges && (
            <UnsavedIndicator>
              <FiAlertTriangle size={14} />
              Unsaved changes
            </UnsavedIndicator>
          )}
          {isEditing ? (
            <>
              <ActionButton variant="secondary" onClick={handleReset} disabled={!hasUnsavedChanges}>
                <FiRotateCcw size={16} />
                Reset
              </ActionButton>
              <ActionButton variant="primary" onClick={handleSave} disabled={!hasUnsavedChanges || isSaving}>
                <FiSave size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </ActionButton>
            </>
          ) : (
            <>
              <ActionButton variant="secondary" onClick={refetch}>
                <FiRefreshCw size={16} />
                Refresh
              </ActionButton>
              <ActionButton variant="primary" onClick={() => setIsEditing(true)}>
                <FiEdit size={16} />
                Edit Fees
              </ActionButton>
            </>
          )}
        </HeaderActions>
      </Header>

      <ContentGrid>
        {/* Fee Form Panel */}
        <FeeFormPanel>
          <PanelHeader>
            <PanelTitle>Fee Structure</PanelTitle>
            {isEditing && (
              <PanelActions>
                <QuickAction onClick={() => setShowTemplates(true)}>
                  <FiCopy size={14} />
                  Templates
                </QuickAction>
                <QuickAction onClick={() => setShowBulkUpdate(true)}>
                  <FiPercent size={14} />
                  Bulk Update
                </QuickAction>
              </PanelActions>
            )}
          </PanelHeader>

          {/* Consultation Fees */}
          <FeeSection>
            <SectionTitle>Consultation Fees</SectionTitle>
            <FeeGrid>
              <FeeInputGroup>
                <FeeInput
                  label="Regular Consultation"
                  value={formData.consultationFees?.regular || 0}
                  onChange={(value) => handleFieldChange('consultationFees.regular', value)}
                  currency={formData.currency}
                  disabled={!isEditing}
                  error={validationErrors['consultationFees.regular']}
                  helpText="Standard consultation fee"
                />
              </FeeInputGroup>
              
              <FeeInputGroup>
                <FeeInput
                  label="Follow-up Visit"
                  value={formData.consultationFees?.followUp || 0}
                  onChange={(value) => handleFieldChange('consultationFees.followUp', value)}
                  currency={formData.currency}
                  disabled={!isEditing}
                  error={validationErrors['consultationFees.followUp']}
                  helpText="Return visit fee"
                />
              </FeeInputGroup>
              
              <FeeInputGroup>
                <FeeInput
                  label="Emergency Consultation"
                  value={formData.consultationFees?.emergency || 0}
                  onChange={(value) => handleFieldChange('consultationFees.emergency', value)}
                  currency={formData.currency}
                  disabled={!isEditing}
                  error={validationErrors['consultationFees.emergency']}
                  helpText="Urgent care fee"
                />
              </FeeInputGroup>
              
              <FeeInputGroup>
                <FeeInput
                  label="Online Consultation"
                  value={formData.consultationFees?.online || 0}
                  onChange={(value) => handleFieldChange('consultationFees.online', value)}
                  currency={formData.currency}
                  disabled={!isEditing}
                  error={validationErrors['consultationFees.online']}
                  helpText="Telemedicine fee"
                />
              </FeeInputGroup>
            </FeeGrid>
          </FeeSection>

          {/* Special Services */}
          <FeeSection>
            <SectionTitle>Special Services</SectionTitle>
            <ServicesList>
              {formData.specialServices?.map((service, index) => (
                <ServiceItem key={service.id}>
                  <ServiceName>{service.name}</ServiceName>
                  <ServiceFee>
                    {isEditing ? (
                      <FeeInput
                        value={service.fee}
                        onChange={(value) => {
                          const updatedServices = [...formData.specialServices];
                          updatedServices[index].fee = value;
                          setFormData(prev => ({ ...prev, specialServices: updatedServices }));
                          setHasUnsavedChanges(true);
                        }}
                        currency={formData.currency}
                        showLabel={false}
                      />
                    ) : (
                      <span>{formatCurrency(service.fee)}</span>
                    )}
                  </ServiceFee>
                </ServiceItem>
              ))}
            </ServicesList>
          </FeeSection>

          {/* Discounts */}
          <FeeSection>
            <SectionTitle>Discount Rates</SectionTitle>
            <DiscountGrid>
              <DiscountItem>
                <DiscountLabel>Senior Citizens</DiscountLabel>
                <PercentageInput
                  type="number"
                  value={formData.discounts?.senior || 0}
                  onChange={(e) => handleFieldChange('discounts.senior', parseFloat(e.target.value) || 0)}
                  disabled={!isEditing}
                  min="0"
                  max="50"
                />
                <PercentageSymbol>%</PercentageSymbol>
              </DiscountItem>
              
              <DiscountItem>
                <DiscountLabel>Students</DiscountLabel>
                <PercentageInput
                  type="number"
                  value={formData.discounts?.student || 0}
                  onChange={(e) => handleFieldChange('discounts.student', parseFloat(e.target.value) || 0)}
                  disabled={!isEditing}
                  min="0"
                  max="50"
                />
                <PercentageSymbol>%</PercentageSymbol>
              </DiscountItem>
              
              <DiscountItem>
                <DiscountLabel>Family Package</DiscountLabel>
                <PercentageInput
                  type="number"
                  value={formData.discounts?.family || 0}
                  onChange={(e) => handleFieldChange('discounts.family', parseFloat(e.target.value) || 0)}
                  disabled={!isEditing}
                  min="0"
                  max="50"
                />
                <PercentageSymbol>%</PercentageSymbol>
              </DiscountItem>
            </DiscountGrid>
          </FeeSection>
        </FeeFormPanel>

        {/* Summary Panel */}
        <SummaryPanel>
          <PanelHeader>
            <PanelTitle>Fee Summary & Insights</PanelTitle>
            <PanelActions>
              <QuickAction onClick={() => setShowPreview(true)}>
                <FiEye size={14} />
                Preview
              </QuickAction>
            </PanelActions>
          </PanelHeader>

          {/* Current Fees Overview */}
          <SummarySection>
            <SummaryTitle>Current Fee Structure</SummaryTitle>
            <CurrentFeesGrid>
              {Object.entries(formData.consultationFees || {}).map(([type, amount]) => (
                <FeeOverviewItem key={type}>
                  <FeeType>{type.charAt(0).toUpperCase() + type.slice(1)}</FeeType>
                  <FeeAmount>{formatCurrency(amount)}</FeeAmount>
                </FeeOverviewItem>
              ))}
            </CurrentFeesGrid>
          </SummarySection>

          {/* Projected Changes */}
          {hasChanges && (
            <SummarySection>
              <SummaryTitle>Projected Changes</SummaryTitle>
              <ChangesGrid>
                {Object.entries(projectedChanges).map(([type, change]) => (
                  <ChangeItem key={type} isIncrease={change > 0}>
                    <ChangeType>{type.charAt(0).toUpperCase() + type.slice(1)}</ChangeType>
                    <ChangeAmount isIncrease={change > 0}>
                      {change > 0 ? '+' : ''}{formatCurrency(change)}
                    </ChangeAmount>
                  </ChangeItem>
                ))}
              </ChangesGrid>
            </SummarySection>
          )}

          {/* Revenue Projection */}
          <SummarySection>
            <SummaryTitle>Monthly Revenue Projection</SummaryTitle>
            <RevenueProjection>
              <RevenueAmount>
                {formatCurrency(calculateRevenueProjection(formData))}
              </RevenueAmount>
              <RevenueNote>Based on average appointment volume</RevenueNote>
            </RevenueProjection>
          </SummarySection>

          {/* Fee History */}
          <SummarySection>
            <SummaryTitle>Recent Updates</SummaryTitle>
            <HistoryList>
              <HistoryItem>
                <HistoryDate>July 20, 2025</HistoryDate>
                <HistoryAction>Updated consultation fees</HistoryAction>
              </HistoryItem>
              <HistoryItem>
                <HistoryDate>July 15, 2025</HistoryDate>
                <HistoryAction>Added emergency fee structure</HistoryAction>
              </HistoryItem>
              <HistoryItem>
                <HistoryDate>July 10, 2025</HistoryDate>
                <HistoryAction>Modified discount rates</HistoryAction>
              </HistoryItem>
            </HistoryList>
          </SummarySection>
        </SummaryPanel>
      </ContentGrid>

      {/* Fee Templates Modal */}
      {showTemplates && (
        <TemplatesModal onClose={() => setShowTemplates(false)}>
          {feeTemplates.map(template => (
            <TemplateCard key={template.id} onClick={() => handleApplyTemplate(template)}>
              <TemplateName>{template.name}</TemplateName>
              <TemplateDescription>{template.description}</TemplateDescription>
              <TemplatePreview>
                {Object.entries(template.fees).map(([type, amount]) => (
                  <PreviewItem key={type}>
                    <span>{type}</span>
                    <span>{formatCurrency(amount)}</span>
                  </PreviewItem>
                ))}
              </TemplatePreview>
            </TemplateCard>
          ))}
        </TemplatesModal>
      )}

      {/* Bulk Update Modal */}
      {showBulkUpdate && (
        <BulkUpdateModal
          onClose={() => setShowBulkUpdate(false)}
          onApply={handleBulkUpdate}
          currentFees={formData.consultationFees}
        />
      )}
    </Container>
  );
};

// Fee Input Component
const FeeInput = ({ 
  label, 
  value, 
  onChange, 
  currency = '₹', 
  disabled = false, 
  error, 
  helpText,
  showLabel = true 
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value) || 0;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <FeeInputContainer>
      {showLabel && <FeeLabel>{label}</FeeLabel>}
      <InputWrapper hasError={!!error}>
        <CurrencySymbol>{currency}</CurrencySymbol>
        <NumberInput
          type="number"
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          min="0"
          max="10000"
          step="1"
        />
      </InputWrapper>
      {error && <ErrorText>{error}</ErrorText>}
      {helpText && !error && <HelpText>{helpText}</HelpText>}
    </FeeInputContainer>
  );
};

// Bulk Update Modal Component
const BulkUpdateModal = ({ onClose, onApply, currentFees }) => {
  const [updateType, setUpdateType] = useState('percentage');
  const [updateValue, setUpdateValue] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = Object.keys(currentFees || {});

  const handleApply = () => {
    if (selectedCategories.length === 0) {
      Swal.fire({
        title: 'No Categories Selected',
        text: 'Please select at least one fee category to update.',
        icon: 'warning',
      });
      return;
    }

    onApply(updateType, updateValue, selectedCategories);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Bulk Fee Update</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <UpdateTypeSection>
            <RadioGroup>
              <RadioOption>
                <input
                  type="radio"
                  value="percentage"
                  checked={updateType === 'percentage'}
                  onChange={(e) => setUpdateType(e.target.value)}
                />
                <label>Percentage Increase/Decrease</label>
              </RadioOption>
              <RadioOption>
                <input
                  type="radio"
                  value="amount"
                  checked={updateType === 'amount'}
                  onChange={(e) => setUpdateType(e.target.value)}
                />
                <label>Fixed Amount Increase/Decrease</label>
              </RadioOption>
            </RadioGroup>
          </UpdateTypeSection>

          <ValueInputSection>
            <ValueInput
              type="number"
              value={updateValue}
              onChange={(e) => setUpdateValue(parseFloat(e.target.value) || 0)}
              placeholder={updateType === 'percentage' ? '10' : '50'}
            />
            <span>{updateType === 'percentage' ? '%' : '₹'}</span>
          </ValueInputSection>

          <CategorySection>
            <SectionLabel>Select Categories:</SectionLabel>
            {categories.map(category => (
              <CategoryOption key={category}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories(prev => [...prev, category]);
                    } else {
                      setSelectedCategories(prev => prev.filter(c => c !== category));
                    }
                  }}
                />
                <label>{category.charAt(0).toUpperCase() + category.slice(1)}</label>
              </CategoryOption>
            ))}
          </CategorySection>
        </ModalBody>

        <ModalActions>
          <ModalButton variant="secondary" onClick={onClose}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={handleApply}>
            Apply Update
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};

// Templates Modal Component
const TemplatesModal = ({ onClose, children }) => (
  <ModalOverlay onClick={onClose}>
    <TemplatesModalContent onClick={(e) => e.stopPropagation()}>
      <ModalHeader>
        <ModalTitle>Fee Templates</ModalTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </ModalHeader>
      <TemplatesGrid>
        {children}
      </TemplatesGrid>
    </TemplatesModalContent>
  </ModalOverlay>
);

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

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0 0 8px 0;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const LastUpdated = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const UnsavedIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(245, 158, 11, 0.2);
  color: ${theme.colors.warning};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(245, 158, 11, 0.3);
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border-color: rgba(255, 255, 255, 0.3);
          
          &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: rgba(255, 255, 255, 0.2);
          
          &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.2);
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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  padding: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const FeeFormPanel = styled.div`
  background: #f8fafc;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 8px;
  overflow: hidden;
`;

const SummaryPanel = styled.div`
  background: white;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 8px;
  overflow: hidden;
  height: fit-content;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid ${theme.colors.lightGray};
`;

const PanelTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const PanelActions = styled.div`
  display: flex;
  gap: 8px;
`;

const QuickAction = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  color: ${theme.colors.textSecondary};
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    color: ${theme.colors.textPrimary};
    border-color: ${theme.colors.primary};
  }
`;

const FeeSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${theme.colors.lightGray};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 16px 0;
`;

const FeeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeeInputGroup = styled.div``;

const FeeInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FeeLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid ${props => props.hasError ? theme.colors.danger : theme.colors.lightGray};
  border-radius: 6px;
  background: white;
  transition: all 0.2s;

  &:focus-within {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const CurrencySymbol = styled.span`
  padding: 0 12px;
  color: ${theme.colors.textSecondary};
  font-weight: 500;
  border-right: 1px solid ${theme.colors.lightGray};
  background: #f9fafb;
`;

const NumberInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;

  &:disabled {
    background: #f9fafb;
    color: ${theme.colors.textSecondary};
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: ${theme.colors.danger};
`;

const HelpText = styled.span`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const ServicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ServiceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
`;

const ServiceName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const ServiceFee = styled.div`
  min-width: 120px;
  text-align: right;
`;

const DiscountGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DiscountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
`;

const DiscountLabel = styled.span`
  flex: 1;
  font-size: 14px;
  color: ${theme.colors.textPrimary};
`;

const PercentageInput = styled.input`
  width: 60px;
  padding: 6px 8px;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 4px;
  text-align: center;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}20;
  }

  &:disabled {
    background: #f9fafb;
    color: ${theme.colors.textSecondary};
  }
`;

const PercentageSymbol = styled.span`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
`;

const SummarySection = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${theme.colors.lightGray};

  &:last-child {
    border-bottom: none;
  }
`;

const SummaryTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 12px 0;
`;

const CurrentFeesGrid = styled.div`
  display: grid;
  gap: 8px;
`;

const FeeOverviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 4px;
`;

const FeeType = styled.span`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
`;

const FeeAmount = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;

const ChangesGrid = styled.div`
  display: grid;
  gap: 8px;
`;

const ChangeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: ${props => props.isIncrease ? '#f0fdf4' : '#fef2f2'};
  border-radius: 4px;
  border: 1px solid ${props => props.isIncrease ? '#bbf7d0' : '#fecaca'};
`;

const ChangeType = styled.span`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
`;

const ChangeAmount = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.isIncrease ? theme.colors.success : theme.colors.danger};
`;

const RevenueProjection = styled.div`
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.secondary}10);
  border-radius: 8px;
  border: 1px solid ${theme.colors.primary}20;
`;

const RevenueAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: 4px;
`;

const RevenueNote = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HistoryItem = styled.div`
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 4px;
  border-left: 3px solid ${theme.colors.primary};
`;

const HistoryDate = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 2px;
`;

const HistoryAction = styled.div`
  font-size: 13px;
  color: ${theme.colors.textPrimary};
`;

// Modal Components
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
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const TemplatesModalContent = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${theme.colors.lightGray};
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  color: ${theme.colors.textSecondary};
  border: none;
  border-radius: 6px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: ${theme.colors.textPrimary};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid ${theme.colors.lightGray};
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          color: white;
          border: none;
          
          &:hover {
            background: ${theme.colors.primaryDark};
          }
        `;
      case 'secondary':
        return `
          background: white;
          color: ${theme.colors.textSecondary};
          border: 1px solid ${theme.colors.lightGray};
          
          &:hover {
            background: #f9fafb;
          }
        `;
      default:
        return '';
    }
  }}
`;

const UpdateTypeSection = styled.div`
  margin-bottom: 20px;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RadioOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  input[type="radio"] {
    margin: 0;
  }

  label {
    font-size: 14px;
    color: ${theme.colors.textPrimary};
    cursor: pointer;
  }
`;

const ValueInputSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
`;

const ValueInput = styled.input`
  padding: 10px 12px;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
  font-size: 14px;
  width: 120px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const CategorySection = styled.div``;

const SectionLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
  margin-bottom: 12px;
`;

const CategoryOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  input[type="checkbox"] {
    margin: 0;
  }

  label {
    font-size: 14px;
    color: ${theme.colors.textPrimary};
    cursor: pointer;
  }
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  padding: 24px;
`;

const TemplateCard = styled.div`
  padding: 20px;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
`;

const TemplateName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 8px 0;
`;

const TemplateDescription = styled.p`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  margin: 0 0 12px 0;
  line-height: 1.4;
`;

const TemplatePreview = styled.div`
  display: grid;
  gap: 4px;
`;

const PreviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: ${theme.colors.textSecondary};

  span:last-child {
    font-weight: 500;
    color: ${theme.colors.textPrimary};
  }
`;

// Loading and Error Components
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
  border: 3px solid ${theme.colors.lightGray};
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

export default DoctorFees;