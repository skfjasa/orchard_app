import { supabase } from "@/lib/supabase";

import type { StorageService, UploadInput } from "./storage-service";
import { fail, ok, requireSupabase } from "./supabase-service-response";

const PROFILE_PHOTOS_BUCKET = "profile-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

function inferContentType(uri: string, contentType?: string): string {
  if (contentType) return contentType;
  const cleanUri = uri.split("?")[0]?.toLowerCase() ?? "";
  if (cleanUri.endsWith(".png")) return "image/png";
  if (cleanUri.endsWith(".webp")) return "image/webp";
  if (cleanUri.endsWith(".heic")) return "image/heic";
  if (cleanUri.endsWith(".heif")) return "image/heif";
  return "image/jpeg";
}

function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "jpg";
  }
}

function makeStoragePath(input: UploadInput): string {
  const contentType = inferContentType(input.localUri, input.contentType);
  const ext = extensionForContentType(contentType);
  const nonce = Math.random().toString(36).slice(2, 10);
  return `${input.profileId}/${input.purpose}/${Date.now()}-${nonce}.${ext}`;
}

async function signedUrlForPath(storagePath: string): Promise<string | undefined> {
  const clientResult = requireSupabase(supabase);
  if (!clientResult.ok) return undefined;

  const { data, error } = await clientResult.value.storage
    .from(PROFILE_PHOTOS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error) return undefined;
  return data.signedUrl;
}

export function createSupabaseStorageService(): StorageService {
  return {
    async upload(input) {
      const clientResult = requireSupabase(supabase);
      if (!clientResult.ok) return clientResult;
      const client = clientResult.value;
      const contentType = inferContentType(input.localUri, input.contentType);
      const storagePath = makeStoragePath(input);

      let blob: Blob;
      try {
        const response = await fetch(input.localUri);
        if (!response.ok) {
          return fail(
            "storage_file_read_failed",
            "Unable to read the selected photo."
          );
        }
        blob = await response.blob();
      } catch (error) {
        return fail(
          "storage_file_read_failed",
          "Unable to read the selected photo.",
          error instanceof Error ? error : null
        );
      }

      const { error } = await client.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .upload(storagePath, blob, {
          contentType,
          upsert: false,
        });

      if (error) {
        return fail("storage_upload_failed", "Unable to upload photo.", error);
      }

      return ok({
        storagePath,
        publicUrl: await signedUrlForPath(storagePath),
      });
    },

    async remove(storagePath) {
      const clientResult = requireSupabase(supabase);
      if (!clientResult.ok) return clientResult;
      const { error } = await clientResult.value.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .remove([storagePath]);

      if (error) {
        return fail("storage_remove_failed", "Unable to remove photo.", error);
      }

      return ok(undefined);
    },
  };
}

export { PROFILE_PHOTOS_BUCKET, signedUrlForPath };
