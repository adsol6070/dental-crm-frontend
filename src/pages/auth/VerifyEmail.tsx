// @ts-nocheck
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { ROUTES } from "@/config/route-paths.config";
import { useAuth } from "@/context/AuthContext";

const VerifyEmail = () => {
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const navigate = useNavigate();
  const { token } = useParams();
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const handleVerifyEmail = async () => {
      if (!token) {
        setStatus("error");
        toast.error("Invalid or missing token.");
        return;
      }

      setStatus("verifying");

      try {
        await verifyEmail(token);
        setStatus("success");
        setTimeout(() => navigate(ROUTES.AUTH.LOGIN), 2500);
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    handleVerifyEmail();
  }, [token, navigate, verifyEmail]);

  const handleGoToLogin = () => {
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  const handleResendVerification = () => {
    // You'll need to implement this in your auth context
    toast.success("Verification email sent! Please check your inbox.");
  };

  return (
    <VerifyEmailContainer>
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
            <TagLine>Management System</TagLine>
          </BrandText>
        </LogoContainer>
      </BrandHeader>

      <FormCard>
        {status === "verifying" && (
          <VerifyingSection>
            <LoadingIcon>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                  <animate attributeName="strokeDasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="strokeDashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
            </LoadingIcon>
            <VerifyingTitle>Verifying Your Email</VerifyingTitle>
            <VerifyingMessage>
              Please wait while we verify your email address. This should only take a moment.
            </VerifyingMessage>
            
            <ProcessSteps>
              <StepItem active>
                <StepIcon>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </StepIcon>
                <StepText>Validating token</StepText>
              </StepItem>
              <StepItem active>
                <StepIcon>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </StepIcon>
                <StepText>Verifying email</StepText>
              </StepItem>
            </ProcessSteps>
          </VerifyingSection>
        )}

        {status === "success" && (
          <SuccessSection>
            <SuccessIcon>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </SuccessIcon>
            <SuccessTitle>Email Verified Successfully!</SuccessTitle>
            <SuccessMessage>
              Great! Your email address has been verified. You can now access all features of your Sujan Dental account.
            </SuccessMessage>
            
            <SecurityNote>
              <NoteIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </NoteIcon>
              <NoteText>
                Redirecting you to the login page in a few seconds...
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

        {status === "error" && (
          <ErrorSection>
            <ErrorIcon>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </ErrorIcon>
            <ErrorTitle>Verification Failed</ErrorTitle>
            <ErrorMessage>
              The verification link is invalid or has expired. This could happen if the link is older than 24 hours or has already been used.
            </ErrorMessage>
            
            <ErrorNote>
              <NoteIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </NoteIcon>
              <NoteText>
                Don't worry! You can request a new verification email below.
              </NoteText>
            </ErrorNote>

            <ButtonGroup>
              <SecondaryButton onClick={handleResendVerification}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Resend Verification Email
              </SecondaryButton>
              <PrimaryButton onClick={handleGoToLogin}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back to Sign In
              </PrimaryButton>
            </ButtonGroup>
          </ErrorSection>
        )}
      </FormCard>
    </VerifyEmailContainer>
  );
};

// Styled Components matching the reset password design
const VerifyEmailContainer = styled.div`
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

// Verifying Section
const VerifyingSection = styled.div`
  text-align: center;
  padding: 8px 0;
`;

const LoadingIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #3b82f6;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const VerifyingTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
`;

const VerifyingMessage = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0 0 20px 0;
  font-weight: 500;
  line-height: 1.4;
`;

const ProcessSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const StepItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: ${props => props.active ? '#eff6ff' : '#f8fafc'};
  border: 1px solid ${props => props.active ? '#bfdbfe' : '#e2e8f0'};
`;

const StepIcon = styled.div`
  width: 20px;
  height: 20px;
  color: #3b82f6;
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const StepText = styled.div`
  font-size: 12px;
  color: #374151;
  font-weight: 500;
`;

// Success Section
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

// Error Section
const ErrorSection = styled.div`
  text-align: center;
  padding: 8px 0;
`;

const ErrorIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #ef4444;
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

const ErrorTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0 0 16px 0;
  line-height: 1.4;
`;

// Shared Components
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

const ErrorNote = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export default VerifyEmail;