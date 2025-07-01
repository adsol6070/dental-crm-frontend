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
  const { resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data: {
    password: string;
    confirmPassword: string;
  }) => {
    if (!token) return;
    try {
      const { confirmPassword, ...finalData } = data;
      await resetPassword({ ...finalData, token });
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    } catch (err) {
      console.error("Internal error occurred. Please try again.");
    }
  };

  return (
    <StyledWrapper>
      <Toaster position="top-right" />
      <div>
        <form className="modern-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-title">Reset Password</div>
          <div className="form-body">
            <div className="field-full-wrapper">
              <div className="input-wrapper">
                <svg fill="none" viewBox="0 0 24 24" className="input-icon">
                  <path
                    strokeWidth="1.5"
                    stroke="currentColor"
                    d="M12 10V14M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6Z"
                  />
                </svg>
                <input
                  placeholder="New Password"
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <svg fill="none" viewBox="0 0 24 24" className="eye-icon">
                    {showPassword ? (
                      <path
                        strokeWidth="1.5"
                        stroke="currentColor"
                        d="M12 5C5 5 2 12 2 12C2 12 5 19 12 19C19 19 22 12 22 12C22 12 19 5 12 5Z M12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15Z"
                      />
                    ) : (
                      <>
                        <path
                          strokeWidth="1.5"
                          stroke="currentColor"
                          d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                        />
                        <circle
                          strokeWidth="1.5"
                          stroke="currentColor"
                          r={3}
                          cy={12}
                          cx={12}
                        />
                        <line
                          strokeWidth="1.5"
                          stroke="currentColor"
                          x1="3"
                          y1="3"
                          x2="21"
                          y2="21"
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && (
                <small className="text-danger">
                  {errors.password.message as string}
                </small>
              )}
            </div>
            <div className="field-full-wrapper">
              <div className="input-wrapper">
                <svg fill="none" viewBox="0 0 24 24" className="input-icon">
                  <path
                    strokeWidth="1.5"
                    stroke="currentColor"
                    d="M12 10V14M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6Z"
                  />
                </svg>
                <input
                  placeholder="Confirm New Password"
                  className="form-input"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  <svg fill="none" viewBox="0 0 24 24" className="eye-icon">
                    {showConfirmPassword ? (
                      <path
                        strokeWidth="1.5"
                        stroke="currentColor"
                        d="M12 5C5 5 2 12 2 12C2 12 5 19 12 19C19 19 22 12 22 12C22 12 19 5 12 5Z M12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15Z"
                      />
                    ) : (
                      <>
                        <path
                          strokeWidth="1.5"
                          stroke="currentColor"
                          d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                        />
                        <circle
                          strokeWidth="1.5"
                          stroke="currentColor"
                          r={3}
                          cy={12}
                          cx={12}
                        />
                        <line
                          strokeWidth="1.5"
                          stroke="currentColor"
                          x1="3"
                          y1="3"
                          x2="21"
                          y2="21"
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {errors.confirmPassword && (
                <small className="text-danger">
                  {errors.confirmPassword.message as string}
                </small>
              )}
            </div>
          </div>
          <button className="submit-button" type="submit">
            <span className="button-text">Reset Password</span>
            <div className="button-glow" />
          </button>
        </form>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .modern-form {
    --primary: #3b82f6;
    --primary-dark: #2563eb;
    --primary-light: rgba(59, 130, 246, 0.1);
    --success: #10b981;
    --text-main: #1e293b;
    --text-secondary: #64748b;
    --bg-input: #f8fafc;

    position: relative;
    width: 300px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.05),
      inset 0 0 0 1px rgba(148, 163, 184, 0.1);
    font-family: system-ui, -apple-system, sans-serif;
  }

  .form-title {
    font-size: 22px;
    font-weight: 600;
    // color: var(--text-main);
    color: #ffffff;
    margin: 0 0 24px;
    text-align: center;
    letter-spacing: -0.01em;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  .field-full-wrapper {
    margin-bottom: 16px;
  }

  .form-input {
    width: 100%;
    height: 40px;
    padding: 0 36px;
    font-size: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: var(--bg-input);
    color: var(--text-main);
    transition: all 0.2s ease;
  }

  .form-input::placeholder {
    color: var(--text-secondary);
  }

  .input-icon {
    position: absolute;
    left: 12px;
    width: 16px;
    height: 16px;
    color: var(--text-secondary);
    pointer-events: none;
  }

  .password-toggle {
    position: absolute;
    right: 12px;
    display: flex;
    align-items: center;
    padding: 4px;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .eye-icon {
    width: 16px;
    height: 16px;
  }

  .submit-button {
    position: relative;
    width: 100%;
    height: 40px;
    margin-top: 8px;
    // background: var(--primary);
    background: #14b8a6;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .button-glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(20, 184, 166, 0.5),
      /* Soft teal-cyan glow */ rgba(20, 184, 166, 0.8),
      /* Brighter glow at center */ rgba(20, 184, 166, 0.5),
      transparent
    );
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }

  /* Hover & Focus States */
  .form-input:hover {
    border-color: #cbd5e1;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 4px var(--primary-light);
  }

  .password-toggle:hover {
    color: var(--primary);
    transform: scale(1.1);
  }

  .submit-button:hover {
    background: #0d9488;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25),
      0 2px 4px rgba(59, 130, 246, 0.15);
  }

  .submit-button:hover .button-glow {
    transform: translateX(100%);
  }

  /* Active States */
  .submit-button:active {
    transform: translateY(0);
    box-shadow: none;
  }

  .password-toggle:active {
    transform: scale(0.9);
  }

  /* Validation States */
  .form-input:not(:placeholder-shown):valid {
    border-color: var(--success);
  }

  .form-input:not(:placeholder-shown):valid ~ .input-icon {
    color: var(--success);
  }

  /* Animation */
  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-4px);
    }
    75% {
      transform: translateX(4px);
    }
  }

  .form-input:not(:placeholder-shown):invalid {
    border-color: #ef4444;
    animation: shake 0.2s ease-in-out;
  }

  .form-input:not(:placeholder-shown):invalid ~ .input-icon {
    color: #ef4444;
  }
`;

export default Form;
