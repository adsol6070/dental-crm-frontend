import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { ROUTES } from "@/config/route-paths.config";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";

const schema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), undefined], "Passwords must match")
    .required("Confirm password is required"),
});

const Form = () => {
  const { resetPassword }: any = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing token");
      navigate(ROUTES.AUTH.FORGOT_PASSWORD, { replace: true });
    }
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });

  const password = watch("password");

  const getPasswordStrength = (password: string) => {
    if (!password) return { width: 0, color: "#e2e8f0", text: "" };
    
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    if (strength <= 25) return { width: 25, color: "#ef4444", text: "Weak" };
    if (strength <= 50) return { width: 50, color: "#f59e0b", text: "Fair" };
    if (strength <= 75) return { width: 75, color: "#10b981", text: "Good" };
    return { width: 100, color: "#059669", text: "Strong" };
  };

  const passwordStrength = getPasswordStrength(password || "");

  const onSubmit = async (data: {
    password: string;
    confirmPassword: string;
  }) => {
    if (!token) return;
    try {
      setIsLoading(true);
      const { confirmPassword, ...finalData } = data;
      await resetPassword({ ...finalData, token });
      setIsSuccess(true);
    } catch (err) {
      console.error("Internal error occurred. Please try again.");
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  return (
    <ResetPasswordContainer>
      <Toaster position="top-right" />
      
      <BrandHeader>
        <LogoContainer>
          <ToothIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 2.74 1.56 5.12 3.85 6.32C9.44 16.24 10.67 17 12 17s2.56-.76 3.15-1.68C17.44 14.12 19 11.74 19 9c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="3" />
            </svg>
          </ToothIcon>
          <BrandText>
            <CompanyName>Sujan Dental</CompanyName>
            <TagLine>Practice Management System</TagLine>
          </BrandText>
        </LogoContainer>
      </BrandHeader>

      <FormCard>
        {!isSuccess ? (
          <>
            <WelcomeSection>
              <WelcomeTitle>Set New Password</WelcomeTitle>
              <WelcomeSubtitle>Create a strong password for your account. Make sure it's something you'll remember.</WelcomeSubtitle>
            </WelcomeSection>

            <form className="reset-password-form" onSubmit={handleSubmit(onSubmit)}>
              <FormField>
                <FieldLabel>New Password</FieldLabel>
                <InputGroup hasError={!!errors.password}>
                  <InputIcon>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </InputIcon>
                  <StyledInput
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    hasError={!!errors.password}
                    {...register("password")}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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
                {errors.password && (
                  <ErrorMessage>{errors.password.message as string}</ErrorMessage>
                )}
                {password && (
                  <PasswordStrength>
                    <StrengthBar>
                      <StrengthFill width={passwordStrength.width} color={passwordStrength.color} />
                    </StrengthBar>
                    <StrengthText color={passwordStrength.color}>
                      Password strength: {passwordStrength.text}
                    </StrengthText>
                  </PasswordStrength>
                )}
              </FormField>

              <FormField>
                <FieldLabel>Confirm New Password</FieldLabel>
                <InputGroup hasError={!!errors.confirmPassword}>
                  <InputIcon>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </InputIcon>
                  <StyledInput
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    hasError={!!errors.confirmPassword}
                    {...register("confirmPassword")}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {errors.confirmPassword && (
                  <ErrorMessage>{errors.confirmPassword.message as string}</ErrorMessage>
                )}
              </FormField>

              <SecurityTips>
                <TipsTitle>Password Security Tips:</TipsTitle>
                <TipsList>
                  <TipItem>Use at least 8 characters</TipItem>
                  <TipItem>Include uppercase and lowercase letters</TipItem>
                  <TipItem>Add numbers and special characters</TipItem>
                  <TipItem>Avoid common words or personal information</TipItem>
                </TipsList>
              </SecurityTips>

              <SubmitButton type="submit" disabled={isLoading}>
                {isLoading ? (
                  <LoadingSpinner>
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                        <animate attributeName="strokeDasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="strokeDashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    <span>Resetting Password...</span>
                  </LoadingSpinner>
                ) : (
                  <>
                    <ButtonIcon>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </ButtonIcon>
                    Reset Password
                  </>
                )}
              </SubmitButton>
            </form>
          </>
        ) : (
          <SuccessSection>
            <SuccessIcon>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </SuccessIcon>
            <SuccessTitle>Password Reset Successfully!</SuccessTitle>
            <SuccessMessage>
              Your password has been updated successfully. You can now sign in to your account with your new password.
            </SuccessMessage>
            
            <SecurityNote>
              <NoteIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </NoteIcon>
              <NoteText>
                For security, you'll need to sign in again with your new password.
              </NoteText>
            </SecurityNote>

            <PrimaryButton onClick={handleGoToLogin}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Continue to Sign In
            </PrimaryButton>
          </SuccessSection>
        )}
      </FormCard>
    </ResetPasswordContainer>
  );
};

// Styled Components optimized for AuthLayout
const ResetPasswordContainer = styled.div`
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const BrandHeader = styled.div`
  text-align: center;
  margin-bottom: 4px;
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ToothIcon = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  svg {
    width: 24px;
    height: 24px;
    color: #ffffff;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
`;

const BrandText = styled.div`
  text-align: center;
`;

const CompanyName = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TagLine = styled.p`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  margin: 2px 0 0 0;
  font-weight: 500;
  letter-spacing: 0.02em;
`;

const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const WelcomeTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
`;

const WelcomeSubtitle = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
`;

const FormField = styled.div`
  margin-bottom: 14px;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  letter-spacing: 0.01em;
`;

const InputGroup = styled.div<{ hasError?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  border: 1.5px solid ${props => props.hasError ? '#ef4444' : '#e2e8f0'};
  border-radius: 10px;
  background: ${props => props.hasError ? '#fef2f2' : '#ffffff'};
  transition: all 0.2s ease;
  overflow: hidden;

  &:focus-within {
    border-color: ${props => props.hasError ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? '#fca5a520' : '#3b82f620'};
    background: #ffffff;
  }

  &:hover:not(:focus-within) {
    border-color: ${props => props.hasError ? '#ef4444' : '#cbd5e1'};
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  z-index: 2;
  
  svg {
    width: 16px;
    height: 16px;
    color: #9ca3af;
  }
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  height: 40px;
  padding: 0 40px 0 36px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #1e293b;
  outline: none;
  font-weight: 500;

  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }

  &:autofill,
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
    -webkit-text-fill-color: #1e293b;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  z-index: 2;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  svg {
    width: 16px;
    height: 16px;
    color: #9ca3af;
  }

  &:hover {
    background: #f1f5f9;
    
    svg {
      color: #64748b;
    }
  }
`;

const ErrorMessage = styled.div`
  font-size: 11px;
  color: #ef4444;
  margin-top: 4px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: "⚠";
    font-size: 9px;
  }
`;

const PasswordStrength = styled.div`
  margin-top: 6px;
`;

const StrengthBar = styled.div`
  height: 2px;
  background: #e2e8f0;
  border-radius: 1px;
  margin-bottom: 3px;
  position: relative;
  overflow: hidden;
`;

const StrengthFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.color};
  border-radius: 1px;
  transition: all 0.3s ease;
`;

const StrengthText = styled.div<{ color: string }>`
  font-size: 10px;
  color: ${props => props.color};
  font-weight: 600;
`;

const SecurityTips = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

const TipsTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
`;

const TipsList = styled.ul`
  margin: 0;
  padding-left: 16px;
  font-size: 10px;
  color: #64748b;
`;

const TipItem = styled.li`
  margin-bottom: 2px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 42px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.25);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px -2px rgba(59, 130, 246, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonIcon = styled.div`
  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const SuccessSection = styled.div`
  text-align: center;
  padding: 8px 0;
`;

const SuccessIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  
  svg {
    width: 28px;
    height: 28px;
    color: #ffffff;
  }
`;

const SuccessTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const SuccessMessage = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0 0 16px 0;
  line-height: 1.4;
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const NoteIcon = styled.div`
  flex-shrink: 0;
  
  svg {
    width: 16px;
    height: 16px;
    color: #3b82f6;
  }
`;

const NoteText = styled.div`
  font-size: 11px;
  color: #1e40af;
  font-weight: 500;
`;

const PrimaryButton = styled.button`
  width: 100%;
  height: 42px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.25);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px -2px rgba(59, 130, 246, 0.3);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export default Form;