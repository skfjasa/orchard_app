import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import Colors from "@/constants/colors";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "dark";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
  testID,
  backgroundColor,
  textColor,
}: ButtonProps) {
  const bg =
    backgroundColor ??
    (variant === "primary"
      ? Colors.light.tint
      : variant === "dark"
      ? Colors.light.accent
      : variant === "secondary"
      ? Colors.light.surface
      : "transparent");
  const fg =
    textColor ??
    (variant === "primary" || variant === "dark"
      ? "#FFF"
      : Colors.light.text);
  const border =
    variant === "secondary" ? Colors.light.line : "transparent";

  return (
    <Pressable
      testID={testID}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === "secondary" ? 1 : 0,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.btnText, { color: fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export function Chip({ label, selected, onPress, style, testID }: ChipProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <Text
        style={[styles.chipText, selected && styles.chipTextSelected]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface LabelProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export function SectionLabel({ children, style }: LabelProps) {
  return <Text style={[styles.sectionLabel, style]}>{children}</Text>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  chipSelected: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.accent,
  },
  chipText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  chipTextSelected: {
    color: "#FFF",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: Colors.light.textMuted,
    marginBottom: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.line,
    marginVertical: 16,
  },
});
