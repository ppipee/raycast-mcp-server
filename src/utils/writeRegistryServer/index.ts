import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";

import { SERVER_NAME_PATTERN, SERVERS_JSON_PATH } from "../../constants";
import * as locales from "../../locales";
import type { McpServerEntry, WriteServerResult } from "../../types";
import type { WriteRegistryServerParams } from "./types";

// Adds a new server definition to ~/.ai-code/mcp/servers.json, preserving every
// existing entry and unrelated top-level key. A .bak copy is written first.
// connect.sh reads this file per invocation, so the entry is runnable once written.
export default function writeRegistryServer({ name, command, args, env }: WriteRegistryServerParams): WriteServerResult {
  const trimmedName = name.trim();
  const trimmedCommand = command.trim();

  if (trimmedName.length === 0) {
    return { status: "error", field: "name", message: locales.ADD_FORM_NAME_REQUIRED };
  }

  // NOTE: connect.sh interpolates the name into a Python snippet and an SSE URL,
  // so anything outside this set would break the connector at run time.
  if (!SERVER_NAME_PATTERN.test(trimmedName)) {
    return { status: "error", field: "name", message: locales.ADD_FORM_NAME_INVALID };
  }

  if (trimmedCommand.length === 0) {
    return { status: "error", field: "command", message: locales.ADD_FORM_COMMAND_REQUIRED };
  }

  if (!existsSync(SERVERS_JSON_PATH)) {
    return { status: "error", message: `${locales.ADD_FORM_REGISTRY_MISSING}: ${SERVERS_JSON_PATH}` };
  }

  let config: { mcpServers?: Record<string, McpServerEntry> } & Record<string, unknown>;

  try {
    config = JSON.parse(readFileSync(SERVERS_JSON_PATH, "utf8"));
  } catch (error) {
    return {
      status: "error",
      message: `${locales.ADD_FORM_REGISTRY_INVALID}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const entries = { ...(config.mcpServers ?? {}) };
  const duplicate = Object.keys(entries).find((key) => key.toLowerCase() === trimmedName.toLowerCase());

  if (duplicate) {
    return { status: "error", field: "name", message: `${locales.ADD_FORM_NAME_TAKEN}: ${duplicate}` };
  }

  const entry: McpServerEntry = { command: trimmedCommand, args };

  if (Object.keys(env).length > 0) {
    entry.env = env;
  }

  config.mcpServers = { ...entries, [trimmedName]: entry };

  try {
    copyFileSync(SERVERS_JSON_PATH, `${SERVERS_JSON_PATH}.bak`);
    writeFileSync(SERVERS_JSON_PATH, `${JSON.stringify(config, null, 2)}\n`);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : String(error) };
  }

  return { status: "ok", name: trimmedName };
}
