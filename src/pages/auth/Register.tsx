// @ts-nocheck
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ROUTES } from "@/config/route-paths.config";
import { useAuth, UserType } from "@/context/AuthContext";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { RegisterPayload } from "@/api";

const schema = yup.object().shape({
  name: yup.string().required("Username is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
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
  const { register: authRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data: RegisterPayload) => {
    if (!acceptTerms) {
      return;
    }
    
    try {
      setIsLoading(true);
      const { confirmPassword, ...finalData } = data;
      await authRegister(finalData, UserType);
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    } catch (err) {
      console.error("Internal error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
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
            <CompanyName>DentalCare Pro</CompanyName>
            <TagLine>Management System</TagLine>
          </BrandText>
        </LogoContainer>
      </BrandHeader>

      <FormCard>
        <WelcomeSection>
          <WelcomeTitle>Create Your Account</WelcomeTitle>
          <WelcomeSubtitle>Register your account in the dashboard</WelcomeSubtitle>
        </WelcomeSection>

        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          <FormField>
            <FieldLabel>Full Name</FieldLabel>
            <InputGroup hasError={!!errors.name}>
              <InputIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </InputIcon>
              <StyledInput
                type="text"
                placeholder="Enter your full name"
                hasError={!!errors.name}
                {...register("name")}
              />
            </InputGroup>
            {errors.name && (
              <ErrorMessage>{errors.name.message as string}</ErrorMessage>
            )}
          </FormField>

          <FormField>
            <FieldLabel>Email Address</FieldLabel>
            <InputGroup hasError={!!errors.email}>
              <InputIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </InputIcon>
              <StyledInput
                type="email"
                placeholder="Enter your email address"
                hasError={!!errors.email}
                {...register("email")}
              />
            </InputGroup>
            {errors.email && (
              <ErrorMessage>{errors.email.message as string}</ErrorMessage>
            )}
          </FormField>

          <FormField>
            <FieldLabel>Password</FieldLabel>
            <InputGroup hasError={!!errors.password}>
              <InputIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </InputIcon>
              <StyledInput
                type={showPassword ? "text" : "password"}
                placeholder="Create a secure password"
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
            <PasswordStrength>
              <StrengthIndicator />
              <StrengthText>Use 6+ characters with a mix of letters, numbers & symbols</StrengthText>
            </PasswordStrength>
          </FormField>

          <FormField>
            <FieldLabel>Confirm Password</FieldLabel>
            <InputGroup hasError={!!errors.confirmPassword}>
              <InputIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </InputIcon>
              <StyledInput
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
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

          <TermsSection>
            <TermsCheckbox>
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <label htmlFor="terms">
                I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
              </label>
            </TermsCheckbox>
          </TermsSection>

          <SubmitButton type="submit" disabled={isLoading || !acceptTerms}>
            {isLoading ? (
              <LoadingSpinner>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                    <animate attributeName="strokeDasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                    <animate attributeName="strokeDashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                  </circle>
                </svg>
                <span>Creating Account...</span>
              </LoadingSpinner>
            ) : (
              <>
                <ButtonIcon>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </ButtonIcon>
                Create Practice Account
              </>
            )}
          </SubmitButton>
        </form>
        <LoginLink>
          Already have an account? <Link to={ROUTES.AUTH.LOGIN}>Sign in here</Link>
        </LoginLink>
      </FormCard>
    </RegisterContainer>
  );
};

// Styled Components optimized for AuthLayout
const RegisterContainer = styled.div`
  width: 100%;
  max-width: 440px;
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
  line-height: 1.3;
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

const StrengthIndicator = styled.div`
  height: 2px;
  background: #e2e8f0;
  border-radius: 1px;
  margin-bottom: 3px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 30%;
    background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981);
    border-radius: 1px;
    transition: width 0.3s ease;
  }
`;

const StrengthText = styled.div`
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
`;

const TermsSection = styled.div`
  margin: 16px 0 12px 0;
`;

const TermsCheckbox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;

  input[type="checkbox"] {
    width: 14px;
    height: 14px;
    accent-color: #3b82f6;
    cursor: pointer;
    margin-top: 1px;
  }

  label {
    font-size: 11px;
    color: #64748b;
    font-weight: 500;
    cursor: pointer;
    line-height: 1.3;

    a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 600;

      &:hover {
        text-decoration: underline;
      }
    }
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
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background: #9ca3af;
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

const LoginLink = styled.div`
  text-align: center;
  margin-top: 14px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;

  a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default Form;