import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Check,
  ChevronRight,
  Copy,
  Crown,
  FileText,
  Flame,
  Heart,
  Instagram,
  Link2,
  LogOut,
  Mail,
  MapPin,
  Mic,
  Pause,
  Pencil,
  Play,
  Plus,
  Quote,
  Send,
  Shield,
  Sparkles,
  Trash2,
  Twitter,
  UserPlus,
  X,
  Zap,
} from "lucide-react-native";
import SuperLikeIcon from "@/components/SuperLikeIcon";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { MVP_MONETIZATION_ENABLED } from "@/constants/features";
import { getPolyFruit } from "@/constants/poly-fruits";
import { useProfileTabReadModel } from "@/hooks/use-profile-tab-read-model";
import {
  DEFAULT_SUPER_LIKES,
  LinkedPartner,
  PersonProfile,
  PolyamoryType,
  PromptAnswer,
  SUBSCRIPTION_OPTIONS,
  VoicePrompt,
} from "@/types";

export default function ProfileScreen() {
  const {
    profile,
    signOut,
    totalSlots,
    slotsUsed,
    slotsRemaining,
    isBoosted,
    boostedUntil,
    superLikeBalance,
    superLikeRechargeAt,
    subscription,
    cancelSubscription,
    invitePartner,
    resendPartnerInvite,
    acceptPartnerLink,
    removePartnerLink,
  } = useProfileTabReadModel();
  const [inviteOpen, setInviteOpen] = React.useState<boolean>(false);

  const performSignOut = React.useCallback(async () => {
    try {
      console.log("[profile] signing out");
      await signOut();
      router.replace("/onboarding");
    } catch (e) {
      console.log("[profile] sign out nav error", e);
      await signOut();
      router.replace("/onboarding");
    }
  }, [signOut]);

  const confirmSignOut = () => {
    if (Platform.OS === "web") {
      performSignOut();
      return;
    }
    Alert.alert("Sign out?", "You can always sign back in.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: performSignOut,
      },
    ]);
  };

  const openSocial = (url: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert("Couldn't open link", "Check the handle and try again.")
    );
  };

  const boostRemainingMs = boostedUntil
    ? Math.max(0, boostedUntil - Date.now())
    : 0;
  const boostRemainingHrs = Math.floor(boostRemainingMs / 3600000);
  const boostRemainingMin = Math.floor((boostRemainingMs % 3600000) / 60000);
  const boostRemainingLabel =
    boostRemainingHrs > 0
      ? `${boostRemainingHrs}h ${boostRemainingMin}m left`
      : `${boostRemainingMin}m left`;

  const rechargeLabel = React.useMemo(() => {
    if (superLikeBalance >= DEFAULT_SUPER_LIKES) return null;
    if (!superLikeRechargeAt) return null;
    const ms = Math.max(0, superLikeRechargeAt - Date.now());
    const days = Math.floor(ms / (24 * 3600 * 1000));
    const hours = Math.floor((ms % (24 * 3600 * 1000)) / 3600000);
    if (days > 0) return `${days}d ${hours}h until full recharge`;
    if (hours > 0) return `${hours}h until full recharge`;
    const mins = Math.floor(ms / 60000);
    return `${mins}m until full recharge`;
  }, [superLikeBalance, superLikeRechargeAt]);

  const activePlan = subscription
    ? SUBSCRIPTION_OPTIONS.find((p) => p.id === subscription.id) ?? null
    : null;
  const renewLabel = subscription
    ? new Date(subscription.renewsAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  if (!profile) return null;

  const isCouple = profile.accountType === "couple";
  const socials = profile.socials ?? {};
  const hasSocials = !!(socials.instagram || socials.twitter || socials.tiktok);

  const confirmCancel = () => {
    Alert.alert(
      "Cancel subscription?",
      "You\u2019ll keep your perks until the end of this billing period.",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: () => cancelSubscription(),
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <Pressable
              hitSlop={10}
              onPress={() => router.push("/edit-profile")}
              style={styles.editPill}
              testID="edit-profile-btn"
            >
              <Pencil color="#FFF" size={13} />
              <Text style={styles.editPillText}>Edit</Text>
            </Pressable>
          </View>

          <View style={styles.heroRow}>
            {profile.people.map((person, i) => (
              <Pressable
                key={i}
                onPress={() => router.push("/edit-profile")}
                style={({ pressed }) => [
                  styles.personCardWrap,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                testID={`person-card-${i}`}
              >
                <PersonCard person={person} polyType={profile.polyType} />
              </Pressable>
            ))}
          </View>

          {isCouple && (
            <View style={styles.coupleBanner}>
              <Sparkles color={Colors.palette.honey} size={16} />
              <Text style={styles.coupleBannerText}>
                {"Shared account \u00b7 mirrored feed & inbox"}
              </Text>
            </View>
          )}

          {MVP_MONETIZATION_ENABLED && (
            <>
              <View style={styles.slotsCard}>
                <LinearGradient
                  colors={[
                    Colors.palette.evergreen,
                    Colors.palette.evergreenSoft,
                  ]}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.slotsTop}>
                  <View>
                    <Text style={styles.slotsLabel}>Match slots</Text>
                    <Text style={styles.slotsValue}>
                      {slotsUsed} / {totalSlots} used
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => router.push("/paywall")}
                    style={styles.upgradeBtn}
                    testID="upgrade-btn"
                  >
                    <Plus size={14} color={Colors.light.accent} />
                    <Text style={styles.upgradeBtnText}>Add slots</Text>
                  </Pressable>
                </View>
                <View style={styles.slotsBar}>
                  <View
                    style={[
                      styles.slotsBarFill,
                      {
                        width: `${Math.min(100, (slotsUsed / totalSlots) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.slotsHint}>
                  {slotsRemaining > 0
                    ? `${slotsRemaining} slot${slotsRemaining === 1 ? "" : "s"} free \u00b7 unlimited swipes`
                    : "You're at your match limit. Unlock more to keep connecting."}
                </Text>
              </View>

              <Pressable
                onPress={() => router.push("/paywall?reason=superlikes")}
                style={({ pressed }) => [
                  styles.superCard,
                  pressed && { opacity: 0.95 },
                ]}
                testID="super-likes-card"
              >
                <View style={styles.superIcon}>
                  <SuperLikeIcon size={22} color={Colors.palette.honey} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.superTitle}>
                    {superLikeBalance} Super Like
                    {superLikeBalance === 1 ? "" : "s"} left
                  </Text>
                  <Text style={styles.superSub}>
                    {rechargeLabel
                      ? rechargeLabel
                      : superLikeBalance >= DEFAULT_SUPER_LIKES
                      ? `Full tank \u00b7 ${DEFAULT_SUPER_LIKES} recharge 30 days after last use`
                      : "Tap to refill or stock up"}
                  </Text>
                </View>
                <ChevronRight color={Colors.light.text} size={18} />
              </Pressable>

              {activePlan ? (
                <View
                  style={[
                    styles.planActiveCard,
                    {
                      backgroundColor:
                        activePlan.accent === "coral"
                          ? Colors.palette.coral
                          : Colors.palette.evergreen,
                    },
                  ]}
                  testID="subscription-active"
                >
                  <View style={styles.planActiveTop}>
                    <View style={styles.planActiveBadge}>
                      <Crown size={13} color="#FFF" />
                      <Text style={styles.planActiveBadgeText}>
                        {activePlan.title}
                      </Text>
                    </View>
                    <Text style={styles.planActivePrice}>
                      {activePlan.price}/mo
                    </Text>
                  </View>
                  <Text style={styles.planActiveTagline}>
                    Renews {renewLabel}
                  </Text>
                  <View style={styles.planActiveActions}>
                    <Pressable
                      onPress={() => router.push("/paywall")}
                      style={({ pressed }) => [
                        styles.planManageBtn,
                        pressed && { opacity: 0.9 },
                      ]}
                      testID="manage-plan"
                    >
                      <Text style={styles.planManageText}>Manage</Text>
                    </Pressable>
                    <Pressable
                      onPress={confirmCancel}
                      style={({ pressed }) => [
                        styles.planCancelBtn,
                        pressed && { opacity: 0.9 },
                      ]}
                      testID="cancel-plan"
                    >
                      <Text style={styles.planCancelText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => router.push("/paywall")}
                  style={({ pressed }) => [
                    styles.planPromoCard,
                    pressed && { opacity: 0.95 },
                  ]}
                  testID="plan-promo"
                >
                  <View style={styles.planPromoIcon}>
                    <Crown color="#FFF" size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planPromoTitle}>Go Plus or Pro</Text>
                    <Text style={styles.planPromoSub}>
                      Monthly slots, Super Likes & more from $9.99
                    </Text>
                  </View>
                  <ChevronRight color="#FFF" size={18} />
                </Pressable>
              )}

              <Pressable
                onPress={() => router.push("/paywall?reason=boost")}
                style={({ pressed }) => [
                  styles.boostCard,
                  pressed && { opacity: 0.95 },
                ]}
                testID="boost-card"
              >
                <View style={styles.boostIcon}>
                  {isBoosted ? (
                    <Zap color="#FFF" size={20} fill="#FFF" />
                  ) : (
                    <Flame color="#FFF" size={20} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boostTitle}>
                    {isBoosted ? "You're boosted" : "Boost your profile"}
                  </Text>
                  <Text style={styles.boostSub}>
                    {isBoosted
                      ? `Trending in your area \u00b7 ${boostRemainingLabel}`
                      : "Trend in your area for 24 hours \u00b7 $20"}
                  </Text>
                </View>
                <ChevronRight color="#FFF" size={18} />
              </Pressable>
            </>
          )}

          <Section title="Bio" onPress={() => router.push("/edit-profile")}>
            <Pressable
              onPress={() => router.push("/edit-profile")}
              style={({ pressed }) => [
                styles.bioCard,
                pressed && { opacity: 0.85 },
              ]}
              testID="bio-tap"
            >
              <Text
                style={[
                  styles.bioText,
                  !profile.bio && { color: Colors.light.textMuted, fontStyle: "italic" },
                ]}
              >
                {profile.bio || "Add a line or two about you \u2014 tap to write it."}
              </Text>
            </Pressable>
          </Section>

          <Section title="Connected accounts">
            <ConnectedAccounts
              ownerEmail={profile.ownerEmail}
              primaryName={profile.people[0]?.name}
              primaryPhoto={profile.people[0]?.photo}
              partners={profile.linkedPartners ?? []}
              onResend={(lp) => {
                resendPartnerInvite(lp.id);
                Alert.alert(
                  "Invite resent",
                  `A fresh link was sent to ${lp.email}.\n\nNew code: ${lp.inviteCode}`
                );
              }}
              onAccept={(lp) => {
                Alert.alert(
                  "Mark as connected?",
                  `This confirms ${lp.displayName ?? lp.email} accepted the invite.`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Confirm",
                      onPress: () => acceptPartnerLink(lp.id),
                    },
                  ]
                );
              }}
              onCopyLink={async (lp) => {
                const link = `https://pineapples.app/link?code=${lp.inviteCode}`;
                try {
                  await Clipboard.setStringAsync(link);
                  Alert.alert("Copied", "Invite link copied to clipboard.");
                } catch (e) {
                  console.log("[profile] copy error", e);
                }
              }}
              onRemove={(lp) => {
                Alert.alert(
                  "Remove connection?",
                  `This will unlink ${lp.displayName ?? lp.email}.`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Remove",
                      style: "destructive",
                      onPress: () => removePartnerLink(lp.id),
                    },
                  ]
                );
              }}
              onAdd={() => setInviteOpen(true)}
            />
          </Section>

          <Section
            title="Socials"
            onPress={() => router.push("/edit-profile")}
          >
            {!hasSocials ? (
              <Pressable
                onPress={() => router.push("/edit-profile")}
                style={({ pressed }) => [
                  styles.addSocialBtn,
                  pressed && { opacity: 0.85 },
                ]}
                testID="add-socials"
              >
                <Plus size={14} color={Colors.palette.evergreen} />
                <Text style={styles.addSocialText}>Add your socials</Text>
              </Pressable>
            ) : (
              <View style={styles.socialHub}>
                {socials.instagram && (
                  <SocialButton
                    icon={
                      <Instagram
                        size={18}
                        color="#FFF"
                      />
                    }
                    label={`@${socials.instagram}`}
                    bg={Colors.palette.coral}
                    onPress={() =>
                      openSocial(`https://instagram.com/${socials.instagram}`)
                    }
                  />
                )}
                {socials.twitter && (
                  <SocialButton
                    icon={<Twitter size={18} color="#FFF" />}
                    label={`@${socials.twitter}`}
                    bg={Colors.palette.evergreen}
                    onPress={() =>
                      openSocial(`https://x.com/${socials.twitter}`)
                    }
                  />
                )}
                {socials.tiktok && (
                  <SocialButton
                    icon={<Text style={styles.ttIcon}>TT</Text>}
                    label={`@${socials.tiktok}`}
                    bg={Colors.light.text}
                    onPress={() =>
                      openSocial(`https://tiktok.com/@${socials.tiktok}`)
                    }
                  />
                )}
              </View>
            )}
          </Section>

          <Section
            title="Interests"
            onPress={() => router.push("/edit-profile")}
          >
            {profile.people.every((p) => !p.interests || p.interests.length === 0) ? (
              <Pressable
                onPress={() => router.push("/edit-profile")}
                style={({ pressed }) => [
                  styles.addSocialBtn,
                  pressed && { opacity: 0.85 },
                ]}
                testID="add-interests"
              >
                <Plus size={14} color={Colors.palette.evergreen} />
                <Text style={styles.addSocialText}>Add interests</Text>
              </Pressable>
            ) : (
              <View style={styles.interestsSection}>{profile.people.map((p, i) => {
                const list = p.interests ?? [];
                if (list.length === 0) return null;
                return (
                  <View key={i} style={{ gap: 8 }}>
                    <View style={styles.interestsWrap}>
                      {list.map((it) => (
                        <View key={it} style={styles.interestChip}>
                          <Heart
                            size={11}
                            color={Colors.palette.coral}
                            fill={Colors.palette.coral}
                          />
                          <Text style={styles.interestChipText}>{it}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}</View>
            )}
          </Section>
          {false && (
            <Section title="Interests">
              <View />
            </Section>
          )}

          <Section
            title="Prompts"
            onPress={() => router.push("/edit-profile")}
          >
            {profile.people.every(
              (p) => (!p.prompts || p.prompts.length === 0) && !p.voicePrompt
            ) ? (
              <Pressable
                onPress={() => router.push("/edit-profile")}
                style={({ pressed }) => [
                  styles.addSocialBtn,
                  pressed && { opacity: 0.85 },
                ]}
                testID="add-prompts"
              >
                <Plus size={14} color={Colors.palette.evergreen} />
                <Text style={styles.addSocialText}>Add a prompt</Text>
              </Pressable>
            ) : (
              <View style={styles.promptsWrap}>{profile.people.map((p, i) => (
                <View key={i} style={{ gap: 10 }}>
                  {p.voicePrompt && (
                    <MyVoicePromptCard
                      voice={p.voicePrompt}
                      name={p.name}
                    />
                  )}
                  {p.prompts?.map((pr, idx) => (
                    <MyPromptCard key={idx} prompt={pr} />
                  ))}
                </View>
              ))}</View>
            )}
          </Section>
          {false && (
            <Section title="Prompts">
              <View />
            </Section>
          )}

          <Section
            title="Photos"
            onPress={() => router.push("/edit-profile")}
          >
            <View style={styles.photosSection}>
              {profile.people.map((p, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {(p.photos ?? [p.photo]).map((uri, idx) => (
                      <Image
                        key={idx}
                        source={{ uri }}
                        style={styles.photoThumb}
                        contentFit="cover"
                      />
                    ))}
                  </ScrollView>
                </View>
              ))}
            </View>
          </Section>

          <Section
            title="Location"
            onPress={() => router.push("/edit-profile")}
          >
            <Row
              label="City"
              value={profile.location.city}
              icon={<MapPin size={16} color={Colors.light.textMuted} />}
              onPress={() => router.push("/edit-profile")}
            />
          </Section>

          <Section
            title="Looking to connect"
            onPress={() => router.push("/edit-profile")}
          >
            <Row
              label="Mode"
              value={profile.lookingFor}
              onPress={() => router.push("/edit-profile")}
            />
            <Row
              label="Preferences"
              value={profile.preferences.join(" \u00b7 ")}
              onPress={() => router.push("/edit-profile")}
            />
          </Section>

          <Section
            title="Details"
            onPress={() => router.push("/edit-profile")}
          >
            {profile.people.map((p, i) => (
              <View key={i} style={styles.detailBlock}>
                <Text style={styles.detailName}>{p.name}</Text>
                <Row
                  label="Age"
                  value={String(p.age)}
                  onPress={() => router.push("/edit-profile")}
                />
                <Row
                  label="Gender"
                  value={p.gender}
                  onPress={() => router.push("/edit-profile")}
                />
                <Row
                  label="Race"
                  value={p.race}
                  onPress={() => router.push("/edit-profile")}
                />
              </View>
            ))}
          </Section>

          <Section title="Safety & legal">
            <Row
              label="Policies and account controls"
              value="Open"
              icon={<Shield size={16} color={Colors.palette.evergreen} />}
              onPress={() => router.push("/safety-legal")}
            />
            <Row
              label="Privacy, terms, support"
              value="MVP"
              icon={<FileText size={16} color={Colors.palette.evergreen} />}
              onPress={() => router.push("/safety-legal")}
            />
          </Section>

          <Pressable
            onPress={confirmSignOut}
            style={({ pressed }) => [
              styles.signOut,
              pressed && { opacity: 0.8 },
            ]}
            testID="signout-btn"
          >
            <LogOut color={Colors.palette.danger} size={18} />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <InvitePartnerModal
        visible={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSubmit={(email, name) => {
          invitePartner(email, name);
          setInviteOpen(false);
          Alert.alert(
            "Invite sent \ud83c\udf4d",
            `We emailed a link to ${email}. They'll show up here as Pending until they accept.`
          );
        }}
      />
    </View>
  );
}

function ConnectedAccounts({
  ownerEmail,
  primaryName,
  primaryPhoto,
  partners,
  onResend,
  onAccept,
  onCopyLink,
  onRemove,
  onAdd,
}: {
  ownerEmail?: string;
  primaryName?: string;
  primaryPhoto?: string;
  partners: LinkedPartner[];
  onResend: (lp: LinkedPartner) => void;
  onAccept: (lp: LinkedPartner) => void;
  onCopyLink: (lp: LinkedPartner) => void;
  onRemove: (lp: LinkedPartner) => void;
  onAdd: () => void;
}) {
  return (
    <View style={styles.connectedWrap}>
      <View style={styles.connectedPrimary}>
        {primaryPhoto ? (
          <Image
            source={{ uri: primaryPhoto }}
            style={styles.connectedAvatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.connectedAvatar, styles.connectedAvatarPh]}>
            <Text style={styles.connectedAvatarPhText}>
              {(primaryName ?? "Y").slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.connectedName} numberOfLines={1}>
            {primaryName ?? "You"}
          </Text>
          <Text style={styles.connectedEmail} numberOfLines={1}>
            {ownerEmail ?? "Primary account"}
          </Text>
        </View>
        <View style={styles.connectedBadgeYou}>
          <Text style={styles.connectedBadgeYouText}>You</Text>
        </View>
      </View>

      {partners.length === 0 ? (
        <View style={styles.emptyPartner}>
          <Text style={styles.emptyPartnerText}>
            No linked partners yet. Invite someone to share this account.
          </Text>
        </View>
      ) : (
        partners.map((lp) => (
          <PartnerRow
            key={lp.id}
            lp={lp}
            onResend={() => onResend(lp)}
            onAccept={() => onAccept(lp)}
            onCopyLink={() => onCopyLink(lp)}
            onRemove={() => onRemove(lp)}
          />
        ))
      )}

      <Pressable
        onPress={onAdd}
        style={({ pressed }) => [
          styles.inviteBtn,
          pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
        ]}
        testID="invite-partner-btn"
      >
        <UserPlus size={16} color="#FFF" />
        <Text style={styles.inviteBtnText}>Invite a partner</Text>
      </Pressable>
    </View>
  );
}

function PartnerRow({
  lp,
  onResend,
  onAccept,
  onCopyLink,
  onRemove,
}: {
  lp: LinkedPartner;
  onResend: () => void;
  onAccept: () => void;
  onCopyLink: () => void;
  onRemove: () => void;
}) {
  const pending = lp.status === "pending";
  return (
    <View style={styles.partnerRow}>
      <View style={styles.partnerTop}>
        {lp.photo ? (
          <Image
            source={{ uri: lp.photo }}
            style={styles.connectedAvatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.connectedAvatar, styles.connectedAvatarPh]}>
            <Text style={styles.connectedAvatarPhText}>
              {(lp.displayName ?? lp.email).slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.connectedName} numberOfLines={1}>
            {lp.displayName ?? "Partner"}
          </Text>
          <View style={styles.emailRow}>
            <Mail size={11} color={Colors.light.textMuted} />
            <Text style={styles.connectedEmail} numberOfLines={1}>
              {lp.email}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusPill,
            pending ? styles.statusPending : styles.statusLinked,
          ]}
        >
          {pending ? (
            <Send size={10} color={Colors.palette.coralDeep} />
          ) : (
            <Check size={10} color={Colors.palette.sage} />
          )}
          <Text
            style={[
              styles.statusText,
              {
                color: pending
                  ? Colors.palette.coralDeep
                  : Colors.palette.sage,
              },
            ]}
          >
            {pending ? "Pending" : "Linked"}
          </Text>
        </View>
      </View>

      {pending && (
        <View style={styles.codeBox}>
          <Link2 size={13} color={Colors.palette.evergreen} />
          <Text style={styles.codeLabel}>Invite code</Text>
          <Text style={styles.codeValue}>{lp.inviteCode}</Text>
        </View>
      )}

      <View style={styles.partnerActions}>
        {pending ? (
          <>
            <ActionBtn
              icon={<Send size={13} color="#FFF" />}
              label="Resend"
              onPress={onResend}
              bg={Colors.palette.evergreen}
            />
            <ActionBtn
              icon={<Copy size={13} color={Colors.palette.evergreen} />}
              label="Copy link"
              onPress={onCopyLink}
              bg={Colors.light.surfaceAlt}
              fg={Colors.palette.evergreen}
            />
            <ActionBtn
              icon={<Check size={13} color="#FFF" />}
              label="Mark linked"
              onPress={onAccept}
              bg={Colors.palette.sage}
            />
          </>
        ) : (
          <ActionBtn
            icon={<Trash2 size={13} color={Colors.palette.danger} />}
            label="Unlink"
            onPress={onRemove}
            bg="transparent"
            fg={Colors.palette.danger}
            bordered
          />
        )}
      </View>
    </View>
  );
}

function ActionBtn({
  icon,
  label,
  onPress,
  bg,
  fg,
  bordered,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  bg: string;
  fg?: string;
  bordered?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        {
          backgroundColor: bg,
          borderWidth: bordered ? 1 : 0,
          borderColor: Colors.palette.danger,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      {icon}
      <Text style={[styles.actionBtnText, { color: fg ?? "#FFF" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function InvitePartnerModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string, name?: string) => void;
}) {
  const [email, setEmail] = React.useState<string>("");
  const [name, setName] = React.useState<string>("");

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = () => {
    if (!valid) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    onSubmit(email.trim(), name.trim() || undefined);
    setEmail("");
    setName("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: Colors.light.background }}
      >
        <View style={styles.inviteHeader}>
          <Text style={styles.inviteTitle}>Invite a partner</Text>
          <Pressable onPress={onClose} hitSlop={10} testID="close-invite">
            <X color={Colors.light.text} size={22} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 14 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.inviteBlurb}>
            We&apos;ll email a secure link they can tap to connect to your account.
          </Text>

          <Text style={styles.inviteLabel}>Partner&apos;s name (optional)</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Sam"
            placeholderTextColor={Colors.light.textMuted}
            style={styles.inviteInput}
            autoCapitalize="words"
          />

          <Text style={styles.inviteLabel}>Partner&apos;s email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            placeholderTextColor={Colors.light.textMuted}
            style={styles.inviteInput}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            onPress={submit}
            disabled={!valid}
            style={({ pressed }) => [
              styles.inviteSubmit,
              !valid && { opacity: 0.45 },
              pressed && valid && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}
            testID="submit-invite"
          >
            <Send color="#FFF" size={16} />
            <Text style={styles.inviteSubmitText}>Send invite link</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function MyPromptCard({ prompt }: { prompt: PromptAnswer }) {
  return (
    <View style={styles.myPromptCard}>
      <View style={styles.myPromptIcon}>
        <Quote size={12} color={Colors.palette.evergreen} />
      </View>
      <Text style={styles.myPromptQ}>{prompt.question}</Text>
      <Text style={styles.myPromptA}>{prompt.answer || "—"}</Text>
    </View>
  );
}

function MyVoicePromptCard({
  voice,
  name,
}: {
  voice: VoicePrompt;
  name: string;
}) {
  const player = useAudioPlayer({ uri: voice.uri });
  const status = useAudioPlayerStatus(player);
  const seconds = Math.max(1, Math.round(voice.durationMs / 1000));

  const toggle = () => {
    if (status.playing) {
      player.pause();
    } else {
      if (status.didJustFinish || status.currentTime >= status.duration) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  const progress =
    status.duration > 0 ? status.currentTime / status.duration : 0;

  return (
    <View style={styles.myVoiceCard}>
      <View style={styles.myVoiceTop}>
        <View style={styles.myVoiceBadge}>
          <Mic size={11} color="#FFF" />
          <Text style={styles.myVoiceBadgeText}>Voice</Text>
        </View>
        <Text style={styles.myVoiceName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.myVoiceLen}>{seconds}s</Text>
      </View>
      <Text style={styles.myVoiceQ} numberOfLines={2}>
        {voice.question}
      </Text>
      <View style={styles.myVoiceRow}>
        <Pressable
          onPress={toggle}
          style={({ pressed }) => [
            styles.myVoicePlay,
            pressed && { opacity: 0.85 },
          ]}
          testID={`my-voice-play-${name}`}
        >
          {status.playing ? (
            <Pause size={16} color="#FFF" fill="#FFF" />
          ) : (
            <Play size={16} color="#FFF" fill="#FFF" />
          )}
        </Pressable>
        <View style={styles.myVoiceTrack}>
          <View
            style={[
              styles.myVoiceFill,
              { width: `${Math.max(3, Math.min(100, progress * 100))}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function PersonCard({
  person,
  polyType,
}: {
  person: PersonProfile;
  polyType?: PolyamoryType;
}) {
  const fruit = getPolyFruit(polyType);
  return (
    <View style={styles.personCard}>
      <Image
        source={{ uri: person.photo }}
        style={styles.personImg}
        contentFit="cover"
      />
      {fruit && polyType && (
        <View style={[styles.fruitBadge, { backgroundColor: fruit.color }]}>
          <Text style={styles.fruitBadgeEmoji}>{fruit.emoji}</Text>
          <Text style={styles.fruitBadgeText} numberOfLines={1}>
            {polyType}
          </Text>
        </View>
      )}
      <View style={styles.personInfo}>
        <Text style={styles.personName}>
          {person.name}, {person.age}
        </Text>
        <Text style={styles.personMeta} numberOfLines={1}>
          {person.gender}
        </Text>
      </View>
    </View>
  );
}

function Section({
  title,
  children,
  onPress,
}: {
  title: string;
  children: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onPress && (
          <Pressable
            onPress={onPress}
            hitSlop={10}
            style={({ pressed }) => [
              styles.sectionEditBtn,
              pressed && { opacity: 0.7 },
            ]}
            testID={`edit-${title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Pencil size={10} color={Colors.palette.evergreen} />
            <Text style={styles.sectionEditText}>Edit</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Row({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onPress?: () => void;
}) {
  const Container: React.ComponentType<any> = onPress ? Pressable : View;
  return (
    <Container
      onPress={onPress}
      style={({ pressed }: { pressed?: boolean }) => [
        styles.row,
        pressed && onPress ? { backgroundColor: Colors.light.surfaceAlt } : null,
      ]}
    >
      <View style={styles.rowLeft}>
        {icon}
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
        <ChevronRight size={16} color={Colors.light.textMuted} />
      </View>
    </Container>
  );
}

function SocialButton({
  icon,
  label,
  bg,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialBtn,
        { backgroundColor: bg },
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      {icon}
      <Text style={styles.socialBtnText} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: "800" as const,
    color: Colors.light.text,
    letterSpacing: -0.8,
  },
  heroRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
  },
  personCardWrap: {
    flex: 1,
  },
  personCard: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.light.surface,
  },
  personImg: { ...StyleSheet.absoluteFillObject },
  personInfo: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: "rgba(31,19,32,0.75)",
  },
  personName: { color: "#FFF", fontWeight: "800" as const, fontSize: 16 },
  fruitBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    maxWidth: "90%",
  },
  fruitBadgeEmoji: { fontSize: 12 },
  fruitBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
  personMeta: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600" as const,
    marginTop: 2,
  },
  coupleBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.light.accent,
  },
  coupleBannerText: {
    color: "#FFF",
    fontWeight: "700" as const,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  slotsCard: {
    marginHorizontal: 24,
    marginTop: 18,
    padding: 18,
    borderRadius: 20,
    overflow: "hidden",
  },
  slotsTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  slotsLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "800" as const,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  slotsValue: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800" as const,
    marginTop: 4,
    letterSpacing: -0.4,
  },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.palette.honey,
  },
  upgradeBtnText: {
    color: Colors.light.accent,
    fontSize: 12,
    fontWeight: "800" as const,
  },
  slotsBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  slotsBarFill: {
    height: "100%",
    backgroundColor: Colors.palette.coral,
    borderRadius: 3,
  },
  slotsHint: {
    marginTop: 10,
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  superCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 24,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  superIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.palette.evergreen,
    alignItems: "center",
    justifyContent: "center",
  },
  superTitle: {
    fontSize: 15,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  superSub: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
    marginTop: 2,
  },
  planActiveCard: {
    marginHorizontal: 24,
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
  },
  planActiveTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planActiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  planActiveBadgeText: {
    color: "#FFF",
    fontWeight: "900" as const,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  planActivePrice: {
    color: "#FFF",
    fontWeight: "900" as const,
    fontSize: 14,
  },
  planActiveTagline: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600" as const,
    fontSize: 12,
    marginTop: 8,
  },
  planActiveActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  planManageBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },
  planManageText: {
    color: "#FFF",
    fontWeight: "800" as const,
    fontSize: 13,
  },
  planCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
  },
  planCancelText: {
    color: "#FFF",
    fontWeight: "700" as const,
    fontSize: 13,
  },
  planPromoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 24,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.palette.evergreen,
  },
  planPromoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  planPromoTitle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800" as const,
  },
  planPromoSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600" as const,
    marginTop: 2,
  },
  boostCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 24,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.palette.coral,
  },
  boostIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  boostTitle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800" as const,
  },
  boostSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600" as const,
    marginTop: 2,
  },
  bioCard: {
    padding: 16,
  },
  bioText: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  socialHub: {
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    maxWidth: "100%",
  },
  socialBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800" as const,
  },
  ttIcon: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900" as const,
    letterSpacing: -0.5,
  },
  photosSection: {
    padding: 12,
  },
  photosHeader: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: Colors.light.accent,
    letterSpacing: 0.3,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  photoThumb: {
    width: 100,
    height: 130,
    borderRadius: 12,
    backgroundColor: Colors.light.surfaceAlt,
  },
  section: { paddingHorizontal: 24, marginTop: 22 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.light.surfaceAlt,
  },
  sectionEditText: {
    fontSize: 10,
    fontWeight: "800" as const,
    color: Colors.palette.evergreen,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
  },
  addSocialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.palette.evergreen,
    margin: 12,
  },
  addSocialText: {
    fontSize: 13,
    fontWeight: "800" as const,
    color: Colors.palette.evergreen,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: Colors.light.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.line,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.line,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowLabel: {
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    justifyContent: "flex-end",
    maxWidth: "60%",
  },
  rowValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "700" as const,
  },
  detailBlock: {
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.line,
  },
  detailName: {
    fontSize: 13,
    fontWeight: "800" as const,
    color: Colors.light.accent,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 28,
    marginHorizontal: 24,
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.palette.danger,
  },
  editPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.palette.evergreen,
  },
  editPillText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
  promptsWrap: {
    padding: 12,
    gap: 14,
  },
  myPromptCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceAlt,
  },
  myPromptIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  myPromptQ: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: Colors.palette.evergreen,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  myPromptA: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    fontWeight: "500" as const,
  },
  myVoiceCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.palette.evergreen,
    gap: 8,
  },
  myVoiceTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  myVoiceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.palette.coral,
  },
  myVoiceBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900" as const,
    letterSpacing: 0.6,
  },
  myVoiceName: {
    flex: 1,
    color: "#FFF",
    fontWeight: "800" as const,
    fontSize: 13,
  },
  myVoiceLen: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  myVoiceQ: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 19,
  },
  myVoiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  myVoicePlay: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.palette.coral,
    alignItems: "center",
    justifyContent: "center",
  },
  myVoiceTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  myVoiceFill: {
    height: "100%",
    backgroundColor: Colors.palette.honey,
    borderRadius: 3,
  },
  interestsSection: {
    padding: 12,
    gap: 14,
  },
  interestsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.light.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  interestChipText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: "700" as const,
  },
  connectedWrap: {
    padding: 12,
    gap: 10,
  },
  connectedPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceAlt,
  },
  connectedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.line,
  },
  connectedAvatarPh: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.palette.evergreenSoft,
  },
  connectedAvatarPhText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900" as const,
  },
  connectedName: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  connectedEmail: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
    marginTop: 2,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  connectedBadgeYou: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.palette.evergreen,
  },
  connectedBadgeYouText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900" as const,
    letterSpacing: 0.6,
  },
  emptyPartner: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceAlt,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  emptyPartnerText: {
    fontSize: 13,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  partnerRow: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceAlt,
    gap: 10,
  },
  partnerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPending: {
    backgroundColor: "rgba(232,116,97,0.16)",
  },
  statusLinked: {
    backgroundColor: "rgba(111,138,115,0.2)",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900" as const,
    letterSpacing: 0.5,
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: Colors.light.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  codeValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "900" as const,
    color: Colors.palette.evergreen,
    letterSpacing: 2,
    fontVariant: ["tabular-nums"],
  },
  partnerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "800" as const,
    letterSpacing: 0.2,
  },
  inviteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.palette.coral,
    marginTop: 4,
  },
  inviteBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
  inviteHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.line,
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  inviteBlurb: {
    fontSize: 14,
    color: Colors.light.textMuted,
    lineHeight: 20,
    fontWeight: "500" as const,
  },
  inviteLabel: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: Colors.light.textMuted,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginTop: 4,
  },
  inviteInput: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.line,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 15,
    color: Colors.light.text,
  },
  inviteSubmit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.palette.evergreen,
  },
  inviteSubmitText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
});

