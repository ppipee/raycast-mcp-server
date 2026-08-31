export type ClientId = "cursor" | "claude-code" | "claude-desktop";

export interface McpServerEntry {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  type?: string;
}

export interface RegistryServer {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  usesMcpRemote: boolean;
}

export type HealthState = "healthy" | "error" | "timeout";

export interface HealthResult {
  state: HealthState;
  serverName?: string;
  serverVersion?: string;
  message?: string;
  durationMs: number;
}

export interface ClientConfigStatus {
  clientId: ClientId;
  exists: boolean;
  valid: boolean;
  error?: string;
  entries: Record<string, McpServerEntry>;
}

export type ConnectStatus = "added" | "already-connected" | "error";

export interface ConnectResult {
  clientId: ClientId;
  status: ConnectStatus;
  message?: string;
}

export type ServerField = "name" | "command";

export interface WriteServerResult {
  status: "ok" | "error";
  name?: string;
  field?: ServerField;
  message?: string;
}

export interface ConfigureClientProps {
  initialClientId?: ClientId;
}

export interface ConfigureResult {
  clientId: ClientId;
  status: "ok" | "error";
  added: string[];
  removed: string[];
  message?: string;
}
