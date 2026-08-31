import type { EnvParseResult } from "./types";

// Parses KEY=VALUE lines into an env map. Blank lines and # comments are ignored,
// an optional `export ` prefix is stripped, and surrounding quotes are removed.
// Lines that carry no usable key are reported back so the form can reject them.
export default function parseEnvInput(input: string): EnvParseResult {
  const env: Record<string, string> = {};
  const invalidLines: string[] = [];

  for (const rawLine of input.split("\n")) {
    const line = rawLine.trim();

    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    const withoutExport = line.startsWith("export ") ? line.slice("export ".length).trim() : line;
    const separatorIndex = withoutExport.indexOf("=");
    const key = separatorIndex === -1 ? "" : withoutExport.slice(0, separatorIndex).trim();

    if (key.length === 0) {
      invalidLines.push(line);

      continue;
    }

    const value = withoutExport.slice(separatorIndex + 1).trim();

    env[key] = value.replace(/^(["'])(.*)\1$/, "$2");
  }

  return { env, invalidLines };
}
