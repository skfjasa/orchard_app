import type { MatchRecord } from "@/services/match-service";

export function findMatchBetweenProfiles(
  matches: MatchRecord[],
  profileId: string,
  otherProfileId: string
): MatchRecord | undefined {
  return matches.find(
    (item) =>
      (item.userA === profileId && item.userB === otherProfileId) ||
      (item.userA === otherProfileId && item.userB === profileId)
  );
}
