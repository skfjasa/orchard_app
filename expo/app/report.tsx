import { router, Stack, useLocalSearchParams } from "expo-router";
import { AlertTriangle, Check } from "lucide-react-native";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/ui";
import Colors from "@/constants/colors";
import { MOCK_PROFILES } from "@/mocks/profiles";
import { useProfile } from "@/providers/profile-provider";
import type { ReportReason } from "@/services/safety-service";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "harassment", label: "Harassment or hate" },
  { value: "impersonation", label: "Impersonation" },
  { value: "spam", label: "Spam or scam" },
  { value: "underage", label: "Underage user" },
  { value: "unsafe_behavior", label: "Unsafe behavior" },
  { value: "other", label: "Something else" },
];

export default function ReportScreen() {
  const { profileId, messageId } = useLocalSearchParams<{
    profileId?: string;
    messageId?: string;
  }>();
  const { reportProfile } = useProfile();
  const [reason, setReason] = React.useState<ReportReason>("unsafe_behavior");
  const [details, setDetails] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const reportedProfile = React.useMemo(
    () => MOCK_PROFILES.find((profile) => profile.id === profileId),
    [profileId]
  );

  const displayName = reportedProfile
    ? reportedProfile.accountType === "couple" && reportedProfile.people[1]
      ? `${reportedProfile.people[0].name} & ${reportedProfile.people[1].name}`
      : reportedProfile.people[0].name
    : "this profile";

  const submit = React.useCallback(async () => {
    if (!profileId) {
      Alert.alert("Report unavailable", "No profile was selected.");
      return;
    }

    setIsSubmitting(true);
    const result = await reportProfile(
      profileId,
      reason,
      details.trim() || undefined,
      messageId
    );
    setIsSubmitting(false);

    if (!result.ok) {
      Alert.alert("Report failed", result.error ?? "Try again in a moment.");
      return;
    }

    Alert.alert("Report submitted", "Thanks. This was flagged for review.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  }, [details, messageId, profileId, reason, reportProfile]);

  return (
    <>
      <Stack.Screen options={{ title: "Report" }} />
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <AlertTriangle size={26} color="#FFF" />
            </View>
            <Text style={styles.title}>
              Report {messageId ? "message" : "profile"}
            </Text>
            <Text style={styles.subtitle}>
              Tell us what happened with {displayName}. Reports are private.
            </Text>
          </View>

          <Text style={styles.label}>Reason</Text>
          <View style={styles.reasonList}>
            {REASONS.map((item) => {
              const selected = item.value === reason;
              return (
                <Pressable
                  key={item.value}
                  onPress={() => setReason(item.value)}
                  style={({ pressed }) => [
                    styles.reasonRow,
                    selected && styles.reasonRowSelected,
                    pressed && { opacity: 0.9 },
                  ]}
                  testID={`report-reason-${item.value}`}
                >
                  <Text style={styles.reasonText}>{item.label}</Text>
                  <View style={[styles.check, selected && styles.checkOn]}>
                    {selected && <Check size={14} color="#FFF" />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>Details</Text>
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder="Add context for the moderation review..."
            placeholderTextColor={Colors.light.textMuted}
            multiline
            maxLength={800}
            style={styles.details}
            textAlignVertical="top"
            testID="report-details"
          />
          <Text style={styles.counter}>{details.length}/800</Text>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Submit report"
            onPress={submit}
            loading={isSubmitting}
            disabled={!profileId}
            testID="submit-report"
          />
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 24 },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.palette.danger,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
  },
  label: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: Colors.light.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  reasonList: { gap: 8 },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  reasonRowSelected: {
    backgroundColor: Colors.light.surfaceAlt,
    borderColor: Colors.palette.evergreen,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "700" as const,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.surface,
  },
  checkOn: {
    backgroundColor: Colors.palette.evergreen,
    borderColor: Colors.palette.evergreen,
  },
  details: {
    minHeight: 140,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 20,
  },
  counter: {
    marginTop: 5,
    textAlign: "right",
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: "700" as const,
  },
  footer: {
    padding: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.line,
  },
});
