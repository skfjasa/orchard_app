import { router, Stack } from "expo-router";
import {
  AlertTriangle,
  FileText,
  LifeBuoy,
  Mail,
  Shield,
  Trash2,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ProtectedRoute from "@/components/navigation/ProtectedRoute";
import Colors from "@/constants/colors";
import { LEGAL_CONFIG } from "@/constants/legal";
import { useSafetyLegalReadModel } from "@/hooks/use-safety-legal-read-model";

export default function SafetyLegalScreen() {
  return (
    <ProtectedRoute loadingTestID="safety-legal-loader">
      <SafetyLegalContent />
    </ProtectedRoute>
  );
}

function SafetyLegalContent() {
  const { requestAccountDeletion } = useSafetyLegalReadModel();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const openSupport = React.useCallback(() => {
    const target =
      LEGAL_CONFIG.supportUrl ??
      `mailto:${LEGAL_CONFIG.supportEmail}?subject=Orchard support`;
    Linking.openURL(target).catch(() =>
      Alert.alert("Support", LEGAL_CONFIG.supportEmail)
    );
  }, []);

  const openOptionalUrl = React.useCallback((url: string | undefined) => {
    if (!url) {
      Alert.alert("Coming soon", "This public link is not configured yet.");
      return;
    }
    Linking.openURL(url).catch(() =>
      Alert.alert("Couldn't open link", "Try again in a moment.")
    );
  }, []);

  const submitDeletionRequest = React.useCallback(async () => {
    setIsDeleting(true);
    const result = await requestAccountDeletion("Requested from Safety & Legal");
    setIsDeleting(false);

    if (!result.ok) {
      Alert.alert("Request failed", result.error ?? "Try again in a moment.");
      return;
    }

    Alert.alert(
      "Request submitted",
      "Your account deletion request was recorded.",
      [{ text: "OK", onPress: () => router.replace("/onboarding/sign-in") }]
    );
  }, [requestAccountDeletion]);

  const confirmDeletion = React.useCallback(() => {
    const message =
      "This records an account deletion request and signs you out of this device.";

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(message)) {
        void submitDeletionRequest();
      }
      return;
    }

    Alert.alert("Request account deletion?", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Request deletion",
        style: "destructive",
        onPress: () => void submitDeletionRequest(),
      },
    ]);
  }, [submitDeletionRequest]);

  return (
    <>
      <Stack.Screen options={{ title: "Safety & Legal" }} />
      <SafeAreaView edges={["bottom"]} style={styles.root}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Shield size={28} color="#FFF" />
            </View>
            <Text style={styles.title}>Safety & Legal</Text>
            <Text style={styles.subtitle}>
              Core MVP policies and account controls live here while public URLs
              are being finalized.
            </Text>
          </View>

          <Section icon={<Shield size={18} color={Colors.palette.evergreen} />} title="Community standards">
            <Text style={styles.body}>
              Orchard is for adults 18+ who practice clear consent, honest
              relationship context, and respectful communication.
            </Text>
            <Text style={styles.body}>
              Harassment, impersonation, threats, coercion, spam, illegal
              content, and underage use are not allowed.
            </Text>
            <PolicyLink
              label="Open community standards"
              configured={!!LEGAL_CONFIG.communityStandardsUrl}
              onPress={() =>
                openOptionalUrl(LEGAL_CONFIG.communityStandardsUrl)
              }
            />
          </Section>

          <Section icon={<FileText size={18} color={Colors.palette.evergreen} />} title="Privacy">
            <Text style={styles.body}>
              Do not include private messages, raw profile text, or precise
              location in analytics. Exact location is not required for the MVP.
            </Text>
            <Text style={styles.body}>
              Final public privacy policy URL is still a launch decision.
            </Text>
            <PolicyLink
              label="Open privacy policy"
              configured={!!LEGAL_CONFIG.privacyUrl}
              onPress={() => openOptionalUrl(LEGAL_CONFIG.privacyUrl)}
            />
          </Section>

          <Section icon={<FileText size={18} color={Colors.palette.evergreen} />} title="Terms">
            <Text style={styles.body}>
              MVP terms must cover adult-only use, user-generated content,
              safety enforcement, reports, blocks, account deletion, and beta
              availability.
            </Text>
            <PolicyLink
              label="Open terms"
              configured={!!LEGAL_CONFIG.termsUrl}
              onPress={() => openOptionalUrl(LEGAL_CONFIG.termsUrl)}
            />
          </Section>

          <Section icon={<LifeBuoy size={18} color={Colors.palette.evergreen} />} title="Support">
            <Pressable
              onPress={openSupport}
              style={({ pressed }) => [
                styles.actionRow,
                pressed && { backgroundColor: Colors.light.surfaceAlt },
              ]}
              testID="contact-support"
            >
              <View style={styles.actionLeft}>
                <Mail size={18} color={Colors.palette.evergreen} />
                <Text style={styles.actionText}>Contact support</Text>
              </View>
              <Text style={styles.actionValue}>
                {LEGAL_CONFIG.supportUrl ? "Open" : LEGAL_CONFIG.supportEmail}
              </Text>
            </Pressable>
          </Section>

          <Section icon={<AlertTriangle size={18} color={Colors.palette.danger} />} title="Account deletion">
            <Text style={styles.body}>
              You can request account deletion from inside the app. The local MVP
              records the request and signs you out.
            </Text>
            <PolicyLink
              label="Open account deletion help"
              configured={!!LEGAL_CONFIG.accountDeletionUrl}
              onPress={() => openOptionalUrl(LEGAL_CONFIG.accountDeletionUrl)}
            />
            <Pressable
              onPress={confirmDeletion}
              disabled={isDeleting}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && !isDeleting ? { opacity: 0.9 } : null,
                isDeleting ? { opacity: 0.6 } : null,
              ]}
              testID="request-account-deletion"
            >
              <Trash2 size={18} color="#FFF" />
              <Text style={styles.deleteButtonText}>
                {isDeleting ? "Submitting..." : "Request account deletion"}
              </Text>
            </Pressable>
          </Section>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function PolicyLink({
  configured,
  label,
  onPress,
}: {
  configured: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.policyLink,
        pressed && { backgroundColor: Colors.light.surfaceAlt },
      ]}
    >
      <Text style={styles.policyLinkText}>{label}</Text>
      <Text style={styles.policyStatus}>
        {configured ? "Configured" : "Pending"}
      </Text>
    </Pressable>
  );
}

function Section({
  children,
  icon,
  title,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
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
    backgroundColor: Colors.palette.evergreen,
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
  section: { marginTop: 18 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: Colors.light.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sectionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.line,
    overflow: "hidden",
    padding: 14,
    gap: 10,
  },
  body: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    fontWeight: "500" as const,
  },
  policyLink: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.surfaceAlt,
  },
  policyLinkText: {
    flex: 1,
    fontSize: 13,
    color: Colors.palette.evergreen,
    fontWeight: "800" as const,
  },
  policyStatus: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: "800" as const,
    textTransform: "uppercase",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 4,
  },
  actionLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  actionText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "800" as const,
  },
  actionValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    color: Colors.light.textMuted,
    fontWeight: "700" as const,
  },
  deleteButton: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.palette.danger,
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800" as const,
  },
});
