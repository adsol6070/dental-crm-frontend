import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { theme } from "@/config/theme.config";
import { sidebarMenuItems } from "@/config/sidebar.config";

const SidebarComponent = ({ isCollapsed, isToggled, setIsToggled }: any) => {
  return (
    <Sidebar
      breakPoint="md"
      backgroundColor={theme.colors.sidebarBackground}
      width={theme.layout.sidebarWidth}
      style={{ border: 0 }}
      transitionDuration={0} // Remove animation
      collapsed={isCollapsed}
      toggled={isToggled}
      onBackdropClick={() => setIsToggled((prev: boolean) => !prev)}
    >
      <LogoContainer $isCollapsed={isCollapsed}>
        {isCollapsed ? (
          <LogoTitle $collapsed>DM</LogoTitle>
        ) : (
          <LogoTitle>DentalCare Pro</LogoTitle>
        )}
      </LogoContainer>

      <Menu
        closeOnClick={false} // Prevent menu from closing on click
        menuItemStyles={{
          button: {
            padding: `${theme.spacing.xs} ${theme.spacing.md}`,
            margin: `2px ${theme.spacing.sm}`,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.sm,
            color: theme.colors.sidebarText,
            fontWeight: theme.typography.fontWeight.medium,
            transition: "background-color 0.15s ease", // Only animate background
            ":hover": {
              background: theme.colors.sidebarHover,
              color: theme.colors.white,
            },
            ":active": {
              background: theme.colors.sidebarActive,
              color: theme.colors.white,
            },
          },
          subMenuContent: {
            backgroundColor: theme.colors.sidebarSubmenu,
            margin: `0 ${theme.spacing.sm}`,
            borderRadius: theme.borderRadius.md,
            overflow: "hidden",
            transition: "none", // Remove submenu animation
          },
          icon: {
            marginRight: theme.spacing.sm,
          },
        }}
      >
        {sidebarMenuItems.map((menu: any) =>
          menu.subMenu ? (
            <SubMenu key={menu.label} label={menu.label} icon={menu.icon}>
              {menu.subMenu.map((subItem: any) => (
                <MenuItem
                  key={subItem.label}
                  icon={subItem.icon}
                  component={<Link to={subItem.path} />}
                >
                  {subItem.label}
                </MenuItem>
              ))}
            </SubMenu>
          ) : (
            <MenuItem
              key={menu.label}
              icon={menu.icon}
              component={<Link to={menu.path} />}
            >
              {menu.label}
            </MenuItem>
          )
        )}
      </Menu>
    </Sidebar>
  );
};

const LogoContainer = styled.div<{ $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.sidebarBorder};
  margin-bottom: ${theme.spacing.sm};
  height: ${theme.layout.navbarHeight};
  box-sizing: border-box;
`;

const LogoTitle = styled.h1<{ $collapsed?: boolean }>`
  color: ${theme.colors.white};
  font-size: ${props => props.$collapsed ? theme.typography.lg : theme.typography.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0;
  text-align: center;
  letter-spacing: ${props => props.$collapsed ? '1px' : '0.5px'};
  font-family: ${theme.fonts.semibold.fontFamily};
`;

export default SidebarComponent;
