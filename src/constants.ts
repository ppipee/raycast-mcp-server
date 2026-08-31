import { homedir } from "os";
import { join } from "path";

import type { ClientId } from "./types";

export const AI_CODE_MCP_DIR = join(homedir(), ".ai-code", "mcp");
export const SERVERS_JSON_PATH = join(AI_CODE_MCP_DIR, "servers.json");
export const CONNECT_SH_PATH = join(AI_CODE_MCP_DIR, "connect.sh");
export const PROXY_LOG_PATH = join(AI_CODE_MCP_DIR, "proxy.log");

export const PROXY_PORT = 9100;
export const PROXY_CONNECT_TIMEOUT_MS = 1500;
export const HEALTH_CHECK_TIMEOUT_MS = 30000;

export const MCP_CLIENT_KEY_SUFFIX = "_MCP";

// NOTE: connect.sh interpolates the server name into a Python snippet and the
// proxy SSE URL, so keep names to characters that are safe in both.
export const SERVER_NAME_PATTERN = /^[A-Za-z0-9._-]+$/;

export const ADD_FORM_ARGS_PLACEHOLDER = "-y @upstash/context7-mcp";
export const ADD_FORM_COMMAND_PLACEHOLDER = "npx";
export const ADD_FORM_ENV_PLACEHOLDER = "API_TOKEN=abc123\nAPI_URL=https://example.com/api";
export const ADD_FORM_NAME_PLACEHOLDER = "my-server";

export interface ClientDefinition {
  id: ClientId;
  title: string;
  configPath: string;
}

export const CLIENTS: ClientDefinition[] = [
  {
    id: "cursor",
    title: "Cursor",
    configPath: join(homedir(), ".cursor", "mcp.json"),
  },
  {
    id: "claude-code",
    title: "Claude Code",
    configPath: join(homedir(), ".claude.json"),
  },
  {
    id: "claude-desktop",
    title: "Claude Desktop",
    configPath: join(homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json"),
  },
];
