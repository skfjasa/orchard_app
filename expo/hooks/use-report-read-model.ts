import { useProfile } from "@/providers/profile-provider";

export function useReportReadModel() {
  const { reportProfile } = useProfile();

  return {
    reportProfile,
  };
}
