import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
  testID?: string;
}

export default function SuperLikeIcon({
  size = 26,
  color = "#FFFFFF",
  strokeWidth = 1.8,
  testID,
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      testID={testID}
    >
      <Path
        d="M32 52 C 20 42, 8 34, 8 22 C 8 14, 14 9, 20 9 C 25 9, 29 12, 32 17 C 35 12, 39 9, 44 9 C 50 9, 56 14, 56 22 C 56 34, 44 42, 32 52 Z"
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M6 42 C 6 36, 12 33, 17 36 C 22 39, 28 43, 32 43 C 36 43, 42 39, 47 36 C 52 33, 58 36, 58 42 C 58 48, 52 51, 47 48 C 42 45, 36 41, 32 41 C 28 41, 22 45, 17 48 C 12 51, 6 48, 6 42 Z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth + 0.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}
