import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";

import { CLIENTS, CONNECT_SH_PATH, MCP_CLIENT_KEY_SUFFIX } from "../../constants";
import type { ConfigureResult, McpServerEntry } from "../../types";
import findServerEntryKeys from "../findServerEntryKeys";
import type { ConfigureClientServersParams } from "./types";

// Syncs a client's config to exactly the selected registry servers: adds missing
// connect.sh entries, removes registry-managed entries that are unselected, and
// never touches entries unrelated to ~/.ai-code/mcp. One backup + one write.
export default function configureClientServers({
  clientId,
  registryServers,
  selectedNames,
}: ConfigureClientServersParams): ConfigureResult {
  const client = CLIENTS.find((candidate) => candidate.id === clientId);

  if (!client) {
    return { clientId, status: "error", added: [], removed: [], message: "Unknown client." };
  }

  if (clientId !== "cursor" && !existsSync(client.configPath)) {
    return {
      clientId,
      status: "error",
      added: [],
      removed: [],
      message: `Config file not found: ${client.configPath}`,
    };
  }

  let config: { mcpServers?: Record<string, McpServerEntry> } & Record<string, unknown> = {};

  if (existsSync(client.configPath)) {
    try {
      config = JSON.parse(readFileSync(client.configPath, "utf8"));
    } catch (error) {
      return {
        clientId,
        status: "error",
        added: [],
        removed: [],
        message: `Config is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  const entries = { ...(config.mcpServers ?? {}) };
  const added: string[] = [];
  const removed: string[] = [];

  for (const server of registryServers) {
    const keys = findServerEntryKeys(entries, server);
    const isSelected = selectedNames.includes(server.name);

    if (isSelected && keys.length === 0) {
      const key = `${server.name.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}${MCP_CLIENT_KEY_SUFFIX}`;

      entries[key] = { command: "bash", args: [CONNECT_SH_PATH, server.name] };
      added.push(server.name);
    }

    if (!isSelected && keys.length > 0) {
      for (const key of keys) {
        delete entries[key];
      }

      removed.push(server.name);
    }
  }

  if (added.length === 0 && removed.length === 0) {
    return { clientId, status: "ok", added, removed };
  }

  config.mcpServers = entries;

  try {
    if (existsSync(client.configPath)) {
      copyFileSync(client.configPath, `${client.configPath}.bak`);
    }

    writeFileSync(client.configPath, `${JSON.stringify(config, null, 2)}\n`);
  } catch (error) {
    return {
      clientId,
      status: "error",
      added: [],
      removed: [],
      message: error instanceof Error ? error.message : String(error),
    };
  }

  return { clientId, status: "ok", added, removed };
}
