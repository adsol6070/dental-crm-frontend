import styled, { keyframes } from "styled-components";

interface StarProps {
  left: string;
  top: string;
}

const tail = keyframes`
  0% { height: 0; }
  30% { height: 300px; }
  100% { height: 0; }
`;

const shining = keyframes`
  0% { height: 0; }
  50% { height: 0px; }
  100% { height: 0; }
`;

const shooting = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(100vh); }
`;

const NightSky = styled.div`
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
`;

const ShootingStar = styled.div<StarProps>`
  position: absolute;
  left: ${({ left }) => left};
  top: ${({ top }) => top};
  width: 2px;
  background: linear-gradient(
    180deg,
    rgba(95, 145, 255, 1),
    rgba(0, 0, 255, 0)
  );
  border-radius: 999px;
  filter: drop-shadow(0 0 6px rgba(105, 155, 255, 1));
  animation: ${tail} 5000ms linear infinite, ${shooting} 5000ms linear infinite;

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: calc(50% - 1px);
    bottom: 0;
    width: 2px;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 255, 0),
      rgba(95, 145, 255, 1),
      rgba(0, 0, 255, 0)
    );
    transform: translateY(50%) rotateZ(45deg);
    border-radius: 100%;
    animation: ${shining} 5000ms linear infinite;
  }
`;

const ShootingStarsBackground = () => {
  const stars = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}vw`,
    top: `${Math.random() * -100}vh`,
  }));

  return (
    <NightSky>
      {stars.map(({ id, left, top }) => (
        <ShootingStar key={id} left={left} top={top} />
      ))}
    </NightSky>
  );
};

export default ShootingStarsBackground;
