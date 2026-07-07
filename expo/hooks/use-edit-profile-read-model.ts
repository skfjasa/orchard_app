import { useProfile } from "@/providers/profile-provider";

export function useEditProfileReadModel() {
  const { profile, updateProfile } = useProfile();

  return {
    profile,
    updateProfile,
  };
}
