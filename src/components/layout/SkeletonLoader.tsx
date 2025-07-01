// SkeletonLoader.tsx
import React from "react";
import styled, { keyframes } from "styled-components";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  baseColor?: string;
  highlightColor?: string;
  animationDuration?: number;
}

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const SkeletonWrapper = styled.div<{
  width: number | string;
  height: number | string;
  borderRadius: number;
  baseColor: string;
  highlightColor: string;
  animationDuration: number;
}>`
  width: ${(props) =>
    typeof props.width === "number" ? `${props.width}px` : props.width};
  height: ${(props) =>
    typeof props.height === "number" ? `${props.height}px` : props.height};
  border-radius: ${(props) => props.borderRadius}px;
  background: linear-gradient(
    90deg,
    ${(props) => props.baseColor},
    ${(props) => props.highlightColor},
    ${(props) => props.baseColor}
  );
  background-size: 200% 100%;
  animation: ${shimmer} ${(props) => props.animationDuration}s infinite;
`;

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  baseColor = "#e0e0e0",
  highlightColor = "#f5f5f5",
  animationDuration = 1.5,
}) => {
  return (
    <SkeletonWrapper
      width={width}
      height={height}
      borderRadius={borderRadius}
      baseColor={baseColor}
      highlightColor={highlightColor}
      animationDuration={animationDuration}
    />
  );
};

export default SkeletonLoader;
