import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  Check,
  CheckCheck,
  ChevronLeft,
  ImagePlus,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Send,
  Users,
  X as XIcon,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ProtectedRoute from "@/components/navigation/ProtectedRoute";
import Colors from "@/constants/colors";
import { useCanonicalBack } from "@/hooks/use-canonical-back";
import { useProfile } from "@/providers/profile-provider";
import { Message, MessageStatus, Profile } from "@/types";

function formatClock(t: number): string {
  const d = new Date(t);
  const h = d.getHours();
  const m = d.getMinutes();
  const hh = ((h + 11) % 12) + 1;
  const mm = m < 10 ? `0${m}` : `${m}`;
  const ap = h < 12 ? "AM" : "PM";
  return `${hh}:${mm} ${ap}`;
}

function formatDivider(t: number): string {
  const d = new Date(t);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
  if (sameDay) return `Today • ${formatClock(t)}`;
  if (isYesterday) return `Yesterday • ${formatClock(t)}`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  }) + ` • ${formatClock(t)}`;
}

type Row =
  | { type: "divider"; id: string; at: number }
  | { type: "msg"; id: string; message: Message; showAuthor: boolean }
  | { type: "typing"; id: string };

const TIME_GAP_MS = 10 * 60 * 1000;

function normalizeMessages(messages: unknown): Message[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .map((message, index) => {
      if (!message || typeof message !== "object") return null;
      const raw = message as Partial<Message>;
      const at = typeof raw.at === "number" && Number.isFinite(raw.at)
        ? raw.at
        : Date.now();
      const kind = raw.kind === "photo" ? "photo" : "text";
      const text =
        typeof raw.text === "string"
          ? raw.text
          : kind === "photo"
          ? "Photo request"
          : "";

      return {
        ...raw,
        id:
          typeof raw.id === "string" && raw.id.length > 0
            ? raw.id
            : `legacy-${at}-${index}`,
        fromMe: raw.fromMe === true,
        text,
        at,
        kind,
      } as Message;
    })
    .filter((message): message is Message => !!message);
}

export default function ChatScreen() {
  return (
    <ProtectedRoute loadingTestID="chat-loader">
      <ChatScreenContent />
    </ProtectedRoute>
  );
}

function ChatScreenContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    profile,
    getProfileById,
    getConversation,
    hasActiveMatch,
    sendMessage,
    deleteMessage,
    sendPhoto,
    respondToPhoto,
    markRead,
    unmatch,
    blockProfile,
    drafts,
    setDraft,
    typingProfileIds,
  } = useProfile();
  const other = useMemo(
    () => (id ? getProfileById(id) : undefined),
    [getProfileById, id]
  );
  const convo = useMemo(
    () => (id ? getConversation(id) : undefined),
    [getConversation, id]
  );

  const [text, setText] = useState<string>("");
  const [activePersonIdx, setActivePersonIdx] = useState<number>(0);
  const [safetyMenuOpen, setSafetyMenuOpen] = useState<boolean>(false);
  const listRef = useRef<FlatList<Row>>(null);
  const isCouple = profile?.accountType === "couple";
  const activeName = profile?.people[activePersonIdx]?.name;
  const isTyping = !!id && typingProfileIds.includes(id);
  const hasActiveLocalMatch = !!id && hasActiveMatch(id);
  const goBackToInbox = useCanonicalBack("/(tabs)/inbox");
  const messages = useMemo(
    () => normalizeMessages(convo?.messages),
    [convo?.messages]
  );

  useEffect(() => {
    if (id && (convo?.unread ?? 0) > 0) markRead(id);
  }, [convo?.messages.length, convo?.unread, id, markRead]);

  useEffect(() => {
    if (!id) return;
    setText(drafts[id] ?? "");
  }, [id, drafts]);

  const onChangeText = useCallback(
    (v: string) => {
      setText(v);
      if (id) setDraft(id, v);
    },
    [id, setDraft]
  );

  const rows = useMemo<Row[]>(() => {
    const msgs = messages;
    const out: Row[] = [];
    let lastAt = 0;
    msgs.forEach((m, i) => {
      if (i === 0 || m.at - lastAt > TIME_GAP_MS) {
        out.push({ type: "divider", id: `d-${m.id}`, at: m.at });
      }
      const prev = msgs[i - 1];
      out.push({
        type: "msg",
        id: m.id,
        message: m,
        showAuthor:
          !!isCouple &&
          !!m.fromMe &&
          !!m.authorName &&
          m.authorName !== prev?.authorName,
      });
      lastAt = m.at;
    });
    if (isTyping) {
      out.push({ type: "typing", id: "typing" });
    }
    return out;
  }, [messages, isCouple, isTyping]);

  const send = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !id) {
      console.log("[chat] send skipped", { hasText: !!trimmed, id });
      return;
    }
    console.log("[chat] sending message", { id, length: trimmed.length });
    sendMessage(id, trimmed, isCouple ? activeName : undefined);
    setText("");
    setDraft(id, "");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [text, id, sendMessage, isCouple, activeName, setDraft]);

  const openReport = useCallback(
    (reportedMessageId?: string) => {
      if (!id) return;
      const messageQuery = reportedMessageId
        ? `&messageId=${reportedMessageId}`
        : "";
      router.push(`/report?profileId=${id}${messageQuery}`);
    },
    [id]
  );

  const blockConversation = useCallback(async () => {
    if (!id) return;
    const result = await blockProfile(id);
    if (!result.ok) {
      Alert.alert("Block failed", result.error ?? "Try again in a moment.");
      return;
    }
    router.replace("/(tabs)/inbox");
  }, [id, blockProfile]);

  const unmatchConversation = useCallback(() => {
    if (!id) return;
    unmatch(id);
    router.replace("/(tabs)/inbox");
  }, [id, unmatch]);

  const openSafetyActions = useCallback(() => {
    if (!id) return;
    setSafetyMenuOpen((open) => !open);
  }, [id]);

  const reportConversation = useCallback(() => {
    setSafetyMenuOpen(false);
    openReport();
  }, [openReport]);

  const blockFromMenu = useCallback(() => {
    setSafetyMenuOpen(false);
    void blockConversation();
  }, [blockConversation]);

  const unmatchFromMenu = useCallback(() => {
    setSafetyMenuOpen(false);
    unmatchConversation();
  }, [unmatchConversation]);

  const onLongPressMessage = useCallback(
    (m: Message) => {
      if (!id) return;
      if (m.kind === "photo") return;
      const options: { text: string; onPress?: () => void; style?: "cancel" | "destructive" | "default" }[] = [
        {
          text: "Copy",
          onPress: async () => {
            try {
              await Clipboard.setStringAsync(m.text);
            } catch (e) {
              console.log("[chat] copy error", e);
            }
          },
        },
      ];
      if (!m.fromMe) {
        options.push({
          text: "Report message",
          style: "destructive" as const,
          onPress: () => openReport(m.id),
        });
      }
      if (m.fromMe) {
        options.push({
          text: "Delete",
          style: "destructive" as const,
          onPress: () => deleteMessage(id, m.id),
        });
      }
      options.push({ text: "Cancel", style: "cancel" as const });
      Alert.alert("Message", undefined, options);
    },
    [id, deleteMessage, openReport]
  );

  const pickPhoto = useCallback(async () => {
    if (!id) return;
    try {
      if (Platform.OS !== "web") {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert(
            "Permission needed",
            "Allow photo library access to share photos."
          );
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: false,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      const uri = result.assets[0].uri;
      console.log("[chat] sending photo request", uri.slice(0, 60));
      sendPhoto(id, uri, isCouple ? activeName : undefined);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (e) {
      console.log("[chat] pickPhoto error", e);
      Alert.alert("Couldn't attach photo", "Please try again.");
    }
  }, [id, sendPhoto, isCouple, activeName]);

  const onDecide = useCallback(
    (messageId: string, decision: "approved" | "declined") => {
      if (!id) return;
      respondToPhoto(id, messageId, decision);
    },
    [id, respondToPhoto]
  );

  if (!other || !hasActiveLocalMatch) {
    return (
      <View style={styles.notFoundRoot}>
        <View style={styles.notFoundIcon}>
          <MessageCircle size={28} color={Colors.light.accent} />
        </View>
        <Text style={styles.notFoundTitle}>Conversation unavailable</Text>
        <Text style={styles.notFoundSub}>
          Chat is only available after an active match.
        </Text>
        <Pressable
          onPress={goBackToInbox}
          style={({ pressed }) => [
            styles.notFoundBtn,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
          testID="chat-notfound-back"
        >
          <Text style={styles.notFoundBtnText}>Back to inbox</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ChatHeader
        other={other}
        onBack={goBackToInbox}
        onProfilePress={() => router.push(`/match/${other.id}`)}
        onSafetyPress={openSafetyActions}
      />
      {safetyMenuOpen && (
        <SafetyMenu
          onReport={reportConversation}
          onBlock={blockFromMenu}
          onUnmatch={unmatchFromMenu}
          onCancel={() => setSafetyMenuOpen(false)}
        />
      )}
      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: false })
        }
        renderItem={({ item }) => {
          if (item.type === "divider") {
            return (
              <View style={styles.dividerWrap}>
                <Text style={styles.dividerText}>{formatDivider(item.at)}</Text>
              </View>
            );
          }
          if (item.type === "typing") {
            return <TypingBubble />;
          }
          return (
            <Bubble
              message={item.message}
              onDecide={onDecide}
              onLongPress={onLongPressMessage}
              showAuthor={item.showAuthor}
            />
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyMsg}>
            Say hi! This is the start of your conversation.
          </Text>
        }
      />

      {isCouple && profile && (
        <View style={styles.personSwitch}>
          <Users size={14} color={Colors.light.textMuted} />
          <Text style={styles.personSwitchLabel}>Send as</Text>
          {profile.people.map((p, i) => (
            <Pressable
              key={i}
              onPress={() => setActivePersonIdx(i)}
              style={[
                styles.personChip,
                activePersonIdx === i && styles.personChipOn,
              ]}
            >
              <Text
                style={[
                  styles.personChipText,
                  activePersonIdx === i && { color: "#FFF" },
                ]}
              >
                {p.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.composer}>
        <Pressable
          onPress={pickPhoto}
          style={({ pressed }) => [
            styles.attachBtn,
            pressed && { opacity: 0.7 },
          ]}
          testID="attach-photo"
        >
          <ImagePlus color={Colors.light.accent} size={22} />
        </Pressable>
        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder={isCouple ? `Message as ${activeName}...` : "Message..."}
          placeholderTextColor={Colors.light.textMuted}
          style={styles.input}
          multiline
          testID="chat-input"
        />
        <Pressable
          onPress={send}
          hitSlop={10}
          style={({ pressed }) => [
            styles.sendBtn,
            { opacity: !text.trim() ? 0.4 : pressed ? 0.85 : 1 },
          ]}
          testID="send-btn"
        >
          <Send color="#FFF" size={18} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function ChatHeader({
  other,
  onBack,
  onProfilePress,
  onSafetyPress,
}: {
  other: Profile;
  onBack: () => void;
  onProfilePress: () => void;
  onSafetyPress: () => void;
}) {
  const otherIsCouple = other.accountType === "couple";
  const headerTitle = otherIsCouple
    ? `${other.people[0].name} & ${other.people[1]?.name}`
    : other.people[0].name;

  return (
    <View style={styles.inlineHeader}>
      <Pressable
        onPress={onBack}
        hitSlop={10}
        style={({ pressed }) => [
          styles.headerBack,
          pressed && { opacity: 0.7 },
        ]}
        testID="chat-back"
      >
        <ChevronLeft size={24} color={Colors.light.text} />
      </Pressable>
      <Pressable
        onPress={onProfilePress}
        style={({ pressed }) => [
          styles.headerTitle,
          pressed && { opacity: 0.76 },
        ]}
        testID="chat-profile-link"
      >
        <View style={styles.headerAvatars}>
          <Image
            source={{ uri: other.people[0].photo }}
            style={styles.headerAvatar}
            contentFit="cover"
          />
          {otherIsCouple && other.people[1] && (
            <Image
              source={{ uri: other.people[1].photo }}
              style={[styles.headerAvatar, { marginLeft: -12 }]}
              contentFit="cover"
            />
          )}
        </View>
        <View>
          <Text style={styles.headerName}>{headerTitle}</Text>
          <Text style={styles.headerCity}>{other.location.city}</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={onSafetyPress}
        hitSlop={10}
        style={({ pressed }) => [
          styles.headerAction,
          pressed && { opacity: 0.7 },
        ]}
        testID="chat-safety"
      >
        <MoreHorizontal size={22} color={Colors.light.text} />
      </Pressable>
    </View>
  );
}

function SafetyMenu({
  onReport,
  onBlock,
  onUnmatch,
  onCancel,
}: {
  onReport: () => void;
  onBlock: () => void;
  onUnmatch: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.safetyMenu} testID="chat-safety-menu">
      <Pressable
        onPress={onReport}
        style={({ pressed }) => [
          styles.safetyMenuItem,
          pressed && styles.safetyMenuItemPressed,
        ]}
        testID="chat-report-profile"
      >
        <Text style={styles.safetyMenuDangerText}>Report profile</Text>
      </Pressable>
      <Pressable
        onPress={onBlock}
        style={({ pressed }) => [
          styles.safetyMenuItem,
          pressed && styles.safetyMenuItemPressed,
        ]}
        testID="chat-block-profile"
      >
        <Text style={styles.safetyMenuDangerText}>Block profile</Text>
      </Pressable>
      <Pressable
        onPress={onUnmatch}
        style={({ pressed }) => [
          styles.safetyMenuItem,
          pressed && styles.safetyMenuItemPressed,
        ]}
        testID="chat-unmatch"
      >
        <Text style={styles.safetyMenuDangerText}>Unmatch</Text>
      </Pressable>
      <Pressable
        onPress={onCancel}
        style={({ pressed }) => [
          styles.safetyMenuItem,
          pressed && styles.safetyMenuItemPressed,
        ]}
        testID="chat-safety-cancel"
      >
        <Text style={styles.safetyMenuText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

function Bubble({
  message,
  showAuthor,
  onDecide,
  onLongPress,
}: {
  message: Message;
  showAuthor: boolean;
  onDecide: (id: string, decision: "approved" | "declined") => void;
  onLongPress: (m: Message) => void;
}) {
  const mine = message.fromMe;
  const isPhoto = message.kind === "photo" && !!message.photoUri;

  if (isPhoto) {
    return (
      <PhotoBubble
        message={message}
        showAuthor={showAuthor}
        onDecide={onDecide}
      />
    );
  }

  return (
    <View
      style={[
        styles.bubbleRow,
        { justifyContent: mine ? "flex-end" : "flex-start" },
      ]}
    >
      <Pressable
        onLongPress={() => onLongPress(message)}
        delayLongPress={280}
        style={({ pressed }) => [
          styles.bubble,
          mine ? styles.bubbleMine : styles.bubbleTheirs,
          pressed && { opacity: 0.85 },
        ]}
      >
        {showAuthor && message.authorName && (
          <Text style={styles.bubbleAuthor}>{message.authorName}</Text>
        )}
        <Text
          style={[
            styles.bubbleText,
            { color: mine ? "#FFF" : Colors.light.text },
          ]}
        >
          {message.text}
        </Text>
        {mine && message.status && (
          <View style={styles.statusInline}>
            <StatusIcon status={message.status} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

function StatusIcon({ status }: { status: MessageStatus }) {
  if (status === "sending") {
    return (
      <Text style={styles.statusInlineText} testID="status-sending">• • •</Text>
    );
  }
  if (status === "sent") {
    return <Check size={12} color="rgba(255,255,255,0.75)" />;
  }
  if (status === "delivered") {
    return <CheckCheck size={12} color="rgba(255,255,255,0.75)" />;
  }
  return <CheckCheck size={12} color="#7CE0C8" />;
}

function TypingBubble() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const make = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, {
            toValue: 1,
            duration: 360,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0.3,
            duration: 360,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
    const a = make(dot1, 0);
    const b = make(dot2, 140);
    const c = make(dot3, 280);
    a.start();
    b.start();
    c.start();
    return () => {
      a.stop();
      b.stop();
      c.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={[styles.bubbleRow, { justifyContent: "flex-start" }]}>
      <View style={[styles.bubble, styles.bubbleTheirs, styles.typingBubble]}>
        <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
      </View>
    </View>
  );
}

function PhotoBubble({
  message,
  showAuthor,
  onDecide,
}: {
  message: Message;
  showAuthor: boolean;
  onDecide: (id: string, decision: "approved" | "declined") => void;
}) {
  const mine = message.fromMe;
  const status = message.photoStatus ?? "pending";
  const approved = status === "approved";
  const declined = status === "declined";
  const pending = status === "pending";

  return (
    <View
      style={[
        styles.bubbleRow,
        { justifyContent: mine ? "flex-end" : "flex-start" },
      ]}
    >
      <View style={styles.photoCard} testID={`photo-msg-${message.id}`}>
        {showAuthor && message.authorName && (
          <Text style={styles.photoAuthor}>{message.authorName}</Text>
        )}

        <View style={styles.photoImageWrap}>
          {approved ? (
            <Image
              source={{ uri: message.photoUri }}
              style={styles.photoImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.photoLocked}>
              {mine && message.photoUri ? (
                <Image
                  source={{ uri: message.photoUri }}
                  style={styles.photoImage}
                  contentFit="cover"
                  blurRadius={28}
                />
              ) : null}
              <View style={styles.photoLockOverlay}>
                <View style={styles.lockBadge}>
                  <Lock color="#FFF" size={18} />
                </View>
                <Text style={styles.lockTitle}>
                  {declined
                    ? "Photo declined"
                    : mine
                    ? "Waiting for approval"
                    : "Photo request"}
                </Text>
                <Text style={styles.lockSub}>
                  {declined
                    ? "The photo wasn't accepted."
                    : mine
                    ? "They need to accept before it unlocks."
                    : "Accept to reveal this photo."}
                </Text>
              </View>
            </View>
          )}
        </View>

        {!mine && pending && (
          <View style={styles.decideRow}>
            <Pressable
              onPress={() => onDecide(message.id, "declined")}
              style={({ pressed }) => [
                styles.decideBtn,
                styles.decideDecline,
                pressed && { opacity: 0.85 },
              ]}
              testID={`decline-${message.id}`}
            >
              <XIcon color={Colors.light.text} size={16} />
              <Text style={styles.decideDeclineText}>Decline</Text>
            </Pressable>
            <Pressable
              onPress={() => onDecide(message.id, "approved")}
              style={({ pressed }) => [
                styles.decideBtn,
                styles.decideAccept,
                pressed && { opacity: 0.85 },
              ]}
              testID={`accept-${message.id}`}
            >
              <Check color="#FFF" size={16} />
              <Text style={styles.decideAcceptText}>Accept</Text>
            </Pressable>
          </View>
        )}

        {mine && pending && (
          <View style={styles.statusRow}>
            <Lock color={Colors.light.textMuted} size={12} />
            <Text style={styles.statusText}>Pending approval</Text>
          </View>
        )}
        {approved && (
          <View style={styles.statusRow}>
            <Check color={Colors.light.accent} size={12} />
            <Text style={[styles.statusText, { color: Colors.light.accent }]}>
              Unlocked
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.line,
    backgroundColor: Colors.light.background,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.surface,
  },
  headerTitle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 10,
  },
  headerAvatars: { flexDirection: "row" },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  headerName: {
    fontSize: 15,
    fontWeight: "800" as const,
    color: Colors.light.text,
  },
  headerCity: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: "600" as const,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.surface,
  },
  safetyMenu: {
    alignSelf: "flex-end",
    minWidth: 190,
    marginTop: 8,
    marginRight: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.line,
    backgroundColor: Colors.light.surface,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    zIndex: 5,
  },
  safetyMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.line,
  },
  safetyMenuItemPressed: {
    backgroundColor: Colors.light.surfaceAlt,
  },
  safetyMenuText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: "700" as const,
  },
  safetyMenuDangerText: {
    color: Colors.palette.coral,
    fontSize: 14,
    fontWeight: "800" as const,
  },
  list: { padding: 16, gap: 6, flexGrow: 1 },
  emptyMsg: {
    textAlign: "center",
    color: Colors.light.textMuted,
    fontSize: 13,
    marginTop: 60,
  },
  bubbleRow: { flexDirection: "row", marginVertical: 3 },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: Colors.light.tint,
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: Colors.light.surface,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  bubbleAuthor: {
    fontSize: 10,
    fontWeight: "800" as const,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  statusInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    marginBottom: -2,
  },
  statusInlineText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.5,
    fontWeight: "800" as const,
  },
  dividerWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.light.textMuted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.textMuted,
  },
  personSwitch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.line,
    backgroundColor: Colors.light.surfaceAlt,
  },
  personSwitchLabel: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: Colors.light.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  personChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  personChipOn: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.accent,
  },
  personChipText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.line,
    backgroundColor: Colors.light.background,
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.line,
    alignItems: "center",
    justifyContent: "center",
  },
  photoCard: {
    maxWidth: "78%",
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.line,
    padding: 8,
    gap: 8,
  },
  photoAuthor: {
    fontSize: 10,
    fontWeight: "800" as const,
    color: Colors.light.textMuted,
    letterSpacing: 0.5,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  photoImageWrap: {
    width: 240,
    height: 240,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.light.surfaceAlt,
  },
  photoImage: { width: "100%", height: "100%" },
  photoLocked: { flex: 1 },
  photoLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(20,16,24,0.55)",
  },
  lockBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  lockTitle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800" as const,
    textAlign: "center",
  },
  lockSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
  },
  decideRow: { flexDirection: "row", gap: 8, paddingHorizontal: 4 },
  decideBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  decideDecline: {
    backgroundColor: Colors.light.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.light.line,
  },
  decideDeclineText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  decideAccept: { backgroundColor: Colors.light.accent },
  decideAcceptText: {
    fontSize: 13,
    fontWeight: "800" as const,
    color: "#FFF",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
    paddingBottom: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.light.textMuted,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.line,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: Colors.light.background,
  },
  notFoundIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.light.text,
    textAlign: "center",
  },
  notFoundSub: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },
  notFoundBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.light.accent,
  },
  notFoundBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
});
