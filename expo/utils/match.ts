import { MatchScore, Preference, Profile } from "@/types";

const WEIGHTS = {
  preference: 0.32,
  distance: 0.22,
  age: 0.16,
  category: 0.12,
  interest: 0.18,
};

function haversine(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function genderToPreferences(gender: string): Preference[] {
  const prefs: Preference[] = [];
  if (gender === "Woman") prefs.push("Women");
  if (gender === "Man") prefs.push("Men");
  if (gender === "Cis woman") prefs.push("Women", "Cis women");
  if (gender === "Cis man") prefs.push("Men", "Cis men");
  if (gender === "Trans woman") prefs.push("Women", "Trans women");
  if (gender === "Trans man") prefs.push("Men", "Trans men");
  if (gender === "Transfeminine") prefs.push("Transfeminine folks");
  if (gender === "Transmasculine") prefs.push("Transmasculine folks");
  if (gender === "Non-binary") prefs.push("Non-binary");
  if (gender === "Genderqueer") prefs.push("Genderqueer", "Non-binary");
  if (gender === "Genderfluid") prefs.push("Genderfluid", "Non-binary");
  if (gender === "Agender") prefs.push("Agender", "Non-binary");
  if (gender === "Bigender") prefs.push("Bigender", "Non-binary");
  if (gender === "Two-spirit") prefs.push("Two-spirit");
  if (gender === "Intersex") prefs.push("Intersex");
  if (gender === "Questioning") prefs.push("Questioning");
  return prefs;
}

function preferenceOverlap(me: Profile, other: Profile): number {
  const myPrefs = new Set<Preference>(me.preferences);
  const otherPrefs = new Set<Preference>(other.preferences);

  if (myPrefs.has("Everyone") && otherPrefs.has("Everyone")) return 1;

  const otherCategoryPref: Preference =
    other.accountType === "couple" ? "Couples" : null as unknown as Preference;

  const otherGenderPrefs = other.people.flatMap((p) =>
    genderToPreferences(p.gender)
  );

  const myGenderPrefs = me.people.flatMap((p) =>
    genderToPreferences(p.gender)
  );

  const myWantsOther =
    myPrefs.has("Everyone") ||
    (other.accountType === "couple" && myPrefs.has("Couples")) ||
    otherGenderPrefs.some((g) => myPrefs.has(g));

  const otherWantsMe =
    otherPrefs.has("Everyone") ||
    (me.accountType === "couple" && otherPrefs.has("Couples")) ||
    myGenderPrefs.some((g) => otherPrefs.has(g));

  let score = 0;
  if (myWantsOther) score += 0.5;
  if (otherWantsMe) score += 0.5;

  if (otherCategoryPref && myPrefs.has(otherCategoryPref)) score += 0.05;

  return Math.min(1, score);
}

function avgAge(p: Profile): number {
  const total = p.people.reduce((s, x) => s + x.age, 0);
  return total / p.people.length;
}

function interestOverlap(
  me: Profile,
  other: Profile
): { score: number; shared: string[] } {
  const myInterests = new Set<string>(
    me.people.flatMap((p) => (p.interests ?? []).map((i) => i.toLowerCase()))
  );
  const otherInterestsOriginal = other.people.flatMap(
    (p) => p.interests ?? []
  );
  const shared: string[] = [];
  const seen = new Set<string>();
  for (const it of otherInterestsOriginal) {
    const key = it.toLowerCase();
    if (myInterests.has(key) && !seen.has(key)) {
      shared.push(it);
      seen.add(key);
    }
  }
  const denom = Math.max(3, Math.min(myInterests.size, 8));
  const score = Math.max(0, Math.min(1, shared.length / denom));
  return { score, shared };
}

export function scoreMatch(me: Profile, other: Profile): MatchScore {
  const preferenceScore = preferenceOverlap(me, other);
  const distanceKm = haversine(me.location, other.location);
  const distanceScore = Math.max(0, 1 - Math.min(distanceKm, 100) / 100);

  const ageDiff = Math.abs(avgAge(me) - avgAge(other));
  const ageScore = Math.max(0, 1 - Math.min(ageDiff, 15) / 15);

  const lookingForMatch = me.lookingFor === other.lookingFor ? 1 : 0.3;
  const accountCompat =
    (me.accountType === "couple" && other.preferences.includes("Couples")) ||
    (other.accountType === "couple" &&
      me.preferences.includes("Couples")) ||
    (me.accountType === "single" && other.accountType === "single")
      ? 1
      : 0.6;
  const categoryScore = (lookingForMatch + accountCompat) / 2;

  const { score: interestScore, shared: sharedInterests } = interestOverlap(
    me,
    other
  );

  const total =
    preferenceScore * WEIGHTS.preference +
    distanceScore * WEIGHTS.distance +
    ageScore * WEIGHTS.age +
    categoryScore * WEIGHTS.category +
    interestScore * WEIGHTS.interest;

  return {
    total,
    preferenceScore,
    distanceScore,
    ageScore,
    categoryScore,
    interestScore,
    sharedInterests,
    distanceKm,
  };
}

export function rankProfiles(
  me: Profile,
  others: Profile[]
): { profile: Profile; score: MatchScore }[] {
  return others
    .map((p) => ({ profile: p, score: scoreMatch(me, p) }))
    .sort((a, b) => b.score.total - a.score.total);
}
