import { readFileSync } from "fs";

import { SERVERS_JSON_PATH } from "../../constants";
import type { McpServerEntry, RegistryServer } from "../../types";

export default function readRegistryServers(): RegistryServer[] {
  const raw = readFileSync(SERVERS_JSON_PATH, "utf8");
  const parsed = JSON.parse(raw) as { mcpServers?: Record<string, McpServerEntry> };
  const entries = parsed.mcpServers ?? {};

  return Object.entries(entries).map(([name, entry]) => {
    const args = entry.args ?? [];

    return {
      name,
      command: entry.command ?? "",
      args,
      env: entry.env ?? {},
      usesMcpRemote: args.some((arg) => arg.includes("mcp-remote")),
    };
  });
}
