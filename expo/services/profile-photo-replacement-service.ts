import type { Profile } from "@/types";

import type { ProfilePhotoPersistenceResult } from "./onboarding-completion-service";
import type { ServiceResponse } from "./service-types";
import type { UploadInput, UploadResult } from "./storage-service";

export interface ProfilePhotoMetadata {
  id: string;
  memberId: string;
  moderationStatus: "pending" | "approved" | "rejected";
  profileId: string;
  sortOrder: number;
  storagePath: string;
}

export interface DesiredProfilePhoto {
  memberId: string;
  sortOrder: number;
  storagePath: string;
}

export interface RemovedProfilePhotoSlot {
  memberId: string;
  sortOrder: number;
}

export interface ProfilePhotoReplacementCommit {
  committedPhotos: ProfilePhotoMetadata[];
  displacedPaths: string[];
}

export interface ProfilePhotoReplacementDependencies {
  loadCurrentMetadata(
    profileId: string
  ): Promise<ServiceResponse<ProfilePhotoMetadata[]>>;
  remove(storagePath: string): Promise<ServiceResponse<void>>;
  replaceMetadata(input: {
    desiredPhotos: DesiredProfilePhoto[];
    removedSlots: RemovedProfilePhotoSlot[];
  }): Promise<ServiceResponse<ProfilePhotoReplacementCommit>>;
  upload(input: UploadInput): Promise<ServiceResponse<UploadResult>>;
}

export async function buildSignedPhotosByMemberId(
  photoRows: Pick<
    ProfilePhotoMetadata,
    "memberId" | "sortOrder" | "storagePath"
  >[],
  signPath: (storagePath: string) => Promise<string | undefined>
): Promise<Record<string, string[]>> {
  const grouped: Record<string, string[]> = {};
  const sortedRows = [...photoRows].sort((a, b) => a.sortOrder - b.sortOrder);

  for (const row of sortedRows) {
    const signedUrl = await signPath(row.storagePath);
    if (!signedUrl) continue;
    grouped[row.memberId] = [...(grouped[row.memberId] ?? []), signedUrl];
  }

  return grouped;
}

interface PersistProfilePhotosInput {
  dependencies: ProfilePhotoReplacementDependencies;
  members: { id: string; sort_order: number }[];
  profile: Profile;
}

function failed<T>(code: string, message: string): ServiceResponse<T> {
  return { ok: false, error: { code, message } };
}

function succeeded<T>(value: T): ServiceResponse<T> {
  return { ok: true, value };
}

function isUploadablePhotoUri(uri: string | undefined): uri is string {
  if (!uri) return false;
  return !uri.startsWith("http://") && !uri.startsWith("https://");
}

export function isOwnedProfilePhotoPath(
  profileId: string,
  storagePath: string
): boolean {
  if (storagePath !== storagePath.trim()) return false;
  const parts = storagePath.split("/");
  return (
    parts.length === 3 &&
    parts[0] === profileId &&
    /^[a-z][a-z0-9_]*$/.test(parts[1] ?? "") &&
    /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(parts[2] ?? "") &&
    parts[2] !== "." &&
    parts[2] !== ".."
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

async function cleanupOwnedPaths(
  profileId: string,
  paths: string[],
  dependencies: ProfilePhotoReplacementDependencies
): Promise<string[]> {
  const failedPaths: string[] = [];
  for (const storagePath of [...new Set(paths)]) {
    if (!isOwnedProfilePhotoPath(profileId, storagePath)) {
      failedPaths.push(storagePath);
      continue;
    }
    const result = await dependencies.remove(storagePath);
    if (!result.ok) failedPaths.push(storagePath);
  }
  return failedPaths;
}

function cleanupFailureMessage(prefix: string, paths: string[]): string {
  return `${prefix} Cleanup failed for: ${paths.join(", ")}`;
}

export async function persistProfilePhotosTransactionally({
  dependencies,
  members,
  profile,
}: PersistProfilePhotosInput): Promise<ServiceResponse<ProfilePhotoPersistenceResult>> {
  const currentMetadata = await dependencies.loadCurrentMetadata(profile.id);
  if (!currentMetadata.ok) return currentMetadata;

  const currentBySlot = new Map(
    currentMetadata.value.map((photo) => [
      `${photo.memberId}:${photo.sortOrder}`,
      photo,
    ])
  );
  const desiredPhotos: DesiredProfilePhoto[] = [];
  const uploadedPaths: string[] = [];
  const uploadedPhotosByPersonIndex: Record<number, Record<number, string>> = {};

  for (const member of members) {
    const person = profile.people[member.sort_order];
    const photos = person?.photos ?? (person?.photo ? [person.photo] : []);

    for (const [photoIndex, photoUri] of photos.entries()) {
      if (!isUploadablePhotoUri(photoUri)) {
        // Signed and other remote URLs are presentation values. The matching
        // authoritative metadata slot is intentionally left unchanged.
        void currentBySlot.get(`${member.id}:${photoIndex}`);
        continue;
      }

      const upload = await dependencies.upload({
        profileId: profile.id,
        localUri: photoUri,
        purpose: "profile_photo",
      });
      if (!upload.ok) {
        const cleanupFailures = await cleanupOwnedPaths(
          profile.id,
          uploadedPaths,
          dependencies
        );
        return cleanupFailures.length
          ? failed(
              "profile_photos_upload_cleanup_failed",
              cleanupFailureMessage(upload.error.message, cleanupFailures)
            )
          : failed("profile_photos_write_failed", upload.error.message);
      }

      uploadedPaths.push(upload.value.storagePath);
      desiredPhotos.push({
        memberId: member.id,
        sortOrder: photoIndex,
        storagePath: upload.value.storagePath,
      });
      if (upload.value.publicUrl) {
        uploadedPhotosByPersonIndex[member.sort_order] = {
          ...(uploadedPhotosByPersonIndex[member.sort_order] ?? {}),
          [photoIndex]: upload.value.publicUrl,
        };
      }
    }
  }

  if (desiredPhotos.length === 0) {
    return succeeded({ profile, warnings: [] });
  }

  const replacement = await dependencies.replaceMetadata({
    desiredPhotos,
    removedSlots: [],
  });
  if (!replacement.ok) {
    const cleanupFailures = await cleanupOwnedPaths(
      profile.id,
      uploadedPaths,
      dependencies
    );
    return cleanupFailures.length
      ? failed(
          "profile_photos_replacement_cleanup_failed",
          cleanupFailureMessage(replacement.error.message, cleanupFailures)
        )
      : failed("profile_photos_write_failed", replacement.error.message);
  }

  const committedPaths = new Set(
    replacement.value.committedPhotos.map((photo) => photo.storagePath)
  );
  const removableDisplacedPaths = [
    ...new Set(replacement.value.displacedPaths),
  ].filter(
    (storagePath) =>
      !committedPaths.has(storagePath) &&
      isOwnedProfilePhotoPath(profile.id, storagePath)
  );
  const invalidDisplacedPaths = replacement.value.displacedPaths.filter(
    (storagePath) => !isOwnedProfilePhotoPath(profile.id, storagePath)
  );
  const cleanupFailures = [
    ...invalidDisplacedPaths,
    ...(await cleanupOwnedPaths(
      profile.id,
      removableDisplacedPaths,
      dependencies
    )),
  ];

  return succeeded({
    profile: applyUploadedPhotosToProfile(
      profile,
      uploadedPhotosByPersonIndex
    ),
    warnings: cleanupFailures.length
      ? [
          {
            code: "profile_photo_cleanup_failed",
            storagePaths: [...new Set(cleanupFailures)],
          },
        ]
      : [],
  });
}
