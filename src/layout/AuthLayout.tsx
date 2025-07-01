import { Outlet } from "react-router-dom";
import styled from "styled-components";

const AuthContainer = styled.main`
  position: relative;
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  z-index: 1;
`;

const AuthLayout = () => {
  return (
    <>
      <AuthContainer>
        <Outlet />
      </AuthContainer>
    </>
  );
};

export default AuthLayout;
