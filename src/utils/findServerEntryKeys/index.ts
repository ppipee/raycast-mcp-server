import type { McpServerEntry, RegistryServer } from "../../types";

// Returns the client config keys whose entry launches the given registry server,
// either through connect.sh or as a direct copy of the registry definition.
export default function findServerEntryKeys(
  entries: Record<string, McpServerEntry>,
  server: RegistryServer,
): string[] {
  return Object.entries(entries)
    .filter(([, entry]) => {
      const args = entry.args ?? [];
      const viaConnectScript = args.some((arg) => arg.endsWith("connect.sh")) && args.includes(server.name);
      const directCopy = entry.command === server.command && JSON.stringify(args) === JSON.stringify(server.args);

      return viaConnectScript || directCopy;
    })
    .map(([key]) => key);
}
