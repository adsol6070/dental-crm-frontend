import { useEffect, useState } from "react";
import { FaUserEdit } from "react-icons/fa";
import { FaRightFromBracket } from "react-icons/fa6";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import { theme } from "@/config/theme.config";
import { useMe, useUpdateUser } from "@/hooks/useUser";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { useAuth } from "@/context/AuthContext";
import { formatTimestamp } from "@/utils/formatTimestamp";
import { Toaster } from "react-hot-toast";

const Profile = () => {
  const { logout } = useAuth();
  const { data: user } = useMe();
  const [editing, setEditing] = useState(false);
  const { mutate: updateUser, isPending } = useUpdateUser();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    profileCreated: "",
  });

  useEffect(() => {
    if (user) {
      setUserData({
        name: capitalizeFirstLetter(user.name ?? "John"),
        email: user.email || "johndoe@gmail.com",
        profileCreated: user.createdAt,
      });
    }
  }, [user]);

  console.log("user ", user);
  const handleEdit = () => {
    if (editing) {
      updateUser(
        { id: String(user?._id), userData: { name: userData.name } },
        {
          onSuccess: () => {
            setEditing(false);
          },
        }
      );
    } else {
      setEditing(true);
    }
  };

  if (!user) {
    return (
      <Centered>
        <p>User data not found</p>
      </Centered>
    );
  }

  return (
    <Background>
      <Toaster position="top-right" />
      <Card>
        <AvatarRing>
          <AvatarText>{user.name.charAt(0).toUpperCase()}</AvatarText>
        </AvatarRing>
        <UserName>{userData.name}</UserName>
        {/* <UserEmail>{userData.email}</UserEmail> */}

        <Field>
          <label>Name</label>
          {editing ? (
            <input
              value={userData.name}
              onChange={(e) =>
                setUserData({ ...userData, name: e.target.value })
              }
            />
          ) : (
            <span>{userData.name}</span>
          )}
        </Field>

        <Field>
          <label>Email</label>
          <span>{userData.email}</span>
        </Field>

        <Field>
          <label>Profile Created</label>
          <span>{formatTimestamp(userData.profileCreated)}</span>
        </Field>

        <ButtonGroup>
          <StyledButton
            onClick={handleEdit}
            disabled={isPending}
            variant="outline-primary"
          >
            <FaUserEdit /> {editing ? "Save" : "Edit Profile"}
          </StyledButton>
          <StyledButton onClick={logout} variant="outline-danger">
            <FaRightFromBracket /> Logout
          </StyledButton>
        </ButtonGroup>
      </Card>
    </Background>
  );
};

export default Profile;

// Styling below
const Background = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Centered = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  text-align: center;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease-in-out;
`;

const AvatarRing = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 15px auto;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary},
    ${theme.colors.secondary}
  );
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarText = styled.div`
  background: ${theme.colors.white};
  width: 90px;
  height: 90px;
  border-radius: 50%;
  font-size: 36px;
  color: ${theme.colors.primary};
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserName = styled.h2`
  font-size: 24px;
  margin-bottom: 5px;
`;

// const UserEmail = styled.p`
//   color: ${theme.colors.textSecondary};
//   margin-bottom: 20px;
// `;

const Field = styled.div`
  text-align: left;
  margin-bottom: 20px;

  label {
    font-weight: 600;
    display: block;
    color: ${theme.colors.primaryDark};
    margin-bottom: 5px;
  }

  span {
    display: block;
    color: ${theme.colors.textPrimary};
  }

  input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid ${theme.colors.lightGray};
    border-radius: 6px;
    outline: none;
    font-size: 16px;
    transition: all 0.3s ease;
    &:focus {
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 25px;
`;

const StyledButton = styled(Button)`
  flex: 1;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;
