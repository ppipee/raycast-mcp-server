import type { McpServerEntry, RegistryServer } from "../../types";
import findServerEntryKeys from "../findServerEntryKeys";

// A registry server counts as connected when a client entry launches it through
// connect.sh, or duplicates the registry definition directly.
export default function isServerConnected(
  entries: Record<string, McpServerEntry>,
  server: RegistryServer,
): boolean {
  return findServerEntryKeys(entries, server).length > 0;
}
