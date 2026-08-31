import { Action, ActionPanel, Color, Icon, List, showToast, Toast } from "@raycast/api";

import ServerDetail from "./components/ServerDetail";
import { CLIENTS, PROXY_LOG_PATH, PROXY_PORT, SERVERS_JSON_PATH } from "./constants";
import useMcpInspector from "./hooks/useMcpInspector";
import * as locales from "./locales";
import type { ClientConfigStatus, ClientId, HealthResult, RegistryServer } from "./types";
import addServerToClient from "./utils/addServerToClient";
import configureClientServers from "./utils/configureClientServers";
import isServerConnected from "./utils/isServerConnected";
import AddMcpServer from "./add-mcp-server";
import ConfigureClient from "./configure-client";
import ConnectMcpServer from "./connect-mcp-server";

const HEALTH_ACCESSORIES = {
  healthy: { icon: { source: Icon.CheckCircle, tintColor: Color.Green }, text: locales.STATUS_HEALTHY },
  error: { icon: { source: Icon.XMarkCircle, tintColor: Color.Red }, text: locales.STATUS_ERROR },
  timeout: { icon: { source: Icon.Clock, tintColor: Color.Orange }, text: locales.STATUS_TIMEOUT },
};

function healthAccessory(health: HealthResult | undefined, isChecking: boolean): List.Item.Accessory {
  if (isChecking) {
    return { icon: { source: Icon.CircleProgress }, text: locales.STATUS_CHECKING };
  }

  if (!health) {
    return { icon: Icon.Circle, text: locales.STATUS_NOT_CHECKED };
  }

  const accessory = HEALTH_ACCESSORIES[health.state];
  const seconds = `${(health.durationMs / 1000).toFixed(1)}s`;

  return { icon: accessory.icon, text: `${accessory.text} (${seconds})`, tooltip: health.message };
}

function connectedClientTitles(server: RegistryServer, clientStatuses: ClientConfigStatus[]): string[] {
  return CLIENTS.filter((client) => {
    const status = clientStatuses.find((candidate) => candidate.clientId === client.id);

    return status ? isServerConnected(status.entries, server) : false;
  }).map((client) => client.title);
}

export default function InspectMcpServers() {
  const inspector = useMcpInspector();
  const { servers, clientStatuses, proxyRunning, healthResults, checkingNames, isLoading, loadError } = inspector;

  const onDisconnect = async (server: RegistryServer, clientId: ClientId) => {
    const status = clientStatuses.find((candidate) => candidate.clientId === clientId);
    const connectedNames = servers
      .filter((candidate) => status && isServerConnected(status.entries, candidate))
      .map((candidate) => candidate.name);
    const result = configureClientServers({
      clientId,
      registryServers: servers,
      selectedNames: connectedNames.filter((name) => name !== server.name),
    });

    if (result.status === "ok") {
      inspector.refreshConfigs();
      await showToast({ style: Toast.Style.Success, title: locales.TOAST_DISCONNECTED, message: locales.TOAST_RESTART_HINT });
    } else {
      await showToast({ style: Toast.Style.Failure, title: locales.TOAST_CONFIGURE_FAILED, message: result.message });
    }
  };

  const onConnect = async (server: RegistryServer, clientId: (typeof CLIENTS)[number]["id"]) => {
    const result = addServerToClient(server, clientId);

    if (result.status === "added") {
      inspector.refreshConfigs();
      await showToast({ style: Toast.Style.Success, title: locales.TOAST_CONNECTED, message: locales.TOAST_RESTART_HINT });
    } else if (result.status === "already-connected") {
      await showToast({ style: Toast.Style.Success, title: locales.TOAST_CONNECTED, message: "Already connected." });
    } else {
      await showToast({ style: Toast.Style.Failure, title: locales.TOAST_CONNECT_FAILED, message: result.message });
    }
  };

  if (loadError) {
    return (
      <List>
        <List.EmptyView icon={Icon.Warning} title={locales.CONNECT_FORM_NO_SERVERS} description={loadError} />
      </List>
    );
  }

  return (
    <List isLoading={isLoading || checkingNames.length > 0}>
      <List.Section title={locales.SECTION_PROXY}>
        <List.Item
          title={locales.PROXY_ITEM_TITLE}
          subtitle={`port ${PROXY_PORT}`}
          icon={
            proxyRunning === undefined
              ? { source: Icon.CircleProgress }
              : { source: Icon.Dot, tintColor: proxyRunning ? Color.Green : Color.Red }
          }
          accessories={[{ text: proxyRunning === undefined ? locales.STATUS_CHECKING : proxyRunning ? locales.PROXY_RUNNING : locales.PROXY_STOPPED }]}
          actions={
            <ActionPanel>
              <Action title={locales.ACTION_RECHECK} icon={Icon.ArrowClockwise} onAction={() => void inspector.recheckProxy()} />
              <Action.Open title={locales.ACTION_OPEN_PROXY_LOG} target={PROXY_LOG_PATH} />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title={locales.SECTION_SERVERS}>
        {servers.map((server) => {
          const isChecking = checkingNames.includes(server.name);
          const health = healthResults[server.name];
          const clientTitles = connectedClientTitles(server, clientStatuses);
          const commandLine = [server.command, ...server.args].join(" ");

          return (
            <List.Item
              key={server.name}
              title={server.name}
              subtitle={commandLine.length > 60 ? `${commandLine.slice(0, 60)}…` : commandLine}
              icon={Icon.HardDrive}
              accessories={[
                ...clientTitles.map((title) => ({ tag: { value: title, color: Color.Green } })),
                healthAccessory(health, isChecking),
              ]}
              actions={
                <ActionPanel>
                  <Action.Push
                    title={locales.ACTION_SHOW_DETAILS}
                    icon={Icon.Sidebar}
                    target={
                      <ServerDetail
                        server={server}
                        health={health}
                        isChecking={isChecking}
                        connectedClientTitles={clientTitles}
                      />
                    }
                  />
                  <Action
                    title={locales.ACTION_RECHECK}
                    icon={Icon.ArrowClockwise}
                    onAction={() => void inspector.checkHealth(server)}
                  />
                  <ActionPanel.Submenu
                    title={locales.ACTION_CONNECT_TO_CLIENT}
                    icon={Icon.Plug}
                    shortcut={{ modifiers: ["cmd"], key: "n" }}
                  >
                    {CLIENTS.filter((client) => !clientTitles.includes(client.title)).map((client) => (
                      <Action key={client.id} title={client.title} onAction={() => void onConnect(server, client.id)} />
                    ))}
                  </ActionPanel.Submenu>
                  <ActionPanel.Submenu
                    title={locales.ACTION_DISCONNECT_FROM_CLIENT}
                    icon={Icon.MinusCircle}
                    shortcut={{ modifiers: ["cmd"], key: "d" }}
                  >
                    {CLIENTS.filter((client) => clientTitles.includes(client.title)).map((client) => (
                      <Action
                        key={client.id}
                        title={client.title}
                        style={Action.Style.Destructive}
                        onAction={() => void onDisconnect(server, client.id)}
                      />
                    ))}
                  </ActionPanel.Submenu>
                  <Action
                    title={locales.ACTION_RECHECK_ALL}
                    icon={Icon.ArrowClockwise}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
                    onAction={() => void inspector.checkAllHealth(servers)}
                  />
                  <Action.Push
                    title={locales.ACTION_ADD_SERVER}
                    icon={Icon.PlusCircle}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "n" }}
                    target={<AddMcpServer />}
                    onPop={() => inspector.refreshConfigs()}
                  />
                  <Action.Open title={locales.ACTION_OPEN_SERVERS_JSON} target={SERVERS_JSON_PATH} />
                  <Action.CopyToClipboard title={locales.ACTION_COPY_COMMAND} content={commandLine} />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>

      <List.Section title={locales.SECTION_CLIENTS}>
        {CLIENTS.map((client) => {
          const status = clientStatuses.find((candidate) => candidate.clientId === client.id);
          const connectedCount = servers.filter((server) => status && isServerConnected(status.entries, server)).length;
          const problem = !status?.exists
            ? locales.CLIENT_CONFIG_MISSING
            : !status.valid
              ? locales.CLIENT_CONFIG_INVALID
              : undefined;

          return (
            <List.Item
              key={client.id}
              title={client.title}
              subtitle={client.configPath.replace(/^\/Users\/[^/]+/, "~")}
              icon={
                problem
                  ? { source: Icon.XMarkCircle, tintColor: Color.Red }
                  : { source: Icon.CheckCircle, tintColor: Color.Green }
              }
              accessories={[
                problem
                  ? { tag: { value: problem, color: Color.Red } }
                  : { text: `${connectedCount}/${servers.length} registry servers` },
              ]}
              actions={
                <ActionPanel>
                  <Action.Push
                    title={locales.ACTION_CONFIGURE_CLIENT}
                    icon={Icon.Gear}
                    target={<ConfigureClient initialClientId={client.id} />}
                  />
                  <Action.Open title={locales.ACTION_OPEN_CONFIG} target={client.configPath} />
                  <Action.Push title={locales.ACTION_CONNECT_FORM} icon={Icon.Plug} target={<ConnectMcpServer />} />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
    </List>
  );
}
