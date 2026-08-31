import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";

import { CLIENTS, CONNECT_SH_PATH, MCP_CLIENT_KEY_SUFFIX } from "../../constants";
import type { ClientId, ConnectResult, McpServerEntry, RegistryServer } from "../../types";
import isServerConnected from "../isServerConnected";

// Adds a connect.sh entry for the server into one client config, preserving all
// unrelated keys (important for ~/.claude.json). A .bak copy is written first.
export default function addServerToClient(server: RegistryServer, clientId: ClientId): ConnectResult {
  const client = CLIENTS.find((candidate) => candidate.id === clientId);

  if (!client) {
    return { clientId, status: "error", message: "Unknown client." };
  }

  if (clientId !== "cursor" && !existsSync(client.configPath)) {
    return { clientId, status: "error", message: `Config file not found: ${client.configPath}` };
  }

  let config: { mcpServers?: Record<string, McpServerEntry> } & Record<string, unknown> = {};

  if (existsSync(client.configPath)) {
    try {
      config = JSON.parse(readFileSync(client.configPath, "utf8"));
    } catch (error) {
      return {
        clientId,
        status: "error",
        message: `Config is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  const entries = config.mcpServers ?? {};

  if (isServerConnected(entries, server)) {
    return { clientId, status: "already-connected" };
  }

  const key = `${server.name.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}${MCP_CLIENT_KEY_SUFFIX}`;

  config.mcpServers = {
    ...entries,
    [key]: { command: "bash", args: [CONNECT_SH_PATH, server.name] },
  };

  try {
    if (existsSync(client.configPath)) {
      copyFileSync(client.configPath, `${client.configPath}.bak`);
    }

    writeFileSync(client.configPath, `${JSON.stringify(config, null, 2)}\n`);
  } catch (error) {
    return { clientId, status: "error", message: error instanceof Error ? error.message : String(error) };
  }

  return { clientId, status: "added" };
}
