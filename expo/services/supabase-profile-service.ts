import type { SupabaseClient } from "@supabase/supabase-js";

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
  CurrentProfileResult,
  ProfileDraftInput,
  ProfileService,
  ProfileUpdateInput,
} from "./profile-service";
import type { ServiceResponse } from "./service-types";
import { completeOnboardingInPhases } from "./onboarding-completion-service";
import {
  toIncompleteProfileInsert,
  toIncompleteProfileUpdate,
  toOnboardingFinalizationUpdate,
  toPostOnboardingProfileUpdate,
} from "./supabase-profile-mappers";
import { fail, ok, requireSupabase } from "./supabase-service-response";
import {
  createSupabaseStorageService,
  signedUrlForPath,
} from "./supabase-storage-service";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileMemberRow = Database["public"]["Tables"]["profile_members"]["Row"];
type ProfilePhotoRow = Database["public"]["Tables"]["profile_photos"]["Row"];
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

async function readProfileState(
  client: SupabaseClient<Database>,
  userId: string
): Promise<ServiceResponse<CurrentProfileResult>> {
  const { data: profileRow, error: profileError } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return fail("profile_read_failed", "Unable to read profile.", profileError);
  }
  if (!profileRow) return ok({ status: "missing" });

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
  const profile = toAppProfile(profileRow, members ?? [], photosByMemberId);
  return ok(
    profileRow.onboarding_completed
      ? { status: "completed", profile }
      : { status: "incomplete", profile }
  );
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
        return fail(
          "profile_photos_write_failed",
          uploadResult.error.message
        );
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
      if (!userId) return ok({ status: "missing" });
      return readProfileState(client, userId);
    },

    async completeOnboarding(input: ProfileDraftInput) {
      const clientResult = requireSupabase(supabase);
      if (!clientResult.ok) return clientResult;
      const client = clientResult.value;
      const profile = input.profile;
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError) {
        return fail("auth_user_failed", "Unable to read current user.", authError);
      }
      if (!authData.user || authData.user.id !== profile.id) {
        return fail(
          "profile_preparation_forbidden",
          "Unable to prepare a profile for a different user."
        );
      }

      return completeOnboardingInPhases<ProfileMemberRow[]>({
        async prepareProfile() {
          const { error: insertError } = await client
            .from("profiles")
            .insert(toIncompleteProfileInsert(profile));

          if (!insertError) return ok({ status: "prepared" as const });
          if (!isUniqueViolation(insertError)) {
            return fail(
              "profile_preparation_failed",
              "Unable to prepare profile.",
              insertError
            );
          }

          const current = await readProfileState(client, profile.id);
          if (!current.ok) {
            return fail(
              "profile_preparation_read_failed",
              current.error.message
            );
          }
          if (current.value.status === "missing") {
            return fail(
              "profile_preparation_conflict",
              "The existing profile could not be found after a conflict."
            );
          }
          if (current.value.status === "completed") {
            return ok({
              status: "already_completed" as const,
              profile: current.value.profile,
            });
          }

          const { data: updatedRow, error: updateError } = await client
            .from("profiles")
            .update(toIncompleteProfileUpdate(profile))
            .eq("id", profile.id)
            .eq("onboarding_completed", false)
            .select("id")
            .maybeSingle();

          if (updateError || !updatedRow) {
            return fail(
              "profile_preparation_failed",
              "Unable to refresh the incomplete profile.",
              updateError ?? undefined
            );
          }
          return ok({ status: "prepared" as const });
        },

        async persistMembers() {
          const savedMembers: ProfileMemberRow[] = [];
          const memberRows = toMemberInserts(profile);
          if (memberRows.length === 0) {
            return fail(
              "profile_members_write_failed",
              "At least one profile member is required."
            );
          }

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
          return ok(savedMembers);
        },

        async persistSettings() {
          const { error } = await client
            .from("user_settings")
            .upsert(toUserSettings(profile), { onConflict: "profile_id" });
          return error
            ? fail(
                "user_settings_write_failed",
                "Unable to save default user settings.",
                error
              )
            : ok(undefined);
        },

        async persistPhotos(savedMembers) {
          return persistProfilePhotos(profile, savedMembers);
        },

        async finalizeProfile() {
          const { data: finalizedRow, error: finalizationError } = await client
            .from("profiles")
            .update(toOnboardingFinalizationUpdate())
            .eq("id", profile.id)
            .eq("onboarding_completed", false)
            .select("id")
            .maybeSingle();

          if (finalizationError || !finalizedRow) {
            return fail(
              "profile_finalization_failed",
              "Unable to finalize profile.",
              finalizationError ?? undefined
            );
          }

          const completed = await readProfileState(client, profile.id);
          if (!completed.ok) {
            return fail(
              "profile_finalization_failed",
              completed.error.message
            );
          }
          return completed.value.status === "completed"
            ? ok(completed.value.profile)
            : fail(
                "profile_finalization_failed",
                "The finalized profile could not be confirmed."
              );
        },
      });
    },

    async updateProfile(input: ProfileUpdateInput) {
      const clientResult = requireSupabase(supabase);
      if (!clientResult.ok) return clientResult;
      const client = clientResult.value;

      const { error } = await client
        .from("profiles")
        .update(toPostOnboardingProfileUpdate(input.patch))
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
      return current.ok && current.value.status === "completed"
        ? ok(current.value.profile)
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
      return current.ok && current.value.status === "completed"
        ? ok(current.value.profile)
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
