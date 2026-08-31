import type { ClientId, RegistryServer } from "../../types";

export interface ConfigureClientServersParams {
  clientId: ClientId;
  registryServers: RegistryServer[];
  selectedNames: string[];
}
