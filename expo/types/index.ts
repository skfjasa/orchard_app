export type Gender =
  | "Woman"
  | "Man"
  | "Cis woman"
  | "Cis man"
  | "Trans woman"
  | "Trans man"
  | "Transfeminine"
  | "Transmasculine"
  | "Non-binary"
  | "Genderqueer"
  | "Genderfluid"
  | "Agender"
  | "Bigender"
  | "Two-spirit"
  | "Intersex"
  | "Questioning"
  | "Other";

export const GENDER_OPTIONS: Gender[] = [
  "Woman",
  "Man",
  "Cis woman",
  "Cis man",
  "Trans woman",
  "Trans man",
  "Transfeminine",
  "Transmasculine",
  "Non-binary",
  "Genderqueer",
  "Genderfluid",
  "Agender",
  "Bigender",
  "Two-spirit",
  "Intersex",
  "Questioning",
  "Other",
];

export type Race =
  | "Asian"
  | "Black"
  | "Hispanic / Latinx"
  | "Middle Eastern"
  | "Native American"
  | "Pacific Islander"
  | "White"
  | "Mixed"
  | "Prefer not to say";

export type Preference =
  | "Women"
  | "Men"
  | "Cis women"
  | "Cis men"
  | "Trans women"
  | "Trans men"
  | "Transfeminine folks"
  | "Transmasculine folks"
  | "Non-binary"
  | "Genderqueer"
  | "Genderfluid"
  | "Agender"
  | "Bigender"
  | "Two-spirit"
  | "Intersex"
  | "Questioning"
  | "Couples"
  | "Everyone";

export const PREFERENCE_OPTIONS: Preference[] = [
  "Everyone",
  "Women",
  "Men",
  "Non-binary",
  "Couples",
  "Cis women",
  "Cis men",
  "Trans women",
  "Trans men",
  "Transfeminine folks",
  "Transmasculine folks",
  "Genderqueer",
  "Genderfluid",
  "Agender",
  "Bigender",
  "Two-spirit",
  "Intersex",
  "Questioning",
];

export type LookingFor = "Solo" | "Together";

export type PolyamoryType =
  | "Throuple"
  | "Polycule"
  | "Vee"
  | "Triad"
  | "Quad"
  | "Hierarchical poly"
  | "Non-hierarchical poly"
  | "Kitchen-table poly"
  | "Parallel poly"
  | "Solo poly"
  | "Relationship anarchy"
  | "Open relationship"
  | "Monogamish"
  | "Swinger"
  | "Questioning"
  | "Other";

export const POLYAMORY_TYPES: PolyamoryType[] = [
  "Throuple",
  "Polycule",
  "Vee",
  "Triad",
  "Quad",
  "Hierarchical poly",
  "Non-hierarchical poly",
  "Kitchen-table poly",
  "Parallel poly",
  "Solo poly",
  "Relationship anarchy",
  "Open relationship",
  "Monogamish",
  "Swinger",
  "Questioning",
  "Other",
];

export type AccountType = "single" | "couple";

export const MAX_PHOTOS = 5 as const;
export const DEFAULT_MATCH_SLOTS = 5 as const;

export interface Socials {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
}

export interface PromptAnswer {
  question: string;
  answer: string;
}

export interface VoicePrompt {
  question: string;
  uri: string;
  durationMs: number;
  recordedAt: number;
}

export interface PersonProfile {
  name: string;
  age: number;
  gender: Gender;
  race: Race;
  photo: string;
  photos?: string[];
  prompts?: PromptAnswer[];
  voicePrompt?: VoicePrompt;
  interests?: string[];
}

export interface InterestCategory {
  title: string;
  items: string[];
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    title: "Sports & Fitness",
    items: [
      "Running",
      "Yoga",
      "Hiking",
      "Climbing",
      "Cycling",
      "Surfing",
      "Skiing",
      "Snowboarding",
      "Pilates",
      "Weightlifting",
      "Tennis",
      "Basketball",
      "Soccer",
      "Swimming",
      "Boxing",
      "Martial arts",
      "Skateboarding",
    ],
  },
  {
    title: "Music",
    items: [
      "Live shows",
      "Vinyl",
      "Indie",
      "Hip-hop",
      "Jazz",
      "Electronic",
      "House",
      "Techno",
      "R&B",
      "Classical",
      "K-pop",
      "Punk",
      "Metal",
      "Singing",
      "Producing",
      "Guitar",
      "Piano",
      "DJing",
    ],
  },
  {
    title: "Hobbies & Creative",
    items: [
      "Photography",
      "Film",
      "Painting",
      "Drawing",
      "Writing",
      "Poetry",
      "Ceramics",
      "Knitting",
      "Woodworking",
      "Gardening",
      "Gaming",
      "Board games",
      "Puzzles",
      "Reading",
      "Journaling",
      "DIY",
      "Thrifting",
      "Collecting",
    ],
  },
  {
    title: "Food & Drink",
    items: [
      "Cooking",
      "Baking",
      "Coffee",
      "Tea",
      "Wine",
      "Cocktails",
      "Natural wine",
      "Whiskey",
      "Craft beer",
      "Farmers markets",
      "Sushi",
      "BBQ",
      "Vegan",
      "Brunch",
      "Fine dining",
      "Street food",
    ],
  },
  {
    title: "Travel & Outdoors",
    items: [
      "Road trips",
      "Backpacking",
      "Camping",
      "Beach days",
      "City breaks",
      "Solo travel",
      "Festivals",
      "National parks",
      "Scuba diving",
      "Astronomy",
      "Stargazing",
      "Foraging",
    ],
  },
  {
    title: "Culture & Ideas",
    items: [
      "Museums",
      "Theater",
      "Standup",
      "Film festivals",
      "Podcasts",
      "Philosophy",
      "Politics",
      "Astrology",
      "Spirituality",
      "Meditation",
      "Therapy",
      "Languages",
      "History",
      "Architecture",
      "Design",
      "Fashion",
    ],
  },
  {
    title: "Lifestyle",
    items: [
      "Dogs",
      "Cats",
      "Plants",
      "Volunteering",
      "Activism",
      "Entrepreneurship",
      "Tech",
      "Crypto",
      "Cars",
      "Motorcycles",
      "Tattoos",
      "Slow living",
      "Nightlife",
      "Dance",
    ],
  },
];

export const MAX_INTERESTS = 10 as const;

export const PROMPT_QUESTIONS: string[] = [
  "A perfect Sunday looks like...",
  "The way to my heart is...",
  "My most controversial take...",
  "I'm looking for someone who...",
  "Green flags I love to see...",
  "My simple pleasures...",
  "Two truths and a lie...",
  "My love language is...",
  "What I'm learning right now...",
  "I won't shut up about...",
];

export const VOICE_PROMPT_QUESTIONS: string[] = [
  "Say hi in your own voice",
  "Tell a 20-second story",
  "What made you laugh this week?",
  "Describe your dream weekend",
  "Read a line from your favorite book",
];

export const MAX_PROMPTS = 3 as const;
export const MAX_VOICE_PROMPT_SEC = 30 as const;

export interface Location {
  city: string;
  lat: number;
  lng: number;
}

export type LinkStatus = "pending" | "linked" | "declined";

export interface LinkedPartner {
  id: string;
  email: string;
  displayName?: string;
  photo?: string;
  inviteCode: string;
  status: LinkStatus;
  invitedAt: number;
  linkedAt?: number;
  role?: "primary" | "partner";
}

export interface AccountCredentials {
  username: string;
  password: string;
}

export interface Profile {
  id: string;
  accountType: AccountType;
  people: PersonProfile[];
  location: Location;
  preferences: Preference[];
  lookingFor: LookingFor;
  polyType?: PolyamoryType;
  createdAt: number;
  bio?: string;
  socials?: Socials;
  boostedUntil?: number;
  trendingScore?: number;
  ownerEmail?: string;
  linkedPartners?: LinkedPartner[];
  credentials?: AccountCredentials[];
  ageConfirmed?: boolean;
  legalAcceptedAt?: number;
}

export type PhotoStatus = "pending" | "approved" | "declined";

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface Message {
  id: string;
  fromMe: boolean;
  authorName?: string;
  text: string;
  at: number;
  kind?: "text" | "photo";
  photoUri?: string;
  photoStatus?: PhotoStatus;
  status?: MessageStatus;
  deliveredAt?: number;
  readAt?: number;
}

export interface Conversation {
  id: string;
  profileId: string;
  messages: Message[];
  unread: number;
}

export interface MatchScore {
  total: number;
  preferenceScore: number;
  distanceScore: number;
  ageScore: number;
  categoryScore: number;
  interestScore: number;
  sharedInterests: string[];
  distanceKm: number;
}

export type PurchaseCategory = "slots" | "boost" | "superlikes";

export type PurchaseId =
  | "slots_5"
  | "slots_15"
  | "boost"
  | "superlikes_refill"
  | "superlikes_10";

export interface PurchaseOption {
  id: PurchaseId;
  category: PurchaseCategory;
  title: string;
  subtitle: string;
  price: string;
  priceValue: number;
}

export const PURCHASE_OPTIONS: PurchaseOption[] = [
  {
    id: "superlikes_refill",
    category: "superlikes",
    title: "Super Like Refill",
    subtitle: "Refill your weekly 5 \u2014 skip the 30-day wait",
    price: "$14.99",
    priceValue: 14.99,
  },
  {
    id: "superlikes_10",
    category: "superlikes",
    title: "+10 Super Likes",
    subtitle: "Ten extra Super Likes added to your account",
    price: "$20.00",
    priceValue: 20,
  },
  {
    id: "slots_5",
    category: "slots",
    title: "+5 match slots",
    subtitle: "Unlock 5 more active connections",
    price: "$4.99",
    priceValue: 4.99,
  },
  {
    id: "slots_15",
    category: "slots",
    title: "+15 match slots",
    subtitle: "Best value \u2014 room to grow your circle",
    price: "$20.00",
    priceValue: 20,
  },
  {
    id: "boost",
    category: "boost",
    title: "Profile Boost",
    subtitle: "Trend in your area for 24 hours",
    price: "$20.00",
    priceValue: 20,
  },
];

export const BOOST_DURATION_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_SUPER_LIKES = 5 as const;
export const SUPER_LIKE_RECHARGE_MS = 30 * 24 * 60 * 60 * 1000;

export type SubscriptionId = "plus" | "pro";

export interface SubscriptionOption {
  id: SubscriptionId;
  title: string;
  tagline: string;
  price: string;
  priceValue: number;
  period: "month";
  perks: string[];
  monthlySlots: number;
  monthlySuperLikes: number;
  includesBoost: boolean;
  accent: "evergreen" | "coral";
}

export const SUBSCRIPTION_OPTIONS: SubscriptionOption[] = [
  {
    id: "plus",
    title: "Orchard Plus",
    tagline: "For the everyday romantic",
    price: "$9.99",
    priceValue: 9.99,
    period: "month",
    perks: [
      "+5 match slots every month",
      "+5 Super Likes every month",
      "See who liked you first",
    ],
    monthlySlots: 5,
    monthlySuperLikes: 5,
    includesBoost: false,
    accent: "evergreen",
  },
  {
    id: "pro",
    title: "Orchard Pro",
    tagline: "Full harvest \u2014 the complete experience",
    price: "$29.99",
    priceValue: 29.99,
    period: "month",
    perks: [
      "+15 match slots every month",
      "+15 Super Likes every month",
      "1 Profile Boost every month",
      "Priority placement in Discover",
    ],
    monthlySlots: 15,
    monthlySuperLikes: 15,
    includesBoost: true,
    accent: "coral",
  },
];
