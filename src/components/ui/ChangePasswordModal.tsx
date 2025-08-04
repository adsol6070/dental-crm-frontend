import { useState } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalWrapper = styled.div`
  background: #fff;
  width: 500px;
  max-width: 90%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
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
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderIcon = styled.div`
  font-size: 24px;
`;

const HeaderContent = styled.div``;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const ModalSubtitle = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const InfoSection = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const InfoIcon = styled.div`
  font-size: 20px;
  color: #0369a1;
  margin-top: 2px;
`;

const InfoContent = styled.div``;

const InfoTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 4px 0;
`;

const InfoText = styled.p`
  font-size: 13px;
  color: #0c4a6e;
  margin: 0;
  line-height: 1.4;
`;

const FormSection = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
  font-size: 14px;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  z-index: 2;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Input = styled.input<{ hasIcon?: boolean; hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px ${props => props.hasIcon ? '12px 40px' : '12px 16px'};
  font-size: 14px;
  border: 1.5px solid ${props => props.hasError ? '#ef4444' : '#d1d5db'};
  border-radius: 8px;
  transition: all 0.2s ease;
  background: ${props => props.hasError ? '#fef2f2' : 'white'};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : '#6366f1'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? '#fca5a520' : '#6366f120'};
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: #9ca3af;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #6b7280;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ErrorMessage = styled.div`
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: "⚠";
    font-size: 10px;
  }
`;

const SuccessMessage = styled.div`
  font-size: 12px;
  color: #10b981;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: "✓";
    font-size: 10px;
  }
`;

const PasswordRequirements = styled.div`
  margin-top: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
`;

const RequirementsTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
`;

const RequirementsList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const RequirementItem = styled.li<{ met: boolean }>`
  font-size: 11px;
  color: ${props => props.met ? '#10b981' : '#6b7280'};
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: "${props => props.met ? '✓' : '○'}";
    font-size: 10px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

interface ButtonProps {
  variant?: 'cancel' | 'primary' | 'default';
  disabled?: boolean;
}

const Button = styled.button<ButtonProps>`
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  ${(props) => {
    if (props.variant === 'cancel') {
      return `
        background: white;
        color: #374151;
        border-color: #d1d5db;
        
        &:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }
      `;
    } else if (props.variant === 'primary') {
      return `
        background: #6366f1;
        color: white;
        border-color: #6366f1;
        
        &:hover:not(:disabled) {
          background: #4f46e5;
          border-color: #4f46e5;
          transform: translateY(-1px);
        }
      `;
    } else {
      return `
        background: #6366f1;
        color: white;
        border-color: #6366f1;
        
        &:hover:not(:disabled) {
          background: #4f46e5;
          border-color: #4f46e5;
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

const LoadingSpinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  isLoading?: boolean;
  mustChangePassword?: boolean;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  mustChangePassword = false
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ 
    currentPassword?: string; 
    newPassword?: string; 
    confirmPassword?: string; 
  }>({});

  // Password requirements
  const passwordRequirements = {
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  const validateForm = () => {
    const newErrors: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {};

    // Current password validation
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    } else if (currentPassword.length < 6) {
      newErrors.currentPassword = 'Current password must be at least 6 characters';
    }

    // New password validation
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!allRequirementsMet) {
      newErrors.newPassword = 'Password does not meet all requirements';
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSubmit({ currentPassword, newPassword, confirmPassword });
      // Reset form on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    if (!mustChangePassword) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'currentPassword':
        setCurrentPassword(value);
        if (errors.currentPassword) {
          setErrors(prev => ({ ...prev, currentPassword: undefined }));
        }
        break;
      case 'newPassword':
        setNewPassword(value);
        if (errors.newPassword) {
          setErrors(prev => ({ ...prev, newPassword: undefined }));
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        if (errors.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: undefined }));
        }
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={handleClose}>
      <ModalWrapper onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderIcon>🔐</HeaderIcon>
          <HeaderContent>
            <ModalTitle>
              {mustChangePassword ? 'Password Change Required' : 'Change Password'}
            </ModalTitle>
            <ModalSubtitle>
              {mustChangePassword 
                ? 'You must change your password to continue' 
                : 'Update your account password for better security'
              }
            </ModalSubtitle>
          </HeaderContent>
        </ModalHeader>

        <ModalContent>
          <InfoSection>
            <InfoIcon>ℹ️</InfoIcon>
            <InfoContent>
              <InfoTitle>Password Security Tips</InfoTitle>
              <InfoText>
                Create a strong password with at least 8 characters, including uppercase and lowercase letters, 
                numbers, and special characters. Avoid using common words or personal information.
              </InfoText>
            </InfoContent>
          </InfoSection>

          <FormSection>
            <Label htmlFor="current-password">Current Password</Label>
            <InputGroup>
              <InputIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </InputIcon>
              <Input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                hasIcon
                hasError={!!errors.currentPassword}
                disabled={isLoading}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={isLoading}
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  {showCurrentPassword ? (
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z M10 3C6 3 2.73 5.11 1.18 7.37c-.47.69-.47 1.57 0 2.26C2.73 11.89 6 14 10 14s7.27-2.11 8.82-4.37c.47-.69.47-1.57 0-2.26C17.27 5.11 14 3 10 3z" />
                  ) : (
                    <>
                      <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </>
                  )}
                </svg>
              </PasswordToggle>
            </InputGroup>
            {errors.currentPassword && <ErrorMessage>{errors.currentPassword}</ErrorMessage>}
          </FormSection>

          <FormSection>
            <Label htmlFor="new-password">New Password</Label>
            <InputGroup>
              <InputIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 8a6 6 0 01-7.743 5.743L10 14l-0.257-0.257A6 6 0 1118 8zM2 8a8 8 0 1016 0A8 8 0 002 8zm8-3a3 3 0 100 6 3 3 0 000-6z"
                    clipRule="evenodd"
                  />
                </svg>
              </InputIcon>
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                hasIcon
                hasError={!!errors.newPassword}
                disabled={isLoading}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading}
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  {showNewPassword ? (
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z M10 3C6 3 2.73 5.11 1.18 7.37c-.47.69-.47 1.57 0 2.26C2.73 11.89 6 14 10 14s7.27-2.11 8.82-4.37c.47-.69.47-1.57 0-2.26C17.27 5.11 14 3 10 3z" />
                  ) : (
                    <>
                      <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </>
                  )}
                </svg>
              </PasswordToggle>
            </InputGroup>
            {errors.newPassword && <ErrorMessage>{errors.newPassword}</ErrorMessage>}

            {newPassword && (
              <PasswordRequirements>
                <RequirementsTitle>Password Requirements</RequirementsTitle>
                <RequirementsList>
                  <RequirementItem met={passwordRequirements.minLength}>
                    At least 8 characters long
                  </RequirementItem>
                  <RequirementItem met={passwordRequirements.hasUppercase}>
                    Contains uppercase letter (A-Z)
                  </RequirementItem>
                  <RequirementItem met={passwordRequirements.hasLowercase}>
                    Contains lowercase letter (a-z)
                  </RequirementItem>
                  <RequirementItem met={passwordRequirements.hasNumber}>
                    Contains number (0-9)
                  </RequirementItem>
                  <RequirementItem met={passwordRequirements.hasSpecialChar}>
                    Contains special character (!@#$%^&*)
                  </RequirementItem>
                </RequirementsList>
              </PasswordRequirements>
            )}
          </FormSection>

          <FormSection>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <InputGroup>
              <InputIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </InputIcon>
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                hasIcon
                hasError={!!errors.confirmPassword}
                disabled={isLoading}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  {showConfirmPassword ? (
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z M10 3C6 3 2.73 5.11 1.18 7.37c-.47.69-.47 1.57 0 2.26C2.73 11.89 6 14 10 14s7.27-2.11 8.82-4.37c.47-.69.47-1.57 0-2.26C17.27 5.11 14 3 10 3z" />
                  ) : (
                    <>
                      <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </>
                  )}
                </svg>
              </PasswordToggle>
            </InputGroup>
            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
            {confirmPassword && confirmPassword === newPassword && (
              <SuccessMessage>Passwords match</SuccessMessage>
            )}
          </FormSection>

          <ButtonRow>
            {!mustChangePassword && (
              <Button variant="cancel" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
            )}
            <Button 
              variant="primary" 
              onClick={handleSubmit} 
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword || !allRequirementsMet}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  {mustChangePassword ? 'Updating...' : 'Changing...'}
                </>
              ) : (
                <>
                  🔐 {mustChangePassword ? 'Update Password' : 'Change Password'}
                </>
              )}
            </Button>
          </ButtonRow>
        </ModalContent>
      </ModalWrapper>
    </Overlay>
  );
};

export default ChangePasswordModal;