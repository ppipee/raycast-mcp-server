import type { HealthResult, RegistryServer } from "../../types";

export interface ServerDetailProps {
  server: RegistryServer;
  health?: HealthResult;
  isChecking: boolean;
  connectedClientTitles: string[];
}
