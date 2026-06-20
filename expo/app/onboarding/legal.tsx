import { router } from "expo-router";
import { Check, FileText, Shield } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/ui";
import Colors from "@/constants/colors";
import { LEGAL_CONFIG } from "@/constants/legal";
import { useOnboarding } from "@/providers/onboarding-provider";

export default function LegalGateScreen() {
  const { acceptLegal } = useOnboarding();
  const [ageConfirmed, setAgeConfirmed] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [privacyAccepted, setPrivacyAccepted] = React.useState(false);
  const [standardsAccepted, setStandardsAccepted] = React.useState(false);

  const canContinue =
    ageConfirmed && termsAccepted && privacyAccepted && standardsAccepted;

  const continueOnboarding = () => {
    acceptLegal();
    router.push("/onboarding/account-type");
  };

  const openOptionalUrl = (url: string | undefined) => {
    if (!url) {
      Alert.alert("Coming soon", "This public link is not configured yet.");
      return;
    }
    Linking.openURL(url).catch(() =>
      Alert.alert("Couldn't open link", "Try again in a moment.")
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.step}>Before we start</Text>
        <Text style={styles.title}>Consent, safety, and clear context</Text>
        <Text style={styles.sub}>
          Orchard is an adult beta for polyamorous and ENM dating. Confirm these
          basics before creating a profile.
        </Text>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Shield size={26} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>18+ only</Text>
            <Text style={styles.heroText}>
              You must be at least 18 and able to consent to use Orchard.
            </Text>
          </View>
        </View>

        <View style={styles.checkList}>
          <CheckRow
            checked={ageConfirmed}
            label="I confirm I am 18 or older."
            onPress={() => setAgeConfirmed((v) => !v)}
            testID="accept-age"
          />
          <CheckRow
            checked={termsAccepted}
            label="I accept the MVP terms."
            onPress={() => setTermsAccepted((v) => !v)}
            testID="accept-terms"
          />
          <CheckRow
            checked={privacyAccepted}
            label="I understand the MVP privacy notice."
            onPress={() => setPrivacyAccepted((v) => !v)}
            testID="accept-privacy"
          />
          <CheckRow
            checked={standardsAccepted}
            label="I agree to the community standards."
            onPress={() => setStandardsAccepted((v) => !v)}
            testID="accept-standards"
          />
        </View>

        <View style={styles.linkRow}>
          <PolicyLink
            label="Terms"
            configured={!!LEGAL_CONFIG.termsUrl}
            onPress={() => openOptionalUrl(LEGAL_CONFIG.termsUrl)}
          />
          <PolicyLink
            label="Privacy"
            configured={!!LEGAL_CONFIG.privacyUrl}
            onPress={() => openOptionalUrl(LEGAL_CONFIG.privacyUrl)}
          />
          <PolicyLink
            label="Standards"
            configured={!!LEGAL_CONFIG.communityStandardsUrl}
            onPress={() =>
              openOptionalUrl(LEGAL_CONFIG.communityStandardsUrl)
            }
          />
        </View>

        <View style={styles.notice}>
          <FileText size={18} color={Colors.palette.evergreen} />
          <Text style={styles.noticeText}>
            Public policy URLs are still being finalized for TestFlight. These
            acknowledgements are stored locally in the prototype profile.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={continueOnboarding}
          disabled={!canContinue}
          testID="continue-legal"
        />
      </View>
    </View>
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
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={styles.policyLinkText}>{label}</Text>
      <Text style={styles.policyLinkStatus}>
        {configured ? "Open" : "Pending"}
      </Text>
    </Pressable>
  );
}

function CheckRow({
  checked,
  label,
  onPress,
  testID,
}: {
  checked: boolean;
  label: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.checkRow,
        checked && styles.checkRowOn,
        pressed && { opacity: 0.9 },
      ]}
      testID={testID}
    >
      <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
        {checked && <Check size={15} color="#FFF" />}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
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
  sub: {
    fontSize: 15,
    color: Colors.light.textMuted,
    marginTop: 8,
    lineHeight: 21,
  },
  heroCard: {
    marginTop: 24,
    flexDirection: "row",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Colors.palette.evergreen,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800" as const,
  },
  heroText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: "600" as const,
  },
  checkList: { marginTop: 18, gap: 10 },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  checkRowOn: {
    borderColor: Colors.palette.evergreen,
    backgroundColor: Colors.light.surfaceAlt,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.surface,
  },
  checkBoxOn: {
    borderColor: Colors.palette.evergreen,
    backgroundColor: Colors.palette.evergreen,
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "700" as const,
    lineHeight: 19,
  },
  linkRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  policyLink: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  policyLinkText: {
    fontSize: 12,
    color: Colors.palette.evergreen,
    fontWeight: "800" as const,
  },
  policyLinkStatus: {
    fontSize: 10,
    color: Colors.light.textMuted,
    fontWeight: "800" as const,
    textTransform: "uppercase",
  },
  notice: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceAlt,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
  },
  footer: {
    padding: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.line,
  },
});
