import { PolyamoryType } from "@/types";

export interface PolyFruit {
  emoji: string;
  color: string;
  definition: string;
}

export const POLY_FRUIT_MAP: Record<PolyamoryType, PolyFruit> = {
  Throuple: {
    emoji: "🍓",
    color: "#F25C78",
    definition:
      "A romantic relationship between three people, all equally involved with one another.",
  },
  Polycule: {
    emoji: "🍇",
    color: "#8A4FFF",
    definition:
      "A connected network of people in polyamorous relationships, linked through shared partners.",
  },
  Vee: {
    emoji: "🍒",
    color: "#D62246",
    definition:
      "A V-shaped structure where one person (the hinge) dates two partners who aren't romantically involved with each other.",
  },
  Triad: {
    emoji: "🍊",
    color: "#FF9A3C",
    definition:
      "Three people who are all romantically and/or sexually connected to each other.",
  },
  Quad: {
    emoji: "🍎",
    color: "#E8453C",
    definition:
      "A relationship of four people, often formed by two couples whose members connect across the pairs.",
  },
  "Hierarchical poly": {
    emoji: "🍍",
    color: "#E8B23C",
    definition:
      "A style where some partners are designated 'primary' and others 'secondary,' with clear priority levels.",
  },
  "Non-hierarchical poly": {
    emoji: "🥝",
    color: "#6DAF3A",
    definition:
      "Relationships are treated as equal — no partner is ranked above another.",
  },
  "Kitchen-table poly": {
    emoji: "🍉",
    color: "#F06C7F",
    definition:
      "Partners and metamours are close enough to share a meal together — emphasizing family-style closeness.",
  },
  "Parallel poly": {
    emoji: "🍌",
    color: "#E8C547",
    definition:
      "Partners maintain separate relationships with little to no interaction between metamours.",
  },
  "Solo poly": {
    emoji: "🥥",
    color: "#8B6B4A",
    definition:
      "Practicing polyamory while keeping autonomy — no desire to merge lives, finances, or homes with partners.",
  },
  "Relationship anarchy": {
    emoji: "🥭",
    color: "#F08A3C",
    definition:
      "Rejecting imposed rules and hierarchies — each relationship is defined by the people in it, on their own terms.",
  },
  "Open relationship": {
    emoji: "🍑",
    color: "#F8A8A0",
    definition:
      "A committed partnership where both people are free to pursue sexual or romantic connections outside the relationship.",
  },
  Monogamish: {
    emoji: "🍐",
    color: "#A8C83C",
    definition:
      "Mostly monogamous with occasional agreed-upon exceptions for outside connections.",
  },
  Swinger: {
    emoji: "🍏",
    color: "#7AC74F",
    definition:
      "Partners who engage in recreational sexual activity with others, usually together and in social settings.",
  },
  Questioning: {
    emoji: "🫐",
    color: "#5B7BD1",
    definition:
      "Still exploring what style of non-monogamy fits best — curious and open to learning.",
  },
  Other: {
    emoji: "🍋",
    color: "#E8D547",
    definition:
      "A style that doesn't fit neatly into the above categories — uniquely yours.",
  },
};

export function getPolyFruit(type?: PolyamoryType): PolyFruit | undefined {
  if (!type) return undefined;
  return POLY_FRUIT_MAP[type];
}
