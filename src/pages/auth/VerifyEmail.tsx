import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { ROUTES } from "@/config/route-paths.config";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle, XCircle } from "react-feather";

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
  }, [token, navigate]);

  return (
    <Container>
      <Toaster position="top-right" />
      <Card>
        {status === "verifying" && (
          <>
            <Spinner />
            <Text>Verifying your email...</Text>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle size={48} color="#10b981" />
            <Text className="success">
              Email Verified Successfully! Redirecting...
            </Text>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={48} color="#ef4444" />
            <Text className="error">Invalid or Expired Token</Text>
          </>
        )}
      </Card>
    </Container>
  );
};

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Segoe UI", sans-serif;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(14px);
  padding: 48px;
  border-radius: 18px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 300px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 5px solid #14b8a6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 24px;
`;

const Text = styled.p`
  font-size: 18px;
  margin-top: 16px;
  color: #f8fafc;

  &.success {
    color: #10b981;
  }

  &.error {
    color: #ef4444;
  }
`;

export default VerifyEmail;
