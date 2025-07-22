import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const ModalWrapper = styled.div`
  background: #fff;
  width: 500px;
  max-width: 90%;
  margin: 10vh auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  background-color: #6366f1;
  color: white;
  padding: 20px;
  font-size: 20px;
  font-weight: 600;
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const QRImage = styled.img`
  display: block;
  margin: 0 auto 16px;
  width: 180px;
  height: 180px;
`;

const Label = styled.div`
  font-weight: 500;
  margin-bottom: 6px;
  color: #1f2937;
`;

const ManualKey = styled.div`
  background-color: #f3f4f6;
  padding: 12px;
  font-family: monospace;
  text-align: center;
  border-radius: 6px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  margin-bottom: 20px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

interface ButtonProps {
  variant?: 'cancel' | 'default';
}

const Button = styled.button<ButtonProps>`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;

  ${(props) =>
    props.variant === 'cancel'
      ? `
    background: #f3f4f6;
    color: #374151;
  `
      : `
    background: #6366f1;
    color: white;
  `}
`;

const TwoFAModal = ({ data, onClose, onSubmit, otp, setOtp }: any) => {
  const { qrCode, manualEntryKey } = data || {};

  return (
    <Overlay>
      <ModalWrapper>
        <ModalHeader>Enable Two-Factor Authentication</ModalHeader>
        <ModalContent>
          <Label>Scan this QR code in Google Authenticator</Label>
          <QRImage src={qrCode} alt="2FA QR Code" />

          <Label>Or enter this key manually</Label>
          <ManualKey>{manualEntryKey}</ManualKey>

          <Label>Enter 6-digit code from app</Label>
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />

          <ButtonRow>
            <Button variant="cancel" onClick={onClose}>Cancel</Button>
            <Button onClick={onSubmit}>Verify</Button>
          </ButtonRow>
        </ModalContent>
      </ModalWrapper>
    </Overlay>
  );
};

export default TwoFAModal;
