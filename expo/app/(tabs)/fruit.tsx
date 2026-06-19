import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Citrus, Flame, MapPin, Sparkles, Zap } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { getPolyFruit } from "@/constants/poly-fruits";
import { FRUIT_PROFILES } from "@/mocks/fruit-profiles";
import { useProfile } from "@/providers/profile-provider";
import { scoreMatch } from "@/utils/match";

export default function FruitScreen() {
  const { profile, likedIds, passedIds } = useProfile();

  const trending = useMemo(() => {
    const pool = FRUIT_PROFILES.filter(
      (p) => !likedIds.includes(p.id) && !passedIds.includes(p.id)
    );
    return pool
      .map((p) => {
        const s = profile
          ? scoreMatch(profile, p)
          : { distanceScore: 0.5, distanceKm: 0 };
        const t = p.trendingScore ?? 0.5;
        const isBoostedProfile =
          p.boostedUntil && p.boostedUntil > Date.now() ? 1 : 0;
        const combined =
          t * 0.7 + s.distanceScore * 0.3 + isBoostedProfile * 0.2;
        return { profile: p, combined, distanceKm: s.distanceKm };
      })
      .sort((a, b) => b.combined - a.combined)
      .slice(0, 10);
  }, [profile, likedIds, passedIds]);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Citrus
                size={20}
                color={Colors.palette.honey}
                strokeWidth={2.4}
              />
              <Text style={styles.kicker}>The juiciest right now</Text>
            </View>
            <Text style={styles.brand}>Fruit</Text>
          </View>
          <Pressable
            onPress={() => router.push("/paywall?reason=boost")}
            style={styles.boostBtn}
            testID="boost-yours"
          >
            <Zap size={12} color="#FFF" fill="#FFF" />
            <Text style={styles.boostBtnText}>Boost yours</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.banner}>
            <LinearGradient
              colors={[Colors.palette.coral, Colors.palette.honey]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.bannerContent}>
              <Flame size={18} color="#FFF" fill="#FFF" />
              <Text style={styles.bannerTitle}>Trending in your orchard</Text>
            </View>
            <Text style={styles.bannerSub}>
              Fresh picks, ripe for connection.
            </Text>
          </View>

          {trending.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyCircle}>
                <Citrus size={32} color={Colors.palette.honey} />
              </View>
              <Text style={styles.emptyTitle}>The basket&apos;s empty</Text>
              <Text style={styles.emptySub}>
                Check back soon for fresh trending profiles.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {trending.map((t) => {
                const p = t.profile;
                const boosted =
                  p.boostedUntil && p.boostedUntil > Date.now();
                const isCouple = p.accountType === "couple";
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/match/${p.id}`)}
                    style={({ pressed }) => [
                      styles.card,
                      pressed && { transform: [{ scale: 0.97 }] },
                    ]}
                    testID={`fruit-${p.id}`}
                  >
                    <Image
                      source={{ uri: p.people[0].photo }}
                      style={StyleSheet.absoluteFillObject}
                      contentFit="cover"
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(20,10,20,0.92)"]}
                      locations={[0.35, 1]}
                      style={StyleSheet.absoluteFillObject}
                      pointerEvents="none"
                    />
                    {boosted && (
                      <View style={styles.boostTag}>
                        <Zap size={10} color="#FFF" fill="#FFF" />
                        <Text style={styles.boostTagText}>BOOST</Text>
                      </View>
                    )}
                    <View style={styles.matchTag}>
                      <Sparkles size={10} color={Colors.palette.evergreen} />
                      <Text style={styles.matchTagText}>
                        {Math.round(t.combined * 100)}%
                      </Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName} numberOfLines={1}>
                        {isCouple && p.people[1]
                          ? `${p.people[0].name} & ${p.people[1].name}`
                          : `${p.people[0].name}, ${p.people[0].age}`}
                      </Text>
                      {(() => {
                        const fruit = getPolyFruit(p.polyType);
                        if (!fruit || !p.polyType) return null;
                        return (
                          <View
                            style={[
                              styles.polyChip,
                              { backgroundColor: fruit.color },
                            ]}
                          >
                            <Text style={styles.polyChipEmoji}>
                              {fruit.emoji}
                            </Text>
                            <Text
                              style={styles.polyChipText}
                              numberOfLines={1}
                            >
                              {p.polyType}
                            </Text>
                          </View>
                        );
                      })()}
                      <View style={styles.cardMeta}>
                        <MapPin size={11} color="rgba(255,255,255,0.85)" />
                        <Text style={styles.cardMetaText} numberOfLines={1}>
                          {p.location.city} ·{" "}
                          {Math.round(t.distanceKm)} km
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  kicker: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "700" as const,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  brand: {
    fontSize: 34,
    fontWeight: "800" as const,
    color: Colors.light.text,
    letterSpacing: -0.8,
    marginTop: 2,
  },
  boostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.palette.evergreen,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
  },
  boostBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  banner: {
    borderRadius: 20,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 18,
    minHeight: 88,
    justifyContent: "center",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800" as const,
    letterSpacing: -0.2,
  },
  bannerSub: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    fontWeight: "600" as const,
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    aspectRatio: 3 / 4.2,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: Colors.light.surface,
    shadowColor: "#1F1320",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  boostTag: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.palette.honey,
  },
  boostTagText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900" as const,
    letterSpacing: 0.4,
  },
  matchTag: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  matchTagText: {
    color: Colors.palette.evergreen,
    fontSize: 10,
    fontWeight: "800" as const,
  },
  cardInfo: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },
  cardName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800" as const,
    letterSpacing: -0.2,
  },
  polyChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 5,
    maxWidth: "100%",
  },
  polyChipEmoji: { fontSize: 10 },
  polyChipText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  cardMetaText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 11,
    fontWeight: "600" as const,
    flex: 1,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 6,
    textAlign: "center",
  },
});
