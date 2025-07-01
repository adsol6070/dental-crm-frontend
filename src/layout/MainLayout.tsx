import { Suspense, useEffect, useState } from "react";
import styled from "styled-components";
import { Header } from "@/components";
import SidebarComponent from "@/components/layout/Sidebar";
import { Outlet } from "react-router-dom";
import { theme } from "@/config/theme.config";
import Spinner from "@/components/layout/Spinner";

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isToggled, setIsToggled] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsToggled(false); // Close mobile sidebar when switching to desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsToggled(prev => !prev);
    } else {
      setIsCollapsed(prev => !prev);
    }
  };

  return (
    <MainContainer>
      <SidebarComponent
        isMobile={isMobile}
        isCollapsed={isCollapsed}
        isToggled={isToggled}
        setIsToggled={setIsToggled}
      />
      <LayoutBody>
        <Header onToggleSidebar={toggleSidebar} />
        <ContentWrapper>
          <Suspense fallback={
            <LoadingContainer>
              <Spinner size={32} color={theme.colors.primary} thickness={3} />
            </LoadingContainer>
          }>
            <Outlet />
          </Suspense>
        </ContentWrapper>
      </LayoutBody>
    </MainContainer>
  );
};

const MainContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${theme.colors.background};
`;

const LayoutBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: ${theme.spacing.lg};
  overflow-y: auto;
  background-color: ${theme.colors.background};
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.md};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
`;

export default MainLayout;