export const MVP_MONETIZATION_ENABLED = false;
export const MVP_SUPER_LIKES_ENABLED = true;

export type MonetizationStatus =
  | "existing_prototype"
  | "future_candidate"
  | "not_monetized_for_mvp";

export interface MonetizationCandidate {
  id: string;
  label: string;
  status: MonetizationStatus;
  demoEnabled: boolean;
  notes: string;
}

export const MONETIZATION_CANDIDATES = {
  matchSlots: {
    id: "match_slots",
    label: "Match slots",
    status: "existing_prototype",
    demoEnabled: false,
    notes:
      "Prototype limits active matches and sells extra slots; disabled for feedback MVP.",
  },
  boosts: {
    id: "boosts",
    label: "Profile boosts",
    status: "existing_prototype",
    demoEnabled: true,
    notes:
      "Prototype ranks boosted profiles higher and sells boost access; disabled for feedback MVP.",
  },
  superLikes: {
    id: "super_likes",
    label: "Super Likes",
    status: "existing_prototype",
    demoEnabled: MVP_SUPER_LIKES_ENABLED,
    notes: "Prototype has refill/bundle mechanics; disabled for feedback MVP.",
  },
  subscriptions: {
    id: "subscriptions",
    label: "Plus / Pro subscriptions",
    status: "existing_prototype",
    demoEnabled: false,
    notes:
      "Prototype grants monthly slots, Super Likes, and boosts; disabled for feedback MVP.",
  },
  whoLikedYou: {
    id: "who_liked_you",
    label: "See who liked you",
    status: "existing_prototype",
    demoEnabled: false,
    notes: "Listed as a prototype subscription perk; not implemented as a real feature yet.",
  },
  advancedFilters: {
    id: "advanced_filters",
    label: "Advanced filters",
    status: "future_candidate",
    demoEnabled: false,
    notes:
      "Could include deeper relationship-structure, boundary, distance, or intent filters later.",
  },
  profileInsights: {
    id: "profile_insights",
    label: "Profile insights",
    status: "future_candidate",
    demoEnabled: false,
    notes: "Could include profile view or engagement insights after analytics exists.",
  },
  verification: {
    id: "verification",
    label: "Advanced verification",
    status: "future_candidate",
    demoEnabled: false,
    notes: "Not part of MVP; if monetized later, safety-critical basics must remain free.",
  },
  eventsOrCommunities: {
    id: "events_or_communities",
    label: "Events or communities",
    status: "future_candidate",
    demoEnabled: false,
    notes: "Potential future product surface, not scoped for current MVP.",
  },
} satisfies Record<string, MonetizationCandidate>;
