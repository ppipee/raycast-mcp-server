import { useCallback, useEffect, useState } from "react";

import { CLIENTS } from "../../constants";
import type { ClientConfigStatus, HealthResult, RegistryServer } from "../../types";
import checkProxyStatus from "../../utils/checkProxyStatus";
import checkServerHealth from "../../utils/checkServerHealth";
import readClientConfig from "../../utils/readClientConfig";
import readRegistryServers from "../../utils/readRegistryServers";

export default function useMcpInspector() {
  const [servers, setServers] = useState<RegistryServer[]>([]);
  const [clientStatuses, setClientStatuses] = useState<ClientConfigStatus[]>([]);
  const [proxyRunning, setProxyRunning] = useState<boolean>();
  const [healthResults, setHealthResults] = useState<Record<string, HealthResult>>({});
  const [checkingNames, setCheckingNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();

  const checkHealth = useCallback(async (server: RegistryServer) => {
    setCheckingNames((names) => (names.includes(server.name) ? names : [...names, server.name]));

    const result = await checkServerHealth(server);

    setHealthResults((results) => ({ ...results, [server.name]: result }));
    setCheckingNames((names) => names.filter((name) => name !== server.name));
  }, []);

  const checkAllHealth = useCallback(
    async (targets: RegistryServer[]) => {
      await Promise.all(targets.map((server) => checkHealth(server)));
    },
    [checkHealth],
  );

  const refreshConfigs = useCallback(() => {
    try {
      const registryServers = readRegistryServers();

      setServers(registryServers);
      setClientStatuses(CLIENTS.map((client) => readClientConfig(client.id)));
      setLoadError(undefined);

      return registryServers;
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));

      return [];
    }
  }, []);

  useEffect(() => {
    const registryServers = refreshConfigs();

    void checkProxyStatus().then(setProxyRunning);
    setIsLoading(false);
    void checkAllHealth(registryServers);
  }, [refreshConfigs, checkAllHealth]);

  const recheckProxy = useCallback(async () => {
    setProxyRunning(undefined);
    setProxyRunning(await checkProxyStatus());
  }, []);

  return {
    servers,
    clientStatuses,
    proxyRunning,
    healthResults,
    checkingNames,
    isLoading,
    loadError,
    checkHealth,
    checkAllHealth,
    refreshConfigs,
    recheckProxy,
  };
}
