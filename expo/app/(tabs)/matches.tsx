import { Image } from "expo-image";
import { router } from "expo-router";
import { Heart, Users } from "lucide-react-native";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { MOCK_PROFILES } from "@/mocks/profiles";
import { useProfile } from "@/providers/profile-provider";
import { Profile } from "@/types";

export default function MatchesScreen() {
  const { knownProfiles, likedIds, newMatchIds } = useProfile();

  const matches = useMemo(
    () =>
      likedIds
        .map(
          (id) =>
            knownProfiles.find((p) => p.id === id) ??
            MOCK_PROFILES.find((p) => p.id === id)
        )
        .filter((p): p is Profile => !!p),
    [knownProfiles, likedIds]
  );

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Matches</Text>
          <Text style={styles.sub}>
            {matches.length} {matches.length === 1 ? "connection" : "connections"}
          </Text>
        </View>

        {matches.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Heart color={Colors.light.tint} size={28} />
            </View>
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptySub}>
              Start liking profiles in Discover to see them here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(m) => m.id}
            numColumns={2}
            columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
            contentContainerStyle={{ paddingBottom: 28, gap: 12 }}
            renderItem={({ item }) => (
              <MatchCard
                profile={item}
                isNew={newMatchIds.includes(item.id)}
                onPress={() => router.push(`/match/${item.id}`)}
              />
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

function MatchCard({
  isNew,
  profile,
  onPress,
}: {
  isNew: boolean;
  profile: Profile;
  onPress: () => void;
}) {
  const p = profile.people[0];
  const s = profile.people[1];
  const isCouple = profile.accountType === "couple";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isNew && styles.cardNew,
        pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] },
      ]}
    >
      {isNew && (
        <View style={styles.newTag}>
          <Text style={styles.newTagText}>New</Text>
        </View>
      )}
      <View style={styles.cardImgs}>
        <Image source={{ uri: p.photo }} style={styles.cardImg} contentFit="cover" />
        {isCouple && s && (
          <Image source={{ uri: s.photo }} style={styles.cardImg} contentFit="cover" />
        )}
      </View>
      {isCouple && (
        <View style={styles.coupleTag}>
          <Users color="#FFF" size={10} />
          <Text style={styles.coupleTagText}>Duo</Text>
        </View>
      )}
      <View style={styles.cardFooter}>
        <Text numberOfLines={1} style={styles.cardName}>
          {isCouple && s ? `${p.name} & ${s.name}` : p.name}
        </Text>
        <Text style={styles.cardCity} numberOfLines={1}>
          {profile.location.city}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 18 },
  title: {
    fontSize: 30,
    fontWeight: "800" as const,
    color: Colors.light.text,
    letterSpacing: -0.8,
  },
  sub: { fontSize: 14, color: Colors.light.textMuted, marginTop: 4 },
  card: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: Colors.light.surface,
  },
  cardNew: {
    borderWidth: 3,
    borderColor: Colors.palette.coral,
  },
  newTag: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.palette.coral,
    zIndex: 2,
  },
  newTagText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900" as const,
    letterSpacing: 0.4,
  },
  cardImgs: { ...StyleSheet.absoluteFillObject, flexDirection: "row" },
  cardImg: { flex: 1, height: "100%" },
  coupleTag: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.palette.coral,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  coupleTagText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800" as const,
    letterSpacing: 0.5,
  },
  cardFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: "rgba(31,19,32,0.78)",
  },
  cardName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700" as const,
  },
  cardCity: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "600" as const,
    marginTop: 2,
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
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
