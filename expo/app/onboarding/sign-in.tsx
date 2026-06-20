import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { useAuth } from "@/providers/auth-provider";
import { useProfile } from "@/providers/profile-provider";

type SocialProvider = "google" | "instagram" | "tiktok" | "twitter";

interface SocialButtonProps {
  provider: SocialProvider;
  onPress: () => void;
}

const SOCIALS: { id: SocialProvider; label: string; bg: string; fg: string; logo: string }[] = [
  {
    id: "google",
    label: "Continue with Gmail",
    bg: "#FFFFFF",
    fg: "#1F1320",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
  },
  {
    id: "instagram",
    label: "Continue with Instagram",
    bg: "#1F1320",
    fg: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
  },
  {
    id: "tiktok",
    label: "Continue with TikTok",
    bg: "#111111",
    fg: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
  },
  {
    id: "twitter",
    label: "Continue with X / Twitter",
    bg: "#000000",
    fg: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg",
  },
];

function SocialButton({ provider, onPress }: SocialButtonProps) {
  const cfg = SOCIALS.find((s) => s.id === provider)!;
  return (
    <Pressable
      onPress={onPress}
      testID={`social-${provider}`}
      style={({ pressed }) => [
        styles.socialBtn,
        {
          backgroundColor: cfg.bg,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Image source={{ uri: cfg.logo }} style={styles.socialLogo} resizeMode="contain" />
      <Text style={[styles.socialLabel, { color: cfg.fg }]}>{cfg.label}</Text>
      <View style={styles.socialSpacer} />
    </Pressable>
  );
}

export default function SignInScreen() {
  const {
    loading: authLoading,
    mode,
    signInWithEmail,
  } = useAuth();
  const { profile } = useProfile();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const onEmailSignIn = async () => {
    const id = email.trim();
    if (!id || !password) {
      Alert.alert("Missing info", "Please enter your username/email and password.");
      return;
    }

    if (mode === "supabase") {
      if (!id.includes("@")) {
        Alert.alert("Use your email", "Supabase sign-in uses your email address.");
        return;
      }

      const result = await signInWithEmail({ email: id, password });
      if (!result.ok) {
        Alert.alert("Sign in failed", result.error);
        return;
      }

      if (!result.session) {
        Alert.alert(
          "Check your email",
          "Confirm your email address, then sign in again."
        );
        return;
      }

      router.replace(profile ? "/(tabs)/discover" : "/onboarding/legal");
      return;
    }

    console.log("[sign-in] attempt", id);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const creds = profile?.credentials ?? [];
      const idLower = id.toLowerCase();
      const match = creds.find(
        (c) =>
          c.username.toLowerCase() === idLower && c.password === password
      );
      const emailMatch =
        !match &&
        profile?.ownerEmail &&
        profile.ownerEmail.toLowerCase() === idLower &&
        creds[0]?.password === password;
      if (match || emailMatch || creds.length === 0) {
        router.replace("/(tabs)/discover");
      } else {
        Alert.alert(
          "Sign in failed",
          "That username/email and password don't match our records."
        );
      }
    }, 500);
  };

  const onSocial = (provider: SocialProvider) => {
    console.log("[sign-in] social", provider);
    Alert.alert(
      "Coming soon",
      `Sign in with ${provider[0].toUpperCase() + provider.slice(1)} will be available soon.`
    );
  };

  return (
    <View style={styles.root} testID="sign-in-screen">
      <Stack.Screen options={{ headerShown: true, headerTransparent: true, headerTintColor: "#FFE6A1", title: "" }} />
      <Image
        source={{
          uri: "https://r2-pub.rork.com/generated-images/72b141b5-997b-4d4d-b90c-6ee5ce90f32f.png",
        }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(31,19,32,0.55)", "rgba(31,19,32,0.85)", "rgba(31,19,32,0.98)"]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.brandShadow}>Welcome back</Text>
              <Text style={styles.brand}>Welcome back</Text>
              <View style={styles.underline} />
              <Text style={styles.subtitle}>
                Sign back in and pick up where the juice was flowing.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Username or email</Text>
              <View style={styles.inputWrap}>
                <Mail size={18} color="#8A7C83" />
                <TextInput
                  testID="email-input"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="sunny_sam or you@example.com"
                  placeholderTextColor="#8A7C83"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              <View style={{ height: 14 }} />

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Lock size={18} color="#8A7C83" />
                <TextInput
                  testID="password-input"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  placeholderTextColor="#8A7C83"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={10}
                  testID="toggle-password"
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#8A7C83" />
                  ) : (
                    <Eye size={18} color="#8A7C83" />
                  )}
                </Pressable>
              </View>

              <Pressable
                onPress={() => Alert.alert("Reset password", "We'll send you a reset link soon.")}
                style={styles.forgot}
                testID="forgot-password"
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              <View style={{ height: 8 }} />

              <Button
                label="Sign in"
                onPress={onEmailSignIn}
                loading={loading || authLoading}
                backgroundColor="#FFD36B"
                textColor="#1F1320"
                testID="email-sign-in-btn"
              />
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socials}>
              {SOCIALS.map((s) => (
                <SocialButton key={s.id} provider={s.id} onPress={() => onSocial(s.id)} />
              ))}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to Orchard? </Text>
              <Pressable onPress={() => router.push("/onboarding/legal")} testID="create-account-link">
                <Text style={styles.footerLink}>Create a profile</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1F1320" },
  safe: { flex: 1 },
  scroll: { padding: 24, paddingTop: 72, paddingBottom: 40 },
  header: { alignSelf: "flex-start", marginBottom: 24 },
  brand: {
    fontSize: 40,
    fontWeight: "900" as const,
    color: "#FFE6A1",
    letterSpacing: -1.5,
    fontStyle: "italic",
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(255, 180, 70, 0.55)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 16,
      },
      android: {
        textShadowColor: "rgba(255, 180, 70, 0.55)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
      },
      default: {
        textShadowColor: "rgba(255, 180, 70, 0.55)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 16,
      },
    }),
  },
  brandShadow: {
    position: "absolute",
    top: 3,
    left: 2,
    fontSize: 40,
    fontWeight: "900" as const,
    color: "rgba(0,0,0,0.35)",
    letterSpacing: -1.5,
    fontStyle: "italic",
  },
  underline: {
    marginTop: 8,
    height: 3,
    width: 48,
    borderRadius: 2,
    backgroundColor: "#FFD36B",
  },
  subtitle: {
    marginTop: 14,
    color: "#F6EEE1",
    opacity: 0.85,
    fontSize: 15,
    lineHeight: 20,
    maxWidth: 300,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,214,107,0.25)",
    borderRadius: 20,
    padding: 18,
  },
  label: {
    color: "#FFE6A1",
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 0,
  },
  forgot: { alignSelf: "flex-end", marginTop: 10, marginBottom: 4 },
  forgotText: {
    color: "#FFD36B",
    fontSize: 13,
    fontWeight: "600" as const,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dividerText: {
    color: "#F6EEE1",
    opacity: 0.7,
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
  },
  socials: { gap: 10 },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  socialLogo: { width: 20, height: 20 },
  socialLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
  socialSpacer: { width: 20 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },
  footerText: { color: "#F6EEE1", opacity: 0.8, fontSize: 14 },
  footerLink: {
    color: "#FFD36B",
    fontSize: 14,
    fontWeight: "800" as const,
  },
});
