import type { ServiceResponse } from "./service-types";

export type UploadPurpose = "profile_photo" | "chat_photo" | "voice_prompt";

export interface UploadInput {
  profileId: string;
  localUri: string;
  purpose: UploadPurpose;
  contentType?: string;
}

export interface UploadResult {
  storagePath: string;
  publicUrl?: string;
}

export interface StorageService {
  upload(input: UploadInput): Promise<ServiceResponse<UploadResult>>;
  remove(storagePath: string): Promise<ServiceResponse<void>>;
}
