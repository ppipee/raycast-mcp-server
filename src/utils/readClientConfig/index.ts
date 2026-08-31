import { existsSync, readFileSync } from "fs";

import { CLIENTS } from "../../constants";
import type { ClientConfigStatus, ClientId, McpServerEntry } from "../../types";

export default function readClientConfig(clientId: ClientId): ClientConfigStatus {
  const client = CLIENTS.find((candidate) => candidate.id === clientId);

  if (!client || !existsSync(client.configPath)) {
    return { clientId, exists: false, valid: false, entries: {} };
  }

  try {
    const raw = readFileSync(client.configPath, "utf8");
    const parsed = JSON.parse(raw) as { mcpServers?: Record<string, McpServerEntry> };

    return { clientId, exists: true, valid: true, entries: parsed.mcpServers ?? {} };
  } catch (error) {
    return {
      clientId,
      exists: true,
      valid: false,
      error: error instanceof Error ? error.message : String(error),
      entries: {},
    };
  }
}
