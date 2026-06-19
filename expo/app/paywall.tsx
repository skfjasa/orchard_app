import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  Check,
  Crown,
  Flame,
  Heart,
  Sparkles,
  X,
  Zap,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SuperLikeIcon from "@/components/SuperLikeIcon";
import { Button } from "@/components/ui";
import Colors from "@/constants/colors";
import { useProfile } from "@/providers/profile-provider";
import {
  BOOST_DURATION_MS,
  DEFAULT_SUPER_LIKES,
  PURCHASE_OPTIONS,
  PurchaseId,
  PurchaseOption,
  SUBSCRIPTION_OPTIONS,
  SubscriptionId,
  SubscriptionOption,
} from "@/types";

type Tab = "once" | "subscribe";
type Selection =
  | { kind: "purchase"; id: PurchaseId }
  | { kind: "subscription"; id: SubscriptionId };

export default function PaywallScreen() {
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const {
    purchase,
    subscribe,
    totalSlots,
    slotsUsed,
    superLikeBalance,
    subscription,
  } = useProfile();

  const isSuperReason = reason === "superlikes";
  const isBoostReason = reason === "boost";
  const isLimitReason = reason === "limit";

  const initialTab: Tab = "once";
  const [tab, setTab] = useState<Tab>(initialTab);

  const initialPurchaseId: PurchaseId = isBoostReason
    ? "boost"
    : isSuperReason
    ? "superlikes_refill"
    : "slots_5";

  const [selection, setSelection] = useState<Selection>({
    kind: "purchase",
    id: initialPurchaseId,
  });

  const selectedPurchase = useMemo(
    () =>
      selection.kind === "purchase"
        ? PURCHASE_OPTIONS.find((p) => p.id === selection.id) ??
          PURCHASE_OPTIONS[0]
        : null,
    [selection]
  );
  const selectedSubscription = useMemo(
    () =>
      selection.kind === "subscription"
        ? SUBSCRIPTION_OPTIONS.find((p) => p.id === selection.id) ??
          SUBSCRIPTION_OPTIONS[0]
        : null,
    [selection]
  );

  const ctaLabel = selectedPurchase
    ? `Continue \u2014 ${selectedPurchase.price}`
    : selectedSubscription
    ? `Subscribe \u2014 ${selectedSubscription.price}/mo`
    : "Continue";

  const handleConfirm = () => {
    if (selection.kind === "purchase") {
      console.log("[paywall] purchase", selection.id);
      purchase(selection.id);
      const label =
        selection.id === "boost"
          ? "Boost active for 24 hours \u2014 you\u2019re trending now."
          : selection.id === "slots_5"
          ? "5 extra match slots added."
          : selection.id === "slots_15"
          ? "15 extra match slots added."
          : selection.id === "superlikes_refill"
          ? "Your Super Likes are refilled to 5."
          : "10 Super Likes added to your account.";
      Alert.alert("You\u2019re set!", label, [
        { text: "Nice", onPress: () => router.back() },
      ]);
      return;
    }
    console.log("[paywall] subscribe", selection.id);
    subscribe(selection.id);
    const plan = SUBSCRIPTION_OPTIONS.find((s) => s.id === selection.id);
    Alert.alert(
      "Welcome to " + (plan?.title ?? "Orchard"),
      "Your monthly perks have been added. Enjoy!",
      [{ text: "Let\u2019s go", onPress: () => router.back() }]
    );
  };

  const heroTitle = isBoostReason
    ? "Light up your profile"
    : isSuperReason
    ? "Out of Super Likes"
    : isLimitReason
    ? "You\u2019ve reached 5 matches"
    : "Level up your Orchard";

  const heroSub = isBoostReason
    ? "Be the first profile people see in your area for 24 hours."
    : isSuperReason
    ? "Refill now, or stock up. Your 5 free Super Likes recharge 30 days after your last use."
    : isLimitReason
    ? "Swipe all you like \u2014 free. Unlock more active match slots to keep connecting."
    : "Unlimited swipes, intentional connections. Pick a one-time boost or go all-in with a monthly plan.";

  return (
    <>
      <Stack.Screen
        options={{ headerShown: false, presentation: "modal" }}
      />
      <View style={styles.root}>
        <LinearGradient
          colors={[Colors.palette.evergreen, Colors.palette.evergreenSoft]}
          style={styles.hero}
        >
          <Pressable
            style={styles.closeBtn}
            onPress={() => router.back()}
            hitSlop={16}
            testID="paywall-close"
          >
            <X color="#FFF" size={20} />
          </Pressable>
          <View style={styles.heroIcon}>
            {isBoostReason ? (
              <Flame color={Colors.palette.honey} size={28} />
            ) : isSuperReason ? (
              <SuperLikeIcon size={28} color={Colors.palette.honey} />
            ) : isLimitReason ? (
              <Heart
                color={Colors.palette.coral}
                size={28}
                fill={Colors.palette.coral}
              />
            ) : (
              <Crown color={Colors.palette.honey} size={28} />
            )}
          </View>
          <Text style={styles.heroTitle}>{heroTitle}</Text>
          <Text style={styles.heroSub}>{heroSub}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Heart
                size={11}
                color="#FFF"
                fill={Colors.palette.coral}
              />
              <Text style={styles.statNum}>
                {slotsUsed}/{totalSlots}
              </Text>
              <Text style={styles.statLabel}>slots</Text>
            </View>
            <View style={styles.statPill}>
              <SuperLikeIcon size={11} color="#FFF" />
              <Text style={styles.statNum}>{superLikeBalance}</Text>
              <Text style={styles.statLabel}>super likes</Text>
            </View>
            {subscription && (
              <View style={[styles.statPill, styles.statPillActive]}>
                <Crown size={11} color={Colors.light.accent} />
                <Text
                  style={[styles.statNum, { color: Colors.light.accent }]}
                >
                  {subscription.id === "pro" ? "Pro" : "Plus"}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.tabs}>
          <TabButton
            label="One-time"
            active={tab === "once"}
            onPress={() => setTab("once")}
            testID="tab-once"
          />
          <TabButton
            label="Monthly"
            active={tab === "subscribe"}
            onPress={() => setTab("subscribe")}
            testID="tab-subscribe"
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {tab === "once" ? (
            <>
              <SectionLabel text="Super Likes" />
              {PURCHASE_OPTIONS.filter(
                (o) => o.category === "superlikes"
              ).map((opt) => (
                <PurchaseCard
                  key={opt.id}
                  option={opt}
                  selected={
                    selection.kind === "purchase" && selection.id === opt.id
                  }
                  onPress={() =>
                    setSelection({ kind: "purchase", id: opt.id })
                  }
                />
              ))}

              <SectionLabel text="Match Slots" />
              {PURCHASE_OPTIONS.filter((o) => o.category === "slots").map(
                (opt) => (
                  <PurchaseCard
                    key={opt.id}
                    option={opt}
                    selected={
                      selection.kind === "purchase" && selection.id === opt.id
                    }
                    onPress={() =>
                      setSelection({ kind: "purchase", id: opt.id })
                    }
                  />
                )
              )}

              <SectionLabel text="Boost" />
              {PURCHASE_OPTIONS.filter((o) => o.category === "boost").map(
                (opt) => (
                  <PurchaseCard
                    key={opt.id}
                    option={opt}
                    selected={
                      selection.kind === "purchase" && selection.id === opt.id
                    }
                    onPress={() =>
                      setSelection({ kind: "purchase", id: opt.id })
                    }
                  />
                )
              )}
            </>
          ) : (
            <>
              <SectionLabel text="Monthly Plans" />
              {SUBSCRIPTION_OPTIONS.map((plan) => (
                <SubscriptionCard
                  key={plan.id}
                  plan={plan}
                  selected={
                    selection.kind === "subscription" &&
                    selection.id === plan.id
                  }
                  isCurrent={subscription?.id === plan.id}
                  onPress={() =>
                    setSelection({ kind: "subscription", id: plan.id })
                  }
                />
              ))}
              <Text style={styles.subNote}>
                Auto-renews monthly. Cancel anytime.
              </Text>
            </>
          )}

          <View style={styles.benefits}>
            <Text style={styles.benefitsTitle}>Why Orchard</Text>
            <Benefit
              text={`Every profile starts with ${DEFAULT_SUPER_LIKES} Super Likes \u00b7 recharges 30 days after last use`}
            />
            <Benefit text="Unlimited swipes, always free" />
            <Benefit text="Mirrored feeds for couples" />
          </View>

          <Text style={styles.disclaimer}>
            This is a demo. No real payment will be processed.
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={ctaLabel}
            onPress={handleConfirm}
            testID="paywall-confirm"
          />
        </View>
      </View>
    </>
  );
}

function TabButton({
  label,
  active,
  onPress,
  testID,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.tabBtn,
        active && styles.tabBtnActive,
        pressed && { opacity: 0.9 },
      ]}
    >
      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

function PurchaseCard({
  option,
  selected,
  onPress,
}: {
  option: PurchaseOption;
  selected: boolean;
  onPress: () => void;
}) {
  const isBoost = option.category === "boost";
  const isSuper = option.category === "superlikes";
  const isBest = option.id === "slots_15" || option.id === "superlikes_10";

  const iconBg = isBoost
    ? Colors.palette.honey
    : isSuper
    ? Colors.palette.evergreen
    : isBest
    ? Colors.palette.coral
    : Colors.light.surfaceAlt;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && { opacity: 0.95 },
      ]}
      testID={`option-${option.id}`}
    >
      <View style={[styles.cardIcon, { backgroundColor: iconBg }]}>
        {isBoost ? (
          <Zap color="#FFF" size={20} fill="#FFF" />
        ) : isSuper ? (
          <SuperLikeIcon size={20} color="#FFF" />
        ) : isBest ? (
          <Sparkles color="#FFF" size={20} />
        ) : (
          <Heart
            color={Colors.light.accent}
            size={18}
            fill={Colors.light.accent}
          />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{option.title}</Text>
          {isBest && (
            <View style={styles.bestTag}>
              <Text style={styles.bestTagText}>BEST VALUE</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardSub}>{option.subtitle}</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.cardPrice}>{option.price}</Text>
        <View
          style={[
            styles.radio,
            selected && {
              backgroundColor: Colors.light.accent,
              borderColor: Colors.light.accent,
            },
          ]}
        >
          {selected && <Check color="#FFF" size={14} strokeWidth={3} />}
        </View>
      </View>
    </Pressable>
  );
}

function SubscriptionCard({
  plan,
  selected,
  isCurrent,
  onPress,
}: {
  plan: SubscriptionOption;
  selected: boolean;
  isCurrent: boolean;
  onPress: () => void;
}) {
  const accent =
    plan.accent === "coral" ? Colors.palette.coral : Colors.palette.evergreen;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.planCard,
        selected && { borderColor: accent },
        pressed && { opacity: 0.96 },
      ]}
      testID={`plan-${plan.id}`}
    >
      <View style={styles.planTop}>
        <View style={[styles.planBadge, { backgroundColor: accent }]}>
          <Crown size={13} color="#FFF" />
          <Text style={styles.planBadgeText}>{plan.title}</Text>
        </View>
        {isCurrent && (
          <View style={styles.currentTag}>
            <Text style={styles.currentTagText}>CURRENT</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        <View
          style={[
            styles.radio,
            selected && {
              backgroundColor: accent,
              borderColor: accent,
            },
          ]}
        >
          {selected && <Check color="#FFF" size={14} strokeWidth={3} />}
        </View>
      </View>
      <Text style={styles.planTagline}>{plan.tagline}</Text>
      <View style={styles.priceRow}>
        <Text style={[styles.planPrice, { color: accent }]}>{plan.price}</Text>
        <Text style={styles.planPeriod}>/month</Text>
      </View>
      <View style={styles.perksList}>
        {plan.perks.map((perk, i) => (
          <View key={i} style={styles.perkRow}>
            <View style={[styles.perkDot, { backgroundColor: accent + "22" }]}>
              <Check size={11} color={accent} strokeWidth={3} />
            </View>
            <Text style={styles.perkText}>{perk}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitDot}>
        <Check size={12} color={Colors.palette.sage} strokeWidth={3} />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  hero: {
    paddingTop: 56,
    paddingBottom: 22,
    paddingHorizontal: 24,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "800" as const,
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  heroSub: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 15,
    marginTop: 8,
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    flexWrap: "wrap",
  },
  statPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statPillActive: {
    backgroundColor: Colors.palette.honey,
  },
  statNum: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800" as const,
  },
  statLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 14,
    padding: 4,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceAlt,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: Colors.light.surface,
    shadowColor: "#1F1320",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: "800" as const,
    color: Colors.light.textMuted,
    letterSpacing: 0.3,
  },
  tabBtnTextActive: {
    color: Colors.light.text,
  },
  content: { padding: 20, paddingBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900" as const,
    color: Colors.light.textMuted,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: Colors.light.surface,
    borderWidth: 2,
    borderColor: Colors.light.line,
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: Colors.light.accent,
    backgroundColor: Colors.light.surfaceAlt,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  cardSub: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 3,
    fontWeight: "600" as const,
  },
  cardRight: { alignItems: "flex-end", gap: 6 },
  cardPrice: {
    fontSize: 15,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.light.line,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  bestTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.palette.honey,
  },
  bestTagText: {
    color: Colors.light.accent,
    fontSize: 9,
    fontWeight: "900" as const,
    letterSpacing: 0.6,
  },
  planCard: {
    padding: 18,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.light.line,
    backgroundColor: Colors.light.surface,
    marginBottom: 12,
  },
  planTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  planBadgeText: {
    color: "#FFF",
    fontWeight: "900" as const,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  currentTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.palette.sage,
  },
  currentTagText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900" as const,
    letterSpacing: 0.6,
  },
  planTagline: {
    fontSize: 13,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 10,
    marginBottom: 14,
  },
  planPrice: {
    fontSize: 30,
    fontWeight: "900" as const,
    letterSpacing: -1,
  },
  planPeriod: {
    fontSize: 13,
    color: Colors.light.textMuted,
    fontWeight: "700" as const,
  },
  perksList: { gap: 8 },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  perkDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  perkText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: "600" as const,
    flex: 1,
  },
  subNote: {
    fontSize: 11,
    color: Colors.light.textMuted,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "600" as const,
  },
  benefits: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceAlt,
  },
  benefitsTitle: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: Colors.light.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  benefitDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(111,138,115,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: "600" as const,
    flex: 1,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.light.textMuted,
    textAlign: "center",
    marginTop: 14,
    fontWeight: "600" as const,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.line,
    backgroundColor: Colors.light.background,
  },
});

export { BOOST_DURATION_MS };
