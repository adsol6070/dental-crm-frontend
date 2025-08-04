import { Link, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { ROUTES } from "@/config/route-paths.config";
import { useAuth, UserType } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { apiClient } from "@/services/apiClient";

// Password validation schema
const schema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

interface ForcePasswordChangeFormData {
  newPassword: string;
  confirmPassword: string;
}

interface LocationState {
  tempToken?: string;
  userType?: UserType;
  requiresPasswordChange?: boolean;
}

const ForcePasswordChange = () => {
  const { getRedirectPath } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string>("");
  const [userType, setUserType] = useState<UserType>(UserType.PATIENT);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForcePasswordChangeFormData>({
    resolver: yupResolver(schema),
  });

  const newPassword = watch("newPassword");

  useEffect(() => {
    // Get data from location state or URL params
    const state = location.state as {
      tempToken?: string;
      userType?: UserType;
      requiresPasswordChange?: boolean;
    } | null;
    console.log("state", state);
    const urlParams = new URLSearchParams(location.search);

    const token = state?.tempToken || urlParams.get("tempToken");
    const type =
      state?.userType ||
      (urlParams.get("userType") as UserType) ||
      UserType.PATIENT;
    const requiresChange =
      state?.requiresPasswordChange ||
      urlParams.get("requiresPasswordChange") === "true";

    if (!token || !requiresChange) {
      toast.error("Invalid access. Redirecting to login...");
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
      return;
    }

    setTempToken(token);
    setUserType(type);
  }, [location, navigate]);

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: "", color: "#e2e8f0" };

    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;

    const strengthConfig = {
      0: { text: "", color: "#e2e8f0" },
      1: { text: "Very Weak", color: "#ef4444" },
      2: { text: "Weak", color: "#f97316" },
      3: { text: "Fair", color: "#eab308" },
      4: { text: "Good", color: "#22c55e" },
      5: { text: "Strong", color: "#16a34a" },
    };

    return {
      strength,
      ...strengthConfig[strength as keyof typeof strengthConfig],
    };
  };

  const passwordStrength = getPasswordStrength(newPassword || "");

  const getChangePasswordEndpoint = (userType: UserType): string => {
    switch (userType) {
      case UserType.PATIENT:
        return "/api/patients/change-password";
      case UserType.DOCTOR:
        return "/api/doctors/change-password";
      case UserType.ADMIN:
        return "/api/users/force-password-change";
      default:
        throw new Error(`Invalid user type: ${userType}`);
    }
  };

  const getUserTypeDisplayName = (userType: UserType): string => {
    switch (userType) {
      case UserType.PATIENT:
        return "Patient";
      case UserType.DOCTOR:
        return "Doctor";
      case UserType.ADMIN:
        return "Admin";
      default:
        return "User";
    }
  };

  const onSubmit = async (data: ForcePasswordChangeFormData) => {
    if (!tempToken) {
      toast.error("Session expired. Please login again.");
      navigate(ROUTES.AUTH.LOGIN);
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = getChangePasswordEndpoint(userType);

      await apiClient.post(endpoint, {
        tempToken,
        newPassword: data.newPassword,
      });

      toast.success(
        "Password changed successfully! Please login with your new password."
      );

      navigate(ROUTES.AUTH.LOGIN, {
        replace: true,
        state: {
          message:
            "Password changed successfully. Please login with your new password.",
          userType: userType,
        },
      });
    } catch (error: any) {
      console.error("Password change error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to change password. Please try again.";

      toast.error(errorMessage);

      // If token expired, redirect to login
      if (error.response?.status === 401 || errorMessage.includes("expired")) {
        navigate(ROUTES.AUTH.LOGIN, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTypeIcon = (userType: UserType) => {
    switch (userType) {
      case UserType.PATIENT:
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        );
      case UserType.DOCTOR:
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case UserType.ADMIN:
        return (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <PasswordChangeContainer>
      <Toaster position="top-right" />

      <BrandHeader>
        <LogoContainer>
          <ToothIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2C8.13 2 5 5.13 5 9c0 2.74 1.56 5.12 3.85 6.32C9.44 16.24 10.67 17 12 17s2.56-.76 3.15-1.68C17.44 14.12 19 11.74 19 9c0-3.87-3.13-7-7-7z"
              />
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
          <SecurityIcon>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </SecurityIcon>
          <WelcomeTitle>Password Change Required</WelcomeTitle>
          <WelcomeSubtitle>
            For your security, you must change your temporary password before
            accessing your {getUserTypeDisplayName(userType).toLowerCase()}{" "}
            dashboard.
          </WelcomeSubtitle>
          <UserTypeBadge>
            <UserTypeIconContainer>
              {getUserTypeIcon(userType)}
            </UserTypeIconContainer>
            <span>{getUserTypeDisplayName(userType)} Account</span>
          </UserTypeBadge>
        </WelcomeSection>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField>
            <FieldLabel>New Password</FieldLabel>
            <PasswordRequirements>
              Your password must be at least 8 characters and include uppercase,
              lowercase, number, and special character.
            </PasswordRequirements>
            <InputGroup hasError={!!errors.newPassword}>
              <InputIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </InputIcon>
              <StyledInput
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                hasError={!!errors.newPassword}
                {...register("newPassword")}
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

            {newPassword && (
              <PasswordStrengthContainer>
                <PasswordStrengthBar>
                  <PasswordStrengthFill
                    strength={passwordStrength.strength}
                    color={passwordStrength.color}
                  />
                </PasswordStrengthBar>
                <PasswordStrengthText color={passwordStrength.color}>
                  {passwordStrength.text}
                </PasswordStrengthText>
              </PasswordStrengthContainer>
            )}

            {errors.newPassword && (
              <ErrorMessage>
                {errors.newPassword.message as string}
              </ErrorMessage>
            )}
          </FormField>

          <FormField>
            <FieldLabel>Confirm New Password</FieldLabel>
            <InputGroup hasError={!!errors.confirmPassword}>
              <InputIcon>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
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
              <ErrorMessage>
                {errors.confirmPassword.message as string}
              </ErrorMessage>
            )}
          </FormField>

          <SecurityNotice>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            After changing your password, you'll be redirected to the login page
            to sign in with your new credentials.
          </SecurityNotice>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner>
                <svg viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="31.416"
                    strokeDashoffset="31.416"
                  >
                    <animate
                      attributeName="strokeDasharray"
                      dur="2s"
                      values="0 31.416;15.708 15.708;0 31.416"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="strokeDashoffset"
                      dur="2s"
                      values="0;-15.708;-31.416"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
                <span>Updating Password...</span>
              </LoadingSpinner>
            ) : (
              <>
                <ButtonIcon>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </ButtonIcon>
                Change Password
              </>
            )}
          </SubmitButton>
        </form>

        <BackToLoginLink>
          <Link to={ROUTES.AUTH.LOGIN}>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Login
          </Link>
        </BackToLoginLink>
      </FormCard>
    </PasswordChangeContainer>
  );
};

// Styled Components (reusing and extending from login page)
const PasswordChangeContainer = styled.div`
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const SecurityIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px auto;
  box-shadow: 0 8px 16px -4px rgba(245, 158, 11, 0.3);

  svg {
    width: 24px;
    height: 24px;
    color: #ffffff;
  }
`;

const WelcomeTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  letter-spacing: -0.01em;
`;

const WelcomeSubtitle = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0 0 12px 0;
  font-weight: 500;
  line-height: 1.5;
`;

const UserTypeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid #bfdbfe;
`;

const UserTypeIconContainer = styled.div`
  svg {
    width: 14px;
    height: 14px;
  }
`;

const FormField = styled.div`
  margin-bottom: 16px;
`;

const FieldLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  letter-spacing: 0.01em;
`;

const PasswordRequirements = styled.p`
  font-size: 10px;
  color: #64748b;
  margin: 0 0 6px 0;
  font-weight: 500;
  line-height: 1.4;
`;

const InputGroup = styled.div<{ hasError?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  border: 1.5px solid ${(props) => (props.hasError ? "#ef4444" : "#e2e8f0")};
  border-radius: 10px;
  background: ${(props) => (props.hasError ? "#fef2f2" : "#ffffff")};
  transition: all 0.2s ease;
  overflow: hidden;

  &:focus-within {
    border-color: ${(props) => (props.hasError ? "#ef4444" : "#3b82f6")};
    box-shadow: 0 0 0 3px
      ${(props) => (props.hasError ? "#fca5a520" : "#3b82f620")};
    background: #ffffff;
  }

  &:hover:not(:focus-within) {
    border-color: ${(props) => (props.hasError ? "#ef4444" : "#cbd5e1")};
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

const PasswordStrengthContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
`;

const PasswordStrengthBar = styled.div`
  flex: 1;
  height: 3px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
`;

const PasswordStrengthFill = styled.div<{ strength: number; color: string }>`
  height: 100%;
  width: ${(props) => (props.strength / 5) * 100}%;
  background: ${(props) => props.color};
  transition: all 0.3s ease;
`;

const PasswordStrengthText = styled.span<{ color: string }>`
  font-size: 10px;
  font-weight: 600;
  color: ${(props) => props.color};
  min-width: 60px;
  text-align: right;
`;

const SecurityNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 11px;
  color: #92400e;
  font-weight: 500;
  line-height: 1.4;

  svg {
    width: 16px;
    height: 16px;
    color: #f59e0b;
    flex-shrink: 0;
    margin-top: 1px;
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

const SubmitButton = styled.button`
  width: 100%;
  height: 42px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.25);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px -2px rgba(245, 158, 11, 0.3);
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
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const BackToLoginLink = styled.div`
  text-align: center;
  margin-top: 16px;

  a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #64748b;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      color: #3b82f6;
    }
  }
`;

export default ForcePasswordChange;
