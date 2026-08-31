import { spawn } from "child_process";

import { HEALTH_CHECK_TIMEOUT_MS } from "../../constants";
import { TIMEOUT_HINT, TIMEOUT_OAUTH_HINT } from "../../locales";
import type { HealthResult, RegistryServer } from "../../types";
import getExtendedPath from "../getExtendedPath";

const INITIALIZE_REQUEST_ID = 1;

interface InitializeResponse {
  id?: number;
  result?: { serverInfo?: { name?: string; version?: string } };
  error?: { message?: string };
}

// Spawns the server exactly as a client would and performs a real MCP
// `initialize` handshake over stdio — a JSON-RPC reply means the server works.
export default function checkServerHealth(server: RegistryServer): Promise<HealthResult> {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    let settled = false;
    let stdoutBuffer = "";
    let stderrBuffer = "";

    const child = spawn(server.command, server.args, {
      env: { ...process.env, ...server.env, PATH: getExtendedPath() },
      stdio: ["pipe", "pipe", "pipe"],
    });

    const settle = (result: Omit<HealthResult, "durationMs">) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timer);
      child.kill("SIGTERM");
      resolve({ ...result, durationMs: Date.now() - startedAt });
    };

    const timer = setTimeout(() => {
      settle({
        state: "timeout",
        message: server.usesMcpRemote ? TIMEOUT_OAUTH_HINT : TIMEOUT_HINT,
      });
    }, HEALTH_CHECK_TIMEOUT_MS);

    child.on("error", (error) => {
      settle({ state: "error", message: error.message });
    });

    child.on("exit", (code) => {
      const stderrTail = stderrBuffer.trim().split("\n").slice(-5).join("\n");

      settle({
        state: "error",
        message: stderrTail || `Process exited with code ${code ?? "unknown"} before responding.`,
      });
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      stderrBuffer += chunk.toString();
    });

    child.stdout?.on("data", (chunk: Buffer) => {
      stdoutBuffer += chunk.toString();

      const lines = stdoutBuffer.split("\n");
      stdoutBuffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
          continue;
        }

        let response: InitializeResponse;

        try {
          response = JSON.parse(trimmed) as InitializeResponse;
        } catch {
          continue;
        }

        if (response.id !== INITIALIZE_REQUEST_ID) {
          continue;
        }

        if (response.error) {
          settle({ state: "error", message: response.error.message ?? "Server returned a JSON-RPC error." });
          return;
        }

        settle({
          state: "healthy",
          serverName: response.result?.serverInfo?.name,
          serverVersion: response.result?.serverInfo?.version,
        });
        return;
      }
    });

    const initializeRequest = {
      jsonrpc: "2.0",
      id: INITIALIZE_REQUEST_ID,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "raycast-mcp-inspector", version: "1.0.0" },
      },
    };

    try {
      child.stdin?.write(`${JSON.stringify(initializeRequest)}\n`);
    } catch (error) {
      settle({ state: "error", message: error instanceof Error ? error.message : String(error) });
    }
  });
}
