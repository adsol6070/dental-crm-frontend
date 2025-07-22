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
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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

const WarningSection = styled.div`
  background: #fef3cd;
  border: 1px solid #fde047;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const WarningIcon = styled.div`
  font-size: 20px;
  color: #d97706;
  margin-top: 2px;
`;

const WarningContent = styled.div``;

const WarningTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 4px 0;
`;

const WarningText = styled.p`
  font-size: 13px;
  color: #92400e;
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

const HelpText = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 6px 0 0 0;
  line-height: 1.4;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

interface ButtonProps {
  variant?: 'cancel' | 'danger' | 'default';
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
    } else if (props.variant === 'danger') {
      return `
        background: #ef4444;
        color: white;
        border-color: #ef4444;
        
        &:hover:not(:disabled) {
          background: #dc2626;
          border-color: #dc2626;
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

interface DisableTwoFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { password: string; twoFactorCode: string }) => Promise<void>;
  isLoading?: boolean;
}

const DisableTwoFAModal: React.FC<DisableTwoFAModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; twoFactorCode?: string }>({});

  const validateForm = () => {
    const newErrors: { password?: string; twoFactorCode?: string } = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!twoFactorCode) {
      newErrors.twoFactorCode = '2FA code is required';
    } else if (!/^\d{6}$/.test(twoFactorCode)) {
      newErrors.twoFactorCode = '2FA code must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSubmit({ password, twoFactorCode });
      // Reset form on success
      setPassword('');
      setTwoFactorCode('');
      setErrors({});
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setPassword('');
    setTwoFactorCode('');
    setErrors({});
    onClose();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleTwoFactorCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setTwoFactorCode(value);
    if (errors.twoFactorCode) {
      setErrors(prev => ({ ...prev, twoFactorCode: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={handleClose}>
      <ModalWrapper onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderIcon>🔐</HeaderIcon>
          <HeaderContent>
            <ModalTitle>Disable Two-Factor Authentication</ModalTitle>
            <ModalSubtitle>Confirm your identity to disable 2FA</ModalSubtitle>
          </HeaderContent>
        </ModalHeader>

        <ModalContent>
          <WarningSection>
            <WarningIcon>⚠️</WarningIcon>
            <WarningContent>
              <WarningTitle>Security Warning</WarningTitle>
              <WarningText>
                Disabling two-factor authentication will make your account less secure. 
                You will only need your password to sign in.
              </WarningText>
            </WarningContent>
          </WarningSection>

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
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your current password"
                value={password}
                onChange={handlePasswordChange}
                hasIcon
                hasError={!!errors.password}
                disabled={isLoading}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  {showPassword ? (
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
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormSection>

          <FormSection>
            <Label htmlFor="two-factor-code">Two-Factor Authentication Code</Label>
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
                id="two-factor-code"
                type="text"
                placeholder="000000"
                value={twoFactorCode}
                onChange={handleTwoFactorCodeChange}
                hasIcon
                hasError={!!errors.twoFactorCode}
                disabled={isLoading}
                maxLength={6}
              />
            </InputGroup>
            {errors.twoFactorCode && <ErrorMessage>{errors.twoFactorCode}</ErrorMessage>}
            <HelpText>
              Enter the 6-digit code from your authenticator app to confirm this action.
            </HelpText>
          </FormSection>

          <ButtonRow>
            <Button variant="cancel" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleSubmit} 
              disabled={isLoading || !password || !twoFactorCode}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Disabling...
                </>
              ) : (
                <>
                  🔓 Disable 2FA
                </>
              )}
            </Button>
          </ButtonRow>
        </ModalContent>
      </ModalWrapper>
    </Overlay>
  );
};

export default DisableTwoFAModal;