import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Camera, Instagram, Plus, Twitter, X } from "lucide-react-native";
import React, { useCallback } from "react";
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

import { Button, SectionLabel } from "@/components/ui";
import Colors from "@/constants/colors";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useAuth } from "@/providers/auth-provider";
import { useProfile } from "@/providers/profile-provider";
import { savePendingOnboardingProfile } from "@/services/pending-onboarding-storage";
import {
  AccountCredentials,
  AccountType,
  Gender,
  LinkedPartner,
  MAX_PHOTOS,
  PersonProfile,
  Profile,
  Race,
} from "@/types";

function makeInviteCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

const DEFAULT_PHOTOS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80",
];

export default function PhotosScreen() {
  const { draft, addPhoto, removePhoto, setBio, setSocial, reset } =
    useOnboarding();
  const {
    loading: authLoading,
    mode,
    session,
    signUpWithEmail,
    userId,
  } = useAuth();
  const { completeOnboarding } = useProfile();
  const isCouple = draft.accountType === "couple";
  const [finishing, setFinishing] = React.useState(false);

  const pick = useCallback(
    async (index: number) => {
      try {
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.7,
          allowsEditing: true,
          aspect: [3, 4],
          base64: Platform.OS === "web",
        });
        if (!res.canceled && res.assets[0]) {
          const asset = res.assets[0];
          const photoUri =
            Platform.OS === "web" && asset.base64
              ? `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`
              : asset.uri;
          addPhoto(index, photoUri);
        }
      } catch (e) {
        console.log("[photos] pick error", e);
        Alert.alert("Couldn't open photos", "Try again in a moment.");
      }
    },
    [addPhoto]
  );

  const finish = useCallback(async () => {
    if (finishing || authLoading) return;
    setFinishing(true);

    const people: PersonProfile[] = draft.people.map((p, i) => {
      const photos = (p.photos && p.photos.length > 0
        ? p.photos
        : [DEFAULT_PHOTOS[i % DEFAULT_PHOTOS.length]]) as string[];
      return {
        name: p.name ?? "",
        age: p.age ?? 18,
        gender: (p.gender ?? "Other") as Gender,
        race: (p.race ?? "Prefer not to say") as Race,
        photo: photos[0],
        photos,
        interests: p.interests ?? [],
        prompts: p.prompts && p.prompts.length > 0 ? p.prompts : undefined,
      };
    });

    const ownerEmail = draft.emails[0]?.trim() || undefined;
    const primaryPassword = draft.passwords[0] ?? "";
    const credentials: AccountCredentials[] = draft.usernames
      .map((u, idx) => ({
        username: (u ?? "").trim(),
        password: draft.passwords[idx] ?? "",
      }))
      .filter(
        (c, idx) =>
          !!c.username &&
          !!c.password &&
          (idx === 0 || draft.accountType === "couple")
      );
    const linkedPartners: LinkedPartner[] = [];
    const isCouple = draft.accountType === "couple";

    if (isCouple) {
      const partnerEmail = draft.emails[1]?.trim();
      if (partnerEmail) {
        const partner = people[1];
        linkedPartners.push({
          id: `lp-${Date.now()}`,
          email: partnerEmail,
          displayName: partner?.name,
          photo: partner?.photo,
          inviteCode: makeInviteCode(),
          status: "pending",
          invitedAt: Date.now(),
          role: "partner",
        });
      }
    }

    let profileId = `me-${Date.now()}`;
    let shouldSavePendingProfile = false;

    if (mode === "supabase") {
      if (!ownerEmail || !primaryPassword) {
        Alert.alert("Missing account info", "Add your email and password before finishing.");
        setFinishing(false);
        return;
      }

      if (session && userId) {
        profileId = userId;
      } else {
        const result = await signUpWithEmail({
          email: ownerEmail,
          password: primaryPassword,
        });

        if (!result.ok) {
          Alert.alert("Account could not be created", result.error);
          setFinishing(false);
          return;
        }

        if (!result.userId) {
          Alert.alert(
            "Check your email",
            "Confirm your email address, then sign in to finish your profile."
          );
          setFinishing(false);
          return;
        }

        profileId = result.userId;

        if (!result.session) {
          shouldSavePendingProfile = true;
        }
      }
    }

    const profile: Profile = {
      id: profileId,
      accountType: draft.accountType as AccountType,
      people,
      location: {
        city: draft.city,
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.006 + (Math.random() - 0.5) * 0.1,
      },
      preferences: draft.preferences,
      lookingFor: draft.lookingFor,
      polyType: draft.polyType,
      bio: draft.bio.trim() || undefined,
      socials: {
        instagram: draft.socials.instagram?.trim() || undefined,
        twitter: draft.socials.twitter?.trim() || undefined,
        tiktok: draft.socials.tiktok?.trim() || undefined,
      },
      createdAt: Date.now(),
      ownerEmail,
      linkedPartners: linkedPartners.length > 0 ? linkedPartners : undefined,
      credentials: credentials.length > 0 ? credentials : undefined,
      ageConfirmed: draft.ageConfirmed,
      legalAcceptedAt: draft.legalAcceptedAt,
    };

    console.log("[photos] completing onboarding", profile.id, {
      linkedPartners: linkedPartners.length,
    });

    if (shouldSavePendingProfile) {
      await savePendingOnboardingProfile(profile);
      Alert.alert(
        "Check your email",
        "Confirm your email address, then return to Orchard. We'll finish saving your profile after you're confirmed."
      );
      setFinishing(false);
      return;
    }

    const completeResult = await completeOnboarding(profile);
    if (!completeResult.ok) {
      Alert.alert(
        "Profile could not be saved",
        completeResult.error ?? "Try again in a moment."
      );
      setFinishing(false);
      return;
    }

    reset();
    setFinishing(false);

    if (isCouple && linkedPartners[0]) {
      const lp = linkedPartners[0];
      Alert.alert(
        "Invite sent \ud83c\udf4d",
        `We emailed a link to ${lp.email} so ${lp.displayName ?? "your partner"} can connect their account.\n\nInvite code: ${lp.inviteCode}\n\nYou can resend the link anytime from your profile.`,
        [
          {
            text: "Got it",
            onPress: () => router.replace("/(tabs)/discover"),
          },
        ]
      );
    } else {
      router.replace("/(tabs)/discover");
    }
  }, [
    authLoading,
    completeOnboarding,
    draft,
    finishing,
    mode,
    reset,
    session,
    signUpWithEmail,
    userId,
  ]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.step}>Step 6 of 6</Text>
        <Text style={styles.title}>Picture-perfect peaches</Text>
        <Text style={styles.sub}>
          Add up to {MAX_PHOTOS} photos
          {isCouple ? " per partner" : ""}. A juicy bio goes a long way.
        </Text>

        <View style={{ height: 24 }} />

        {draft.people.map((person, i) => {
          const photos = person.photos ?? [];
          const label = isCouple
            ? person.name ?? `Partner ${i + 1}`
            : "Your photos";
          return (
            <View key={i} style={{ marginBottom: 24 }}>
              <SectionLabel>{label}</SectionLabel>
              <View style={styles.grid}>
                {Array.from({ length: MAX_PHOTOS }).map((_, slot) => {
                  const uri = photos[slot];
                  return (
                    <View key={slot} style={styles.slotWrap}>
                      <Pressable
                        onPress={() => {
                          if (uri) {
                            removePhoto(i, slot);
                          } else {
                            pick(i);
                          }
                        }}
                        style={({ pressed }) => [
                          styles.slot,
                          pressed && { opacity: 0.9 },
                        ]}
                        testID={`photo-slot-${i}-${slot}`}
                      >
                        {uri ? (
                          <>
                            <Image
                              source={{ uri }}
                              style={styles.slotImg}
                              contentFit="cover"
                            />
                            <View style={styles.removeBadge}>
                              <X size={12} color="#FFF" />
                            </View>
                            {slot === 0 && (
                              <View style={styles.primaryBadge}>
                                <Text style={styles.primaryBadgeText}>
                                  Main
                                </Text>
                              </View>
                            )}
                          </>
                        ) : (
                          <View style={styles.slotEmpty}>
                            {slot === 0 ? (
                              <Camera
                                size={22}
                                color={Colors.light.textMuted}
                              />
                            ) : (
                              <Plus
                                size={22}
                                color={Colors.light.textMuted}
                              />
                            )}
                          </View>
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <SectionLabel>Bio</SectionLabel>
        <TextInput
          value={draft.bio}
          onChangeText={setBio}
          placeholder={
            isCouple
              ? "Tell people about the two of you..."
              : "Say something real. What are you looking for?"
          }
          placeholderTextColor={Colors.light.textMuted}
          style={styles.bioInput}
          multiline
          maxLength={300}
          testID="input-bio"
        />
        <Text style={styles.counter}>
          {draft.bio.length}/300
        </Text>

        <View style={{ height: 18 }} />

        <SectionLabel>Social links (optional)</SectionLabel>
        <SocialField
          icon={<Instagram size={18} color={Colors.palette.coral} />}
          placeholder="Instagram handle"
          value={draft.socials.instagram ?? ""}
          onChangeText={(v) => setSocial("instagram", v)}
          testID="input-ig"
        />
        <View style={{ height: 10 }} />
        <SocialField
          icon={<Twitter size={18} color={Colors.palette.evergreen} />}
          placeholder="X / Twitter handle"
          value={draft.socials.twitter ?? ""}
          onChangeText={(v) => setSocial("twitter", v)}
          testID="input-tw"
        />
        <View style={{ height: 10 }} />
        <SocialField
          icon={
            <Text style={styles.tiktokIcon}>TT</Text>
          }
          placeholder="TikTok handle"
          value={draft.socials.tiktok ?? ""}
          onChangeText={(v) => setSocial("tiktok", v)}
          testID="input-tt"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Finish & pull up a chair"
          onPress={finish}
          loading={finishing || authLoading}
          testID="finish-onboarding"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function SocialField({
  icon,
  placeholder,
  value,
  onChangeText,
  testID,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  testID?: string;
}) {
  return (
    <View style={styles.socialRow}>
      <View style={styles.socialIcon}>{icon}</View>
      <Text style={styles.atSign}>@</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.socialInput}
        testID={testID}
      />
    </View>
  );
}

const SLOT_GAP = 8;

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
    fontSize: 30,
    fontWeight: "800" as const,
    color: Colors.light.text,
    marginTop: 8,
    letterSpacing: -0.8,
  },
  sub: { fontSize: 15, color: Colors.light.textMuted, marginTop: 8 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -SLOT_GAP / 2,
  },
  slotWrap: {
    width: "33.33%",
    paddingHorizontal: SLOT_GAP / 2,
    marginBottom: SLOT_GAP,
  },
  slot: {
    aspectRatio: 3 / 4,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  slotImg: { width: "100%", height: "100%" },
  slotEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.surfaceAlt,
  },
  removeBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(31,19,32,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: Colors.palette.coral,
  },
  primaryBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "800" as const,
    letterSpacing: 0.5,
  },
  bioInput: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.line,
    minHeight: 110,
    textAlignVertical: "top",
  },
  counter: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
    textAlign: "right",
    marginTop: 4,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.line,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 6,
  },
  socialIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  atSign: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.light.textMuted,
  },
  socialInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    paddingVertical: 6,
  },
  tiktokIcon: {
    fontSize: 12,
    fontWeight: "900" as const,
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  footer: {
    padding: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.line,
  },
});
