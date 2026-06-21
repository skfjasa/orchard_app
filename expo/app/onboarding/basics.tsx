import { router } from "expo-router";
import { Eye, EyeOff, Lock, MapPin, User as UserIcon } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button, SectionLabel } from "@/components/ui";
import { searchCities } from "@/constants/cities";
import Colors from "@/constants/colors";
import { useAuth } from "@/providers/auth-provider";
import { useOnboarding } from "@/providers/onboarding-provider";

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function BasicsScreen() {
  const { mode, session } = useAuth();
  const { draft, setPerson, setCity, setEmail, setUsername, setPassword } =
    useOnboarding();
  const isCouple = draft.accountType === "couple";
  const hasSupabaseSession = mode === "supabase" && !!session;
  const [cityFocused, setCityFocused] = useState<boolean>(false);
  const [showPw1, setShowPw1] = useState<boolean>(false);
  const [showPw2, setShowPw2] = useState<boolean>(false);

  const citySuggestions = useMemo(() => {
    if (!cityFocused) return [];
    return searchCities(draft.city ?? "", 6);
  }, [draft.city, cityFocused]);

  const showSuggestions =
    cityFocused &&
    citySuggestions.length > 0 &&
    (draft.city ?? "").trim().length > 0 &&
    citySuggestions[0]?.toLowerCase() !== (draft.city ?? "").trim().toLowerCase();

  const person1 = draft.people[0] ?? {};
  const person2 = draft.people[1] ?? {};
  const email1 = draft.emails[0] ?? "";
  const email2 = draft.emails[1] ?? "";
  const username1 = draft.usernames[0] ?? "";
  const username2 = draft.usernames[1] ?? "";
  const password1 = draft.passwords[0] ?? "";
  const password2 = draft.passwords[1] ?? "";

  const validUsername = (v: string) => /^[a-zA-Z0-9_.]{3,20}$/.test(v.trim());
  const validPassword = (v: string) => v.length >= 6;
  const primaryAccountValid = hasSupabaseSession
    ? isValidEmail(email1)
    : isValidEmail(email1) && validUsername(username1) && validPassword(password1);
  const partnerAccountValid = hasSupabaseSession
    ? isValidEmail(email2) && email2.trim().toLowerCase() !== email1.trim().toLowerCase()
    : isValidEmail(email2) &&
      email2.trim().toLowerCase() !== email1.trim().toLowerCase() &&
      validUsername(username2) &&
      validPassword(password2) &&
      username2.trim().toLowerCase() !== username1.trim().toLowerCase();

  useEffect(() => {
    const authEmail = session?.user.email;
    if (!hasSupabaseSession || !authEmail || email1.trim()) return;
    setEmail(0, authEmail);
  }, [email1, hasSupabaseSession, session?.user.email, setEmail]);

  const canContinue =
    !!person1.name &&
    !!person1.age &&
    person1.age >= 18 &&
    !!draft.city &&
    primaryAccountValid &&
    (!isCouple ||
      (!!person2.name &&
        !!person2.age &&
        person2.age >= 18 &&
        partnerAccountValid));

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.step}>Step 2 of 6</Text>
        <Text style={styles.title}>Let&apos;s get to the core</Text>
        <Text style={styles.sub}>
          {isCouple
            ? "Spill the seeds — tell us about both of you."
            : "Spill the seeds — tell us a little about yourself."}
        </Text>

        <View style={{ height: 24 }} />

        <PersonBasics
          label={isCouple ? "Partner 1" : "You"}
          name={person1.name ?? ""}
          age={person1.age}
          email={email1}
          emailLabel={isCouple ? "Your email" : "Email"}
          username={username1}
          password={password1}
          showPassword={showPw1}
          onToggleShow={() => setShowPw1((v) => !v)}
          onName={(v) => setPerson(0, { name: v })}
          onAge={(v) => setPerson(0, { age: v })}
          onEmail={(v) => setEmail(0, v)}
          onUsername={(v) => setUsername(0, v)}
          onPassword={(v) => setPassword(0, v)}
          showCredentials={!hasSupabaseSession}
        />

        {isCouple && (
          <>
            <View style={{ height: 24 }} />
            <PersonBasics
              label="Partner 2"
              name={person2.name ?? ""}
              age={person2.age}
              email={email2}
              emailLabel="Partner's email"
              emailHint="We'll send them a link to connect their account."
              username={username2}
              password={password2}
              showPassword={showPw2}
              onToggleShow={() => setShowPw2((v) => !v)}
              onName={(v) => setPerson(1, { name: v })}
              onAge={(v) => setPerson(1, { age: v })}
              onEmail={(v) => setEmail(1, v)}
              onUsername={(v) => setUsername(1, v)}
              onPassword={(v) => setPassword(1, v)}
              showCredentials={!hasSupabaseSession}
            />
          </>
        )}

        <View style={{ height: 24 }} />

        <SectionLabel>Location</SectionLabel>
        <View>
          <TextInput
            value={draft.city}
            onChangeText={setCity}
            placeholder="Start typing your city"
            placeholderTextColor={Colors.light.textMuted}
            style={styles.input}
            testID="input-city"
            onFocus={() => setCityFocused(true)}
            onBlur={() => {
              setTimeout(() => setCityFocused(false), 150);
            }}
            autoCorrect={false}
          />
          {showSuggestions && (
            <View style={styles.suggestionsCard} testID="city-suggestions">
              {citySuggestions.map((c, i) => (
                <Pressable
                  key={c}
                  onPress={() => {
                    setCity(c);
                    setCityFocused(false);
                  }}
                  style={({ pressed }) => [
                    styles.suggestionRow,
                    i !== citySuggestions.length - 1 && styles.suggestionDivider,
                    pressed && { backgroundColor: Colors.light.surfaceAlt },
                  ]}
                  testID={`city-suggestion-${i}`}
                >
                  <View style={styles.suggestionIcon}>
                    <MapPin size={14} color={Colors.light.tint} />
                  </View>
                  <Text style={styles.suggestionText}>{c}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={() => router.push("/onboarding/identity")}
          disabled={!canContinue}
          testID="continue-basics"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function PersonBasics({
  label,
  name,
  age,
  email,
  emailLabel,
  emailHint,
  username,
  password,
  showPassword,
  onToggleShow,
  onName,
  onAge,
  onEmail,
  onUsername,
  onPassword,
  showCredentials = true,
}: {
  label: string;
  name: string;
  age: number | undefined;
  email: string;
  emailLabel: string;
  emailHint?: string;
  username: string;
  password: string;
  showPassword: boolean;
  onToggleShow: () => void;
  onName: (v: string) => void;
  onAge: (v: number) => void;
  onEmail: (v: string) => void;
  onUsername: (v: string) => void;
  onPassword: (v: string) => void;
  showCredentials?: boolean;
}) {
  return (
    <View>
      <SectionLabel>{label}</SectionLabel>
      <View style={styles.row}>
        <TextInput
          value={name}
          onChangeText={onName}
          placeholder="First name"
          placeholderTextColor={Colors.light.textMuted}
          style={[styles.input, { flex: 2 }]}
        />
        <TextInput
          value={age ? String(age) : ""}
          onChangeText={(v) => {
            const n = parseInt(v.replace(/\D/g, ""), 10);
            if (!isNaN(n)) onAge(n);
            else if (v === "") onAge(0);
          }}
          placeholder="Age"
          placeholderTextColor={Colors.light.textMuted}
          keyboardType="number-pad"
          maxLength={2}
          style={[styles.input, { flex: 1 }]}
        />
      </View>
      <View style={{ height: 10 }} />
      <Text style={styles.miniLabel}>{emailLabel}</Text>
      <TextInput
        value={email}
        onChangeText={onEmail}
        placeholder="name@example.com"
        placeholderTextColor={Colors.light.textMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      {emailHint && <Text style={styles.hint}>{emailHint}</Text>}

      {showCredentials && (
        <>
          <View style={{ height: 10 }} />
          <Text style={styles.miniLabel}>Username</Text>
          <View style={styles.inputWrap}>
            <UserIcon size={16} color={Colors.light.textMuted} />
            <TextInput
              value={username}
              onChangeText={onUsername}
              placeholder="e.g. sunny_sam"
              placeholderTextColor={Colors.light.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.inputInner}
              testID={`input-username-${label}`}
            />
          </View>
          <Text style={styles.hint}>3–20 characters. Letters, numbers, _ or .</Text>

          <View style={{ height: 10 }} />
          <Text style={styles.miniLabel}>Password</Text>
          <View style={styles.inputWrap}>
            <Lock size={16} color={Colors.light.textMuted} />
            <TextInput
              value={password}
              onChangeText={onPassword}
              placeholder="At least 6 characters"
              placeholderTextColor={Colors.light.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.inputInner}
              testID={`input-password-${label}`}
            />
            <Pressable onPress={onToggleShow} hitSlop={10}>
              {showPassword ? (
                <EyeOff size={16} color={Colors.light.textMuted} />
              ) : (
                <Eye size={16} color={Colors.light.textMuted} />
              )}
            </Pressable>
          </View>
          <Text style={styles.hint}>You&apos;ll use these to sign back in.</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 24, paddingBottom: 40 },
  step: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.light.tint,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.light.text,
    marginTop: 8,
    letterSpacing: -0.8,
  },
  sub: { fontSize: 15, color: Colors.light.textMuted, marginTop: 8 },
  row: { flexDirection: "row", gap: 10 },
  miniLabel: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.light.textMuted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 6,
    lineHeight: 16,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 8,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  inputInner: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 0,
  },
  footer: {
    padding: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.line,
  },
  suggestionsCard: {
    marginTop: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.line,
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  suggestionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.line,
  },
  suggestionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
});
