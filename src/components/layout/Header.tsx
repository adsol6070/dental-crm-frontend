import { useEffect, useRef, useState } from "react";
import { FiUser, FiMenu, FiChevronDown } from "react-icons/fi";
import styled from "styled-components";
import { theme } from "@/config/theme.config";
import { useAuth } from "@/context/AuthContext";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/route-paths.config";
import { useMe } from "@/hooks/useUser";
import { resolveRoute } from "@/utils/resolveRoute";

const Header = ({ onToggleSidebar }: any) => {
  const { logout } = useAuth();
  const { data: user } = useMe();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setUserData({
        name: capitalizeFirstLetter(user.name ?? "John"),
        email: user.email || "johndoe@gmail.com",
      });
    }
  }, [user]);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <HeaderContainer>
      <LeftSection>
        <HamburgerButton onClick={onToggleSidebar}>
          <FiMenu size={18} />
        </HamburgerButton>
      </LeftSection>

      <RightSection>
        <ProfileContainer ref={dropdownRef}>
          <ProfileButton onClick={handleDropdownToggle}>
            <UserInfo>
              <UserName>{userData.name}</UserName>
              <UserEmail>{userData.email}</UserEmail>
            </UserInfo>
            <Avatar>
              <FiUser size={16} />
            </Avatar>
            <ChevronIcon $isOpen={isDropdownOpen}>
              <FiChevronDown size={14} />
            </ChevronIcon>
          </ProfileButton>

          {isDropdownOpen && (
            <DropdownMenu>
              <DropdownItem
                onClick={() => {
                  navigate(resolveRoute(ROUTES.PRIVATE.PROFILE));
                  setIsDropdownOpen(false);
                }}
              >
                View Profile
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={logout}>
                Sign Out
              </DropdownItem>
            </DropdownMenu>
          )}
        </ProfileContainer>
      </RightSection>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${theme.spacing.lg};
  height: ${theme.layout.navbarHeight};
  background-color: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  backdrop-filter: blur(8px);
  
  @media (max-width: 768px) {
    padding: 0 ${theme.spacing.md};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const HamburgerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${theme.colors.hover};
    color: ${theme.colors.textPrimary};
  }
`;

const ProfileContainer = styled.div`
  position: relative;
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: none;
  border: none;
  cursor: pointer;
  border-radius: ${theme.borderRadius.md};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${theme.colors.hover};
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  
  @media (max-width: 640px) {
    display: none;
  }
`;

const UserName = styled.span`
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  line-height: 1.2;
`;

const UserEmail = styled.span`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.xs};
  line-height: 1.2;
`;

const Avatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.sm};
`;

const ChevronIcon = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  color: ${theme.colors.textSecondary};
  transition: transform 0.2s ease;
  transform: rotate(${props => props.$isOpen ? '180deg' : '0deg'});
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  display: block;
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  color: ${theme.colors.textPrimary};
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: ${theme.typography.sm};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${theme.colors.hover};
  }

  &:last-child {
    color: ${theme.colors.destructive};
    
    &:hover {
      background-color: ${theme.colors.destructiveHover};
    }
  }
`;

const DropdownDivider = styled.hr`
  margin: 0;
  border: none;
  border-top: 1px solid ${theme.colors.border};
`;

export default Header;