import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { 
  FiSave, 
  FiRefreshCw, 
  FiEdit, 
  FiRotateCcw,
  FiAlertTriangle,
  FiCheck
} from "react-icons/fi";
import Swal from "sweetalert2";
import { useDoctorFees, useUpdateDoctorFees } from "@/hooks/useDoctor";

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

// Yup validation schema
const feeSchema = yup.object({
  consultationFee: yup
    .number()
    .typeError('Consultation fee must be a number')
    .min(1, 'Consultation fee must be at least ₹1')
    .max(50000, 'Consultation fee cannot exceed ₹50,000')
    .required('Consultation fee is required'),
  followUpFee: yup
    .number()
    .typeError('Follow-up fee must be a number')
    .min(0, 'Follow-up fee cannot be negative')
    .max(50000, 'Follow-up fee cannot exceed ₹50,000')
    .nullable()
    .transform((value, originalValue) => originalValue === "" ? null : value)
    .test('follow-up-validation', 'Follow-up fee should not be higher than consultation fee', function(value) {
      const { consultationFee } = this.parent;
      if (value && consultationFee && value > consultationFee) {
        return false;
      }
      return true;
    }),
  emergencyFee: yup
    .number()
    .typeError('Emergency fee must be a number')
    .min(0, 'Emergency fee cannot be negative')
    .max(100000, 'Emergency fee cannot exceed ₹1,00,000')
    .nullable()
    .transform((value, originalValue) => originalValue === "" ? null : value)
    .test('emergency-validation', 'Emergency fee should be higher than consultation fee', function(value) {
      const { consultationFee } = this.parent;
      if (value && consultationFee && value < consultationFee) {
        return false;
      }
      return true;
    })
});

const DoctorFees = () => {
  const { data: feesResponse, isLoading, error, refetch } = useDoctorFees();
  const { mutate: updateFees, isPending: isSaving } = useUpdateDoctorFees();
  
  // Extract fees data from response
  const currentFees = feesResponse?.data?.fees;

  // Local state
  const [isEditing, setIsEditing] = useState(false);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValid }
  } = useForm({
    resolver: yupResolver(feeSchema),
    defaultValues: {
      consultationFee: 0,
      followUpFee: null,
      emergencyFee: null
    },
    mode: 'onChange' // Validate on change for better UX
  });

  // Watch form values for display
  const formValues = watch();

  // Initialize form data when current fees load
  useEffect(() => {
    if (currentFees) {
      reset({
        consultationFee: currentFees.consultationFee || 0,
        followUpFee: currentFees.followUpFee || null,
        emergencyFee: currentFees.emergencyFee || null
      });
    }
  }, [currentFees, reset]);

  // Helper functions
  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Form submission handler
  const onSubmit = (data: any) => {
    // Prepare data for API - remove null values for optional fields
    const apiData = {
      consultationFee: data.consultationFee,
      ...(data.followUpFee && { followUpFee: data.followUpFee }),
      ...(data.emergencyFee && { emergencyFee: data.emergencyFee })
    };

    updateFees(apiData, {
      onSuccess: () => {
        setIsEditing(false);
        refetch(); // Refresh data after successful update
        
        Swal.fire({
          title: 'Success!',
          text: 'Fee structure updated successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      onError: (error) => {
        console.error('Update failed:', error);
        Swal.fire({
          title: 'Error!',
          text: error?.response?.data?.message || 'Failed to update fee structure.',
          icon: 'error',
        });
      }
    });
  };

  const handleReset = () => {
    reset({
      consultationFee: currentFees?.consultationFee || 0,
      followUpFee: currentFees?.followUpFee || null,
      emergencyFee: currentFees?.emergencyFee || null
    });
    
    Swal.fire({
      title: 'Reset Complete',
      text: 'Changes have been reset to saved values.',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

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
          <RetryButton onClick={() => refetch()}>
            <FiRefreshCw size={16} />
            Try Again
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderContent>
          <Title>Fee Management</Title>
          <Subtitle>Manage your consultation fees and pricing structure</Subtitle>
        </HeaderContent>
        <HeaderActions>
          {isDirty && (
            <UnsavedIndicator>
              <FiAlertTriangle size={14} />
              Unsaved changes
            </UnsavedIndicator>
          )}
          {isEditing ? (
            <>
              <ActionButton 
                type="button"
                variant="secondary" 
                onClick={handleReset} 
                disabled={!isDirty}
              >
                <FiRotateCcw size={16} />
                Reset
              </ActionButton>
              <ActionButton 
                type="button"
                variant="primary" 
                onClick={handleSubmit(onSubmit)} 
                disabled={!isDirty || !isValid || isSaving}
              >
                <FiSave size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </ActionButton>
            </>
          ) : (
            <>
              <ActionButton variant="secondary" onClick={() => refetch()}>
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

      <ContentContainer>
        {/* Fee Form */}
        <FeeFormPanel>
          <PanelHeader>
            <PanelTitle>Fee Structure</PanelTitle>
            {isDirty && (
              <ChangesBadge>
                <FiCheck size={12} />
                Changes pending
              </ChangesBadge>
            )}
          </PanelHeader>

          <FeeSection>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FeeGrid>
                <FeeInputGroup>
                  <Controller
                    name="consultationFee"
                    control={control}
                    render={({ field }) => (
                      <FeeInput
                        label="Consultation Fee *"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={!isEditing}
                        error={errors.consultationFee?.message}
                        helpText="Standard consultation fee"
                        required
                      />
                    )}
                  />
                </FeeInputGroup>
                
                <FeeInputGroup>
                  <Controller
                    name="followUpFee"
                    control={control}
                    render={({ field }) => (
                      <FeeInput
                        label="Follow-up Fee"
                        value={field.value || ''}
                        onChange={(value) => field.onChange(value || null)}
                        onBlur={field.onBlur}
                        disabled={!isEditing}
                        error={errors.followUpFee?.message}
                        helpText="Return visit fee (optional)"
                      />
                    )}
                  />
                </FeeInputGroup>
                
                <FeeInputGroup>
                  <Controller
                    name="emergencyFee"
                    control={control}
                    render={({ field }) => (
                      <FeeInput
                        label="Emergency Fee"
                        value={field.value || ''}
                        onChange={(value) => field.onChange(value || null)}
                        onBlur={field.onBlur}
                        disabled={!isEditing}
                        error={errors.emergencyFee?.message}
                        helpText="Urgent care fee (optional)"
                      />
                    )}
                  />
                </FeeInputGroup>
              </FeeGrid>
            </form>
          </FeeSection>
        </FeeFormPanel>

        {/* Summary Panel */}
        <SummaryPanel>
          <PanelHeader>
            <PanelTitle>Current Fees</PanelTitle>
          </PanelHeader>

          <SummarySection>
            <CurrentFeesGrid>
              <FeeOverviewItem>
                <FeeType>Consultation</FeeType>
                <FeeAmount>{formatCurrency(formValues.consultationFee)}</FeeAmount>
              </FeeOverviewItem>
              {formValues.followUpFee > 0 && (
                <FeeOverviewItem>
                  <FeeType>Follow-up</FeeType>
                  <FeeAmount>{formatCurrency(formValues.followUpFee)}</FeeAmount>
                </FeeOverviewItem>
              )}
              {formValues.emergencyFee > 0 && (
                <FeeOverviewItem>
                  <FeeType>Emergency</FeeType>
                  <FeeAmount>{formatCurrency(formValues.emergencyFee)}</FeeAmount>
                </FeeOverviewItem>
              )}
            </CurrentFeesGrid>
          </SummarySection>

          {isDirty && (
            <SummarySection>
              <ChangeNotice>
                <FiAlertTriangle size={16} />
                <div>
                  <strong>Unsaved Changes</strong>
                  <div>Remember to save your changes to apply the new fee structure</div>
                </div>
              </ChangeNotice>
            </SummarySection>
          )}

          {/* Validation Status */}
          {isEditing && (
            <SummarySection>
              <ValidationStatus isValid={isValid}>
                {isValid ? (
                  <>
                    <FiCheck size={16} />
                    <div>
                      <strong>Form Valid</strong>
                      <div>All fields are correctly filled</div>
                    </div>
                  </>
                ) : (
                  <>
                    <FiAlertTriangle size={16} />
                    <div>
                      <strong>Validation Errors</strong>
                      <div>Please fix the errors above</div>
                    </div>
                  </>
                )}
              </ValidationStatus>
            </SummarySection>
          )}

          {/* Fee Guidelines */}
          <SummarySection>
            <GuidelinesTitle>Fee Guidelines</GuidelinesTitle>
            <GuidelinesList>
              <GuidelineItem>• Consultation fee is required</GuidelineItem>
              <GuidelineItem>• Follow-up fee should be less than or equal to consultation fee</GuidelineItem>
              <GuidelineItem>• Emergency fee should be higher than consultation fee</GuidelineItem>
              <GuidelineItem>• All fees are in Indian Rupees (₹)</GuidelineItem>
            </GuidelinesList>
          </SummarySection>
        </SummaryPanel>
      </ContentContainer>
    </Container>
  );
};

// Fee Input Component
const FeeInput = ({ 
  label, 
  value, 
  onChange, 
  onBlur,
  disabled = false, 
  error, 
  helpText,
  required = false
}) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    // Convert to number or null for empty string
    onChange(newValue === '' ? null : parseFloat(newValue) || 0);
  };

  return (
    <FeeInputContainer>
      <FeeLabel>
        {label}
        {required && <RequiredMark>*</RequiredMark>}
      </FeeLabel>
      <InputWrapper hasError={!!error}>
        <CurrencySymbol>₹</CurrencySymbol>
        <NumberInput
          type="number"
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          min="0"
          max="100000"
          step="10"
          placeholder="0"
        />
      </InputWrapper>
      {error && <ErrorText>{error}</ErrorText>}
      {helpText && !error && <HelpText>{helpText}</HelpText>}
    </FeeInputContainer>
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
  margin: 0;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 13px;
  }
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

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
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

const ChangesBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: ${theme.colors.success}15;
  color: ${theme.colors.success};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${theme.colors.success}30;
`;

const FeeSection = styled.div`
  padding: 24px;
`;

const FeeGrid = styled.div`
  display: grid;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
`;

const FeeInputGroup = styled.div``;

const FeeInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FeeLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RequiredMark = styled.span`
  color: ${theme.colors.danger};
  font-weight: 700;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border: 2px solid ${props => props.hasError ? theme.colors.danger : theme.colors.lightGray};
  border-radius: 8px;
  background: white;
  transition: all 0.2s;

  &:focus-within {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}15;
  }
`;

const CurrencySymbol = styled.span`
  padding: 0 14px;
  color: ${theme.colors.textSecondary};
  font-weight: 600;
  border-right: 2px solid ${theme.colors.lightGray};
  background: #f9fafb;
  font-size: 14px;
`;

const NumberInput = styled.input`
  flex: 1;
  padding: 14px 16px;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  font-weight: 500;

  &:disabled {
    background: #f9fafb;
    color: ${theme.colors.textSecondary};
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
    opacity: 0.6;
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: ${theme.colors.danger};
  font-weight: 500;
`;

const HelpText = styled.span`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const SummarySection = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${theme.colors.lightGray};

  &:last-child {
    border-bottom: none;
  }
`;

const CurrentFeesGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const FeeOverviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid ${theme.colors.lightGray};
`;

const FeeType = styled.span`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  font-weight: 500;
`;

const FeeAmount = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;

const ChangeNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  color: ${theme.colors.warning};

  div {
    flex: 1;
    
    strong {
      display: block;
      font-size: 14px;
      margin-bottom: 4px;
      font-weight: 600;
    }
    
    div {
      font-size: 12px;
      color: ${theme.colors.textSecondary};
      line-height: 1.4;
    }
  }
`;

const ValidationStatus = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: ${props => props.isValid ? '#f0fdf4' : '#fef2f2'};
  border: 1px solid ${props => props.isValid ? '#bbf7d0' : '#fecaca'};
  border-radius: 8px;
  color: ${props => props.isValid ? theme.colors.success : theme.colors.danger};

  div {
    flex: 1;
    
    strong {
      display: block;
      font-size: 14px;
      margin-bottom: 4px;
      font-weight: 600;
    }
    
    div {
      font-size: 12px;
      color: ${theme.colors.textSecondary};
      line-height: 1.4;
    }
  }
`;

const GuidelinesTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 12px 0;
`;

const GuidelinesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const GuidelineItem = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  line-height: 1.4;
`;

// Loading and Error Components
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
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
  margin-top: 16px;
  color: ${theme.colors.textSecondary};
  font-size: 16px;
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const ErrorTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.danger};
  margin: 0 0 12px 0;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: ${theme.colors.textSecondary};
  margin: 0 0 24px 0;
  max-width: 400px;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

export default DoctorFees;