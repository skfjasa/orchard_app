import { Image } from "expo-image";
import { router } from "expo-router";
import { Heart, MessageCircle, Users } from "lucide-react-native";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { MOCK_PROFILES } from "@/mocks/profiles";
import { useProfile } from "@/providers/profile-provider";
import { Conversation, Message, Profile } from "@/types";

interface InboxItem {
  convo: Conversation;
  other: Profile;
  lastMessage: Message | null;
}

function formatTime(t: number): string {
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function InboxScreen() {
  const { profile, knownProfiles, conversations, typingProfileIds } = useProfile();
  const isCouple = profile?.accountType === "couple";

  const items = useMemo(() => {
    return conversations
      .map<InboxItem | null>((c) => {
        const other =
          knownProfiles.find((p) => p.id === c.profileId) ??
          MOCK_PROFILES.find((p) => p.id === c.profileId);
        if (!other) return null;
        const messages = Array.isArray(c.messages) ? c.messages : [];
        const lastMessage = messages[messages.length - 1] ?? null;
        return {
          convo: { ...c, messages },
          other,
          lastMessage,
        };
      })
      .filter((x): x is InboxItem => !!x)
      .sort((a, b) => {
        const ta = a.lastMessage?.at ?? 0;
        const tb = b.lastMessage?.at ?? 0;
        return tb - ta;
      });
  }, [conversations, knownProfiles]);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Inbox</Text>
          {isCouple && (
            <View style={styles.mirrorPill}>
              <Users size={12} color={Colors.light.accent} />
              <Text style={styles.mirrorText}>Shared with {profile?.people[1]?.name ?? "partner"}</Text>
            </View>
          )}
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MessageCircle color={Colors.light.accent} size={28} />
            </View>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySub}>
              Like a profile to start a new chat.
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/discover")}
              style={({ pressed }) => [
                styles.emptyCta,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              testID="inbox-empty-cta"
            >
              <Heart color="#FFF" size={16} fill="#FFF" />
              <Text style={styles.emptyCtaText}>Find someone to chat with</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.convo.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => {
              const unread = item.convo.unread > 0;
              return (
                <View style={[styles.row, unread && styles.rowUnread]}>
                  <Pressable
                    onPress={() => router.push(`/match/${item.other.id}`)}
                    style={({ pressed }) => [
                      styles.avatarWrap,
                      pressed && { opacity: 0.76 },
                    ]}
                    testID={`inbox-profile-${item.other.id}`}
                  >
                    <Image
                      source={{ uri: item.other.people[0].photo }}
                      style={[
                        styles.avatar,
                        unread && styles.avatarUnread,
                      ]}
                      contentFit="cover"
                    />
                    {item.other.people[1] && (
                      <Image
                        source={{ uri: item.other.people[1].photo }}
                        style={[
                          styles.avatar,
                          styles.avatarSecond,
                          unread && styles.avatarUnread,
                        ]}
                        contentFit="cover"
                      />
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => router.push(`/chat/${item.other.id}`)}
                    style={({ pressed }) => [
                      styles.rowContent,
                      pressed && { opacity: 0.72 },
                    ]}
                    testID={`inbox-chat-${item.other.id}`}
                  >
                    <View style={styles.rowTop}>
                      <Text
                        style={[styles.rowName, unread && styles.rowNameUnread]}
                        numberOfLines={1}
                      >
                        {item.other.accountType === "couple"
                          ? `${item.other.people[0].name} & ${item.other.people[1]?.name}`
                          : item.other.people[0].name}
                      </Text>
                      <Text
                        style={[styles.rowTime, unread && styles.rowTimeUnread]}
                      >
                        {item.lastMessage ? formatTime(item.lastMessage.at) : ""}
                      </Text>
                    </View>
                    <View style={styles.rowBottom}>
                      {typingProfileIds.includes(item.other.id) ? (
                        <Text
                          style={[styles.rowPreview, styles.rowTyping]}
                          numberOfLines={1}
                        >
                          typing…
                        </Text>
                      ) : (
                        <Text
                          style={[
                            styles.rowPreview,
                            unread && styles.rowPreviewUnread,
                          ]}
                          numberOfLines={1}
                        >
                          {item.lastMessage?.kind === "photo"
                            ? item.lastMessage.fromMe
                              ? "🔒 You sent a photo request"
                              : "🔒 Sent you a photo request"
                            : item.lastMessage?.text ?? "Matched. Say hi."}
                        </Text>
                      )}
                      {unread && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>
                            {Math.min(item.convo.unread, 9)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 14 },
  title: {
    fontSize: 30,
    fontWeight: "800" as const,
    color: Colors.light.text,
    letterSpacing: -0.8,
  },
  mirrorPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.light.surfaceAlt,
  },
  mirrorText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.light.accent,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  rowUnread: {
    backgroundColor: "rgba(255, 107, 107, 0.08)",
    borderLeftWidth: 3,
    borderLeftColor: Colors.palette.coral,
  },
  rowContent: {
    flex: 1,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    justifyContent: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  avatarUnread: {
    borderColor: Colors.palette.coral,
  },
  avatarSecond: {
    position: "absolute",
    left: 16,
    top: 8,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    flex: 1,
  },
  rowNameUnread: {
    fontWeight: "900" as const,
  },
  rowTime: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
  },
  rowTimeUnread: {
    color: Colors.palette.coral,
    fontWeight: "900" as const,
  },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 8,
  },
  rowPreview: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textMuted,
  },
  rowPreviewUnread: {
    color: Colors.light.text,
    fontWeight: "700" as const,
  },
  rowTyping: {
    color: Colors.light.accent,
    fontStyle: "italic",
    fontWeight: "600" as const,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.palette.coral,
  },
  unreadBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "900" as const,
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
  emptyCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.palette.coral,
  },
  emptyCtaText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
});
