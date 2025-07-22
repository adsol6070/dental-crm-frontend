import { Link } from "react-router-dom";
import styled from "styled-components";
import { ROUTES } from "@/config/route-paths.config";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { ForgotPasswordPayload } from "@/api";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
});

const Form = () => {
  const { resendVerification } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<{ email: string }>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: ForgotPasswordPayload) => {
    try {
      setIsLoading(true);
      setUserEmail(data.email);
      const response = await resendVerification(data.email);
      console.log("Response:", response);
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAgain = () => {
    setIsSuccess(false);
  };

  return (
    <ResendVerificationContainer>
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
        {!isSuccess ? (
          <>
            <WelcomeSection>
              <WelcomeTitle>Resend Verification</WelcomeTitle>
              <WelcomeSubtitle>Enter your email address and we'll send you a new verification link to activate your account</WelcomeSubtitle>
            </WelcomeSection>

            <form className="resend-verification-form" onSubmit={handleSubmit(onSubmit)}>
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

              <InfoBox>
                <InfoIcon>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </InfoIcon>
                <InfoText>
                  <strong>Didn't receive the verification email?</strong> Check your spam folder or request a new verification link below.
                </InfoText>
              </InfoBox>

              <SubmitButton type="submit" disabled={isLoading}>
                {isLoading ? (
                  <LoadingSpinner>
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                        <animate attributeName="strokeDasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="strokeDashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    <span>Sending Email...</span>
                  </LoadingSpinner>
                ) : (
                  <>
                    <ButtonIcon>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                    </ButtonIcon>
                    Resend Verification Email
                  </>
                )}
              </SubmitButton>
            </form>

            <LoginLink>
              Already verified? <Link to={ROUTES.AUTH.LOGIN}>Sign in here</Link>
            </LoginLink>
          </>
        ) : (
          <SuccessSection>
            <SuccessIcon>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </SuccessIcon>
            <SuccessTitle>Verification Email Sent!</SuccessTitle>
            <SuccessMessage>
              We've sent a new verification email to <strong>{userEmail}</strong>. Please check your inbox and click the verification link to activate your account.
            </SuccessMessage>
            
            <EmailTips>
              <TipItem>
                <TipIcon>📧</TipIcon>
                <TipText>Check your inbox and spam folder</TipText>
              </TipItem>
              <TipItem>
                <TipIcon>🔗</TipIcon>
                <TipText>Click the verification link in the email</TipText>
              </TipItem>
              <TipItem>
                <TipIcon>⏰</TipIcon>
                <TipText>The verification link expires in 24 hours</TipText>
              </TipItem>
            </EmailTips>

            <SuccessActions>
              <SecondaryButton onClick={handleSendAgain}>
                Send Another Email
              </SecondaryButton>
              <Link to={ROUTES.AUTH.LOGIN}>
                <PrimaryButton>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Sign In
                </PrimaryButton>
              </Link>
            </SuccessActions>
          </SuccessSection>
        )}
      </FormCard>
    </ResendVerificationContainer>
  );
};

// Styled Components optimized for AuthLayout
const ResendVerificationContainer = styled.div`
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
  margin-bottom: 16px;
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
  padding: 0 16px 0 36px;
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

const InfoBox = styled.div`
  display: flex;
  gap: 10px;
  padding: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const InfoIcon = styled.div`
  flex-shrink: 0;
  
  svg {
    width: 16px;
    height: 16px;
    color: #3b82f6;
  }
`;

const InfoText = styled.div`
  font-size: 11px;
  color: #1e40af;
  line-height: 1.4;
  
  strong {
    font-weight: 600;
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

const LoginLink = styled.div`
  text-align: center;
  margin-top: 20px;
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

const SuccessSection = styled.div`
  text-align: center;
  padding: 8px 0;
`;

const SuccessIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #3b82f6;
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
  
  strong {
    color: #1e293b;
    font-weight: 600;
  }
`;

const EmailTips = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

const TipItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TipIcon = styled.span`
  font-size: 12px;
  flex-shrink: 0;
`;

const TipText = styled.span`
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
`;

const SuccessActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  text-decoration: none;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px -2px rgba(59, 130, 246, 0.3);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  height: 42px;
  background: #ffffff;
  color: #374151;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
`;

export default Form;