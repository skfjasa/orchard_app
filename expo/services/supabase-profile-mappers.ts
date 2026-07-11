import type { Database } from "@/lib/supabase";
import type { Profile } from "@/types";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

function birthdateFromAge(age: number | undefined): string | null {
  if (!age || age < 18) return null;
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
}

function toPersistedProfileFields(profile: Profile): ProfileUpdate {
  const firstPerson = profile.people[0];
  return {
    display_name: firstPerson?.name ?? null,
    birthdate: birthdateFromAge(firstPerson?.age),
    age_confirmed: profile.ageConfirmed ?? true,
    city: profile.location.city,
    latitude_approx: profile.location.lat,
    longitude_approx: profile.location.lng,
    gender: firstPerson?.gender ?? null,
    relationship_structure: profile.polyType ? [profile.polyType] : [],
    partnered_status: profile.accountType,
    dating_mode: profile.lookingFor,
    looking_for: profile.preferences,
    boundaries: [],
    bio: profile.bio ?? null,
    last_active_at: new Date().toISOString(),
  };
}

export function toIncompleteProfileInsert(profile: Profile): ProfileInsert {
  return {
    id: profile.id,
    ...toPersistedProfileFields(profile),
    is_visible: false,
    onboarding_completed: false,
  };
}

export function toIncompleteProfileUpdate(profile: Profile): ProfileUpdate {
  return {
    ...toPersistedProfileFields(profile),
    is_visible: false,
    onboarding_completed: false,
  };
}

export function toOnboardingFinalizationUpdate(): ProfileUpdate {
  return {
    is_visible: true,
    onboarding_completed: true,
    last_active_at: new Date().toISOString(),
  };
}

export function toPostOnboardingProfileUpdate(
  patch: Partial<Profile>
): ProfileUpdate {
  const firstPerson = patch.people?.[0];
  const update: ProfileUpdate = {};

  if (firstPerson?.name !== undefined) update.display_name = firstPerson.name;
  if (firstPerson?.age !== undefined) update.birthdate = birthdateFromAge(firstPerson.age);
  if (firstPerson?.gender !== undefined) update.gender = firstPerson.gender;
  if (patch.ageConfirmed !== undefined) update.age_confirmed = patch.ageConfirmed;
  if (patch.location?.city !== undefined) update.city = patch.location.city;
  if (patch.location?.lat !== undefined) update.latitude_approx = patch.location.lat;
  if (patch.location?.lng !== undefined) update.longitude_approx = patch.location.lng;
  if (patch.polyType !== undefined) {
    update.relationship_structure = patch.polyType ? [patch.polyType] : [];
  }
  if (patch.accountType !== undefined) update.partnered_status = patch.accountType;
  if (patch.lookingFor !== undefined) update.dating_mode = patch.lookingFor;
  if (patch.preferences !== undefined) update.looking_for = patch.preferences;
  if (patch.bio !== undefined) update.bio = patch.bio ?? null;

  update.last_active_at = new Date().toISOString();
  return update;
}
