import { supabase, type Database } from "@/lib/supabase";
import type {
  AccountType,
  Gender,
  LookingFor,
  PersonProfile,
  Preference,
  Profile,
} from "@/types";

import type {
  ProfileDraftInput,
  ProfileService,
  ProfileUpdateInput,
} from "./profile-service";
import { fail, ok, requireSupabase } from "./supabase-service-response";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileMemberRow = Database["public"]["Tables"]["profile_members"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type ProfileMemberInsert =
  Database["public"]["Tables"]["profile_members"]["Insert"];

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80";

function birthdateFromAge(age: number | undefined): string | null {
  if (!age || age < 18) return null;
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
}

function ageFromBirthdate(birthdate: string | null): number {
  if (!birthdate) return 18;
  const year = Number(birthdate.slice(0, 4));
  if (!Number.isFinite(year)) return 18;
  return Math.max(18, new Date().getFullYear() - year);
}

function toProfileInsert(profile: Profile): ProfileInsert {
  const firstPerson = profile.people[0];
  return {
    id: profile.id,
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
    is_visible: true,
    onboarding_completed: true,
    last_active_at: new Date().toISOString(),
  };
}

function toMemberInserts(profile: Profile): ProfileMemberInsert[] {
  return profile.people.map((person, index) => ({
    profile_id: profile.id,
    display_name: person.name || `Person ${index + 1}`,
    birthdate: birthdateFromAge(person.age),
    gender: person.gender,
    bio: index === 0 ? profile.bio ?? null : null,
    sort_order: index,
  }));
}

function toProfileUpdate(patch: Partial<Profile>): ProfileUpdate {
  const firstPerson = patch.people?.[0];
  const update: ProfileUpdate = {};

  if (firstPerson?.name !== undefined) update.display_name = firstPerson.name;
  if (firstPerson?.age !== undefined) {
    update.birthdate = birthdateFromAge(firstPerson.age);
  }
  if (firstPerson?.gender !== undefined) update.gender = firstPerson.gender;
  if (patch.ageConfirmed !== undefined) update.age_confirmed = patch.ageConfirmed;
  if (patch.location?.city !== undefined) update.city = patch.location.city;
  if (patch.location?.lat !== undefined) {
    update.latitude_approx = patch.location.lat;
  }
  if (patch.location?.lng !== undefined) {
    update.longitude_approx = patch.location.lng;
  }
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

function toAppProfile(
  row: ProfileRow,
  members: ProfileMemberRow[]
): Profile {
  const sortedMembers = [...members].sort((a, b) => a.sort_order - b.sort_order);
  const people: PersonProfile[] = sortedMembers.length
    ? sortedMembers.map((member) => ({
        name: member.display_name,
        age: ageFromBirthdate(member.birthdate),
        gender: (member.gender ?? "Other") as Gender,
        race: "Prefer not to say",
        photo: DEFAULT_PHOTO,
        photos: [DEFAULT_PHOTO],
        interests: [],
      }))
    : [
        {
          name: row.display_name ?? "Orchard user",
          age: ageFromBirthdate(row.birthdate),
          gender: (row.gender ?? "Other") as Gender,
          race: "Prefer not to say",
          photo: DEFAULT_PHOTO,
          photos: [DEFAULT_PHOTO],
          interests: [],
        },
      ];

  return {
    id: row.id,
    accountType: (people.length > 1 ? "couple" : "single") as AccountType,
    people,
    location: {
      city: row.city ?? "",
      lat: Number(row.latitude_approx ?? 0),
      lng: Number(row.longitude_approx ?? 0),
    },
    preferences: row.looking_for as Preference[],
    lookingFor: (row.dating_mode === "Together" ? "Together" : "Solo") as LookingFor,
    polyType: row.relationship_structure[0] as Profile["polyType"],
    bio: row.bio ?? undefined,
    socials: {},
    createdAt: Date.parse(row.created_at) || Date.now(),
    ageConfirmed: row.age_confirmed,
  };
}

export function createSupabaseProfileService(): ProfileService {
  return {
    async getCurrentProfile() {
      const clientResult = requireSupabase(supabase);
      if (!clientResult.ok) return clientResult;
      const client = clientResult.value;

      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError) return fail("auth_user_failed", "Unable to read current user.", authError);
      const userId = authData.user?.id;
      if (!userId) return ok(null);

      const { data: profileRow, error: profileError } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        return fail("profile_read_failed", "Unable to read profile.", profileError);
      }
      if (!profileRow) return ok(null);

      const { data: members, error: membersError } = await client
        .from("profile_members")
        .select("*")
        .eq("profile_id", userId)
        .order("sort_order", { ascending: true });

      if (membersError) {
        return fail(
          "profile_members_read_failed",
          "Unable to read profile members.",
          membersError
        );
      }

      return ok(toAppProfile(profileRow, members ?? []));
    },

    async completeOnboarding(input: ProfileDraftInput) {
      const clientResult = requireSupabase(supabase);
      if (!clientResult.ok) return clientResult;
      const client = clientResult.value;
      const profile = input.profile;

      const { error: profileError } = await client
        .from("profiles")
        .upsert(toProfileInsert(profile), { onConflict: "id" });

      if (profileError) {
        return fail("profile_write_failed", "Unable to save profile.", profileError);
      }

      const memberRows = toMemberInserts(profile);
      if (memberRows.length > 0) {
        const { error: membersError } = await client
          .from("profile_members")
          .upsert(memberRows, { onConflict: "profile_id,sort_order" });

        if (membersError) {
          return fail(
            "profile_members_write_failed",
            "Unable to save profile members.",
            membersError
          );
        }
      }

      return ok(profile);
    },

    async updateProfile(input: ProfileUpdateInput) {
      const clientResult = requireSupabase(supabase);
      if (!clientResult.ok) return clientResult;
      const client = clientResult.value;

      const { error } = await client
        .from("profiles")
        .update(toProfileUpdate(input.patch))
        .eq("id", input.profileId);

      if (error) {
        return fail("profile_update_failed", "Unable to update profile.", error);
      }

      if (input.patch.people) {
        const memberRows = input.patch.people.map((person, index) => ({
          profile_id: input.profileId,
          display_name: person.name || `Person ${index + 1}`,
          birthdate: birthdateFromAge(person.age),
          gender: person.gender,
          bio: index === 0 ? input.patch.bio ?? null : null,
          sort_order: index,
        }));

        const { error: membersError } = await client
          .from("profile_members")
          .upsert(memberRows, { onConflict: "profile_id,sort_order" });

        if (membersError) {
          return fail(
            "profile_members_update_failed",
            "Unable to update profile members.",
            membersError
          );
        }
      }

      const current = await this.getCurrentProfile();
      return current.ok && current.value
        ? ok(current.value)
        : fail("profile_not_found", "Current profile was not found.");
    },

    async setProfileVisibility(profileId: string, isVisible: boolean) {
      const clientResult = requireSupabase(supabase);
      if (!clientResult.ok) return clientResult;
      const client = clientResult.value;

      const { error } = await client
        .from("profiles")
        .update({ is_visible: isVisible })
        .eq("id", profileId);

      if (error) {
        return fail(
          "profile_visibility_failed",
          "Unable to update profile visibility.",
          error
        );
      }

      const current = await this.getCurrentProfile();
      return current.ok && current.value
        ? ok(current.value)
        : fail("profile_not_found", "Current profile was not found.");
    },

    async signOut() {
      const clientResult = requireSupabase(supabase);
      if (!clientResult.ok) return clientResult;
      const { error } = await clientResult.value.auth.signOut();
      if (error) return fail("sign_out_failed", "Unable to sign out.", error);
      return ok(undefined);
    },
  };
}
