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
import type { ServiceResponse } from "./service-types";
import { fail, ok, requireSupabase } from "./supabase-service-response";
import {
  createSupabaseStorageService,
  signedUrlForPath,
} from "./supabase-storage-service";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileMemberRow = Database["public"]["Tables"]["profile_members"]["Row"];
type ProfilePhotoRow = Database["public"]["Tables"]["profile_photos"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type ProfileMemberInsert =
  Database["public"]["Tables"]["profile_members"]["Insert"];
type ProfileMemberUpdate =
  Database["public"]["Tables"]["profile_members"]["Update"];
type ProfilePhotoInsert =
  Database["public"]["Tables"]["profile_photos"]["Insert"];
type UserSettingsInsert =
  Database["public"]["Tables"]["user_settings"]["Insert"];

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

function toProfileUpdateFromProfile(profile: Profile): ProfileUpdate {
  return {
    ...toProfileUpdate(profile),
    is_visible: true,
    onboarding_completed: true,
  };
}

function toMemberUpdate(row: ProfileMemberInsert): ProfileMemberUpdate {
  return {
    display_name: row.display_name,
    birthdate: row.birthdate,
    gender: row.gender,
    orientation: row.orientation,
    bio: row.bio,
    sort_order: row.sort_order,
  };
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

function toUserSettings(profile: Profile): UserSettingsInsert {
  return {
    profile_id: profile.id,
    min_age: 18,
    max_age: 99,
    max_distance_miles: 50,
    show_me: profile.preferences,
    relationship_structures: profile.polyType ? [profile.polyType] : [],
    push_enabled: false,
  };
}

export function toAppProfile(
  row: ProfileRow,
  members: ProfileMemberRow[],
  photosByMemberId: Record<string, string[]> = {}
): Profile {
  const sortedMembers = [...members].sort((a, b) => a.sort_order - b.sort_order);
  const people: PersonProfile[] = sortedMembers.length
    ? sortedMembers.map((member) => {
        const memberPhotos = photosByMemberId[member.id] ?? [DEFAULT_PHOTO];
        return {
          name: member.display_name,
          age: ageFromBirthdate(member.birthdate),
          gender: (member.gender ?? "Other") as Gender,
          race: "Prefer not to say",
          photo: memberPhotos[0] ?? DEFAULT_PHOTO,
          photos: memberPhotos,
          interests: [],
        };
      })
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

function isUploadablePhotoUri(uri: string | undefined): uri is string {
  if (!uri) return false;
  return !uri.startsWith("http://") && !uri.startsWith("https://");
}

export async function buildPhotosByMemberId(
  photoRows: ProfilePhotoRow[]
): Promise<Record<string, string[]>> {
  const grouped: Record<string, string[]> = {};
  const sortedRows = [...photoRows].sort((a, b) => a.sort_order - b.sort_order);

  for (const row of sortedRows) {
    const signedUrl = await signedUrlForPath(row.storage_path);
    if (!signedUrl) continue;
    grouped[row.member_id] = [...(grouped[row.member_id] ?? []), signedUrl];
  }

  return grouped;
}

function applyUploadedPhotosToProfile(
  profile: Profile,
  uploadedPhotosByPersonIndex: Record<number, Record<number, string>>
): Profile {
  return {
    ...profile,
    people: profile.people.map((person, personIndex) => {
      const uploadedBySlot = uploadedPhotosByPersonIndex[personIndex] ?? {};
      const photos = (person.photos ?? [person.photo]).map((uri, photoIndex) =>
        uploadedBySlot[photoIndex] ?? uri
      );
      return {
        ...person,
        photo: photos[0] ?? person.photo,
        photos,
      };
    }),
  };
}

async function persistProfilePhotos(
  profile: Profile,
  members: ProfileMemberRow[]
): Promise<ServiceResponse<Profile>> {
  const storage = createSupabaseStorageService();
  const photoRows: ProfilePhotoInsert[] = [];
  const uploadedPaths: string[] = [];
  const uploadedPhotosByPersonIndex: Record<number, Record<number, string>> = {};

  for (const member of members) {
    const person = profile.people[member.sort_order];
    const photos = person?.photos ?? (person?.photo ? [person.photo] : []);

    for (const [photoIndex, photoUri] of photos.entries()) {
      if (!isUploadablePhotoUri(photoUri)) continue;

      const uploadResult = await storage.upload({
        profileId: profile.id,
        localUri: photoUri,
        purpose: "profile_photo",
      });

      if (!uploadResult.ok) {
        for (const storagePath of uploadedPaths) {
          void storage.remove(storagePath);
        }
        return { ok: false, error: uploadResult.error };
      }

      uploadedPaths.push(uploadResult.value.storagePath);
      if (uploadResult.value.publicUrl) {
        uploadedPhotosByPersonIndex[member.sort_order] = {
          ...(uploadedPhotosByPersonIndex[member.sort_order] ?? {}),
          [photoIndex]: uploadResult.value.publicUrl,
        };
      }

      photoRows.push({
        profile_id: profile.id,
        member_id: member.id,
        storage_path: uploadResult.value.storagePath,
        sort_order: photoIndex,
      });
    }
  }

  if (photoRows.length === 0) {
    return ok(profile);
  }

  const clientResult = requireSupabase(supabase);
  if (!clientResult.ok) return clientResult;

  for (const photoRow of photoRows) {
    const { error: insertError } = await clientResult.value
      .from("profile_photos")
      .insert(photoRow);

    if (!insertError) continue;

    if (!isUniqueViolation(insertError)) {
      for (const storagePath of uploadedPaths) {
        void storage.remove(storagePath);
      }
      return fail(
        "profile_photos_write_failed",
        "Unable to save profile photos.",
        insertError
      );
    }

    const { error: updateError } = await clientResult.value
      .from("profile_photos")
      .update({
        member_id: photoRow.member_id,
        storage_path: photoRow.storage_path,
        sort_order: photoRow.sort_order,
      })
      .eq("profile_id", photoRow.profile_id)
      .eq("member_id", photoRow.member_id)
      .eq("sort_order", photoRow.sort_order ?? 0);

    if (updateError) {
      for (const storagePath of uploadedPaths) {
        void storage.remove(storagePath);
      }
      return fail(
        "profile_photos_write_failed",
        "Unable to save profile photos.",
        updateError
      );
    }
  }

  return ok(applyUploadedPhotosToProfile(profile, uploadedPhotosByPersonIndex));
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

      const { data: photos, error: photosError } = await client
        .from("profile_photos")
        .select("*")
        .eq("profile_id", userId)
        .order("sort_order", { ascending: true });

      if (photosError) {
        return fail(
          "profile_photos_read_failed",
          "Unable to read profile photos.",
          photosError
        );
      }

      const photosByMemberId = await buildPhotosByMemberId(photos ?? []);
      return ok(toAppProfile(profileRow, members ?? [], photosByMemberId));
    },

    async completeOnboarding(input: ProfileDraftInput) {
      const clientResult = requireSupabase(supabase);
      if (!clientResult.ok) return clientResult;
      const client = clientResult.value;
      const profile = input.profile;

      const profileInsert = toProfileInsert(profile);
      const { error: profileInsertError } = await client
        .from("profiles")
        .insert(profileInsert);

      if (profileInsertError) {
        if (!isUniqueViolation(profileInsertError)) {
          return fail(
            "profile_write_failed",
            "Unable to save profile.",
            profileInsertError
          );
        }

        const { error: profileUpdateError } = await client
          .from("profiles")
          .update(toProfileUpdateFromProfile(profile))
          .eq("id", profile.id);

        if (profileUpdateError) {
          return fail(
            "profile_write_failed",
            "Unable to save profile.",
            profileUpdateError
          );
        }
      }

      const memberRows = toMemberInserts(profile);
      let savedMembers: ProfileMemberRow[] = [];
      if (memberRows.length > 0) {
        for (const memberRow of memberRows) {
          const { data: insertedMember, error: memberInsertError } = await client
            .from("profile_members")
            .insert(memberRow)
            .select("*")
            .single();

          if (!memberInsertError) {
            savedMembers.push(insertedMember);
            continue;
          }

          if (!isUniqueViolation(memberInsertError)) {
            return fail(
              "profile_members_write_failed",
              "Unable to save profile members.",
              memberInsertError
            );
          }

          const { data: updatedMember, error: memberUpdateError } = await client
            .from("profile_members")
            .update(toMemberUpdate(memberRow))
            .eq("profile_id", profile.id)
            .eq("sort_order", memberRow.sort_order ?? 0)
            .select("*")
            .single();

          if (memberUpdateError) {
            return fail(
              "profile_members_write_failed",
              "Unable to save profile members.",
              memberUpdateError
            );
          }

          savedMembers.push(updatedMember);
        }
      }

      const { error: settingsError } = await client
        .from("user_settings")
        .upsert(toUserSettings(profile), { onConflict: "profile_id" });

      if (settingsError) {
        return fail(
          "user_settings_write_failed",
          "Unable to save default user settings.",
          settingsError
        );
      }

      const photoResult = await persistProfilePhotos(profile, savedMembers);
      if (!photoResult.ok) return photoResult;

      return ok(photoResult.value);
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
