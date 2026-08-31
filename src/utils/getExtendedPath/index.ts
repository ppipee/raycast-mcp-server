import { existsSync, readdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Raycast's Node runtime does not inherit nvm/homebrew PATH entries, so servers
// launched via `npx`/`bash` would fail without rebuilding a usable PATH first.
export default function getExtendedPath(): string {
  const home = homedir();
  const nodeBins: string[] = [];
  const nvmVersionsDir = join(home, ".nvm", "versions", "node");

  if (existsSync(nvmVersionsDir)) {
    // Newest version first — older Node binaries break modern MCP servers.
    const versions = readdirSync(nvmVersionsDir).sort((a, b) =>
      b.localeCompare(a, undefined, { numeric: true }),
    );

    for (const version of versions) {
      const bin = join(nvmVersionsDir, version, "bin");

      if (existsSync(join(bin, "npx"))) {
        nodeBins.push(bin);
      }
    }
  }

  const fallbackBins = [join(home, ".local", "bin"), "/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"];

  return [...nodeBins, ...fallbackBins, process.env.PATH ?? ""].join(":");
}
