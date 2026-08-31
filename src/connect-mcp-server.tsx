import { Action, ActionPanel, Form, Icon, popToRoot, showToast, Toast } from "@raycast/api";
import { useMemo, useState } from "react";

import { CLIENTS } from "./constants";
import * as locales from "./locales";
import type { ClientId, ConnectResult } from "./types";
import addServerToClient from "./utils/addServerToClient";
import isServerConnected from "./utils/isServerConnected";
import readClientConfig from "./utils/readClientConfig";
import readRegistryServers from "./utils/readRegistryServers";

interface ConnectFormValues {
  serverName: string;
  cursor: boolean;
  "claude-code": boolean;
  "claude-desktop": boolean;
}

function summarizeResults(results: ConnectResult[]): string {
  return results
    .map((result) => {
      const title = CLIENTS.find((client) => client.id === result.clientId)?.title ?? result.clientId;

      if (result.status === "added") {
        return `${title}: added`;
      }

      if (result.status === "already-connected") {
        return `${title}: already connected`;
      }

      return `${title}: ${result.message ?? "failed"}`;
    })
    .join(" · ");
}

export default function ConnectMcpServer() {
  const [loadError, setLoadError] = useState<string>();

  const servers = useMemo(() => {
    try {
      return readRegistryServers();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));

      return [];
    }
  }, []);

  const clientStatuses = useMemo(() => CLIENTS.map((client) => readClientConfig(client.id)), []);
  const [serverName, setServerName] = useState(servers[0]?.name ?? "");

  const selectedServer = servers.find((server) => server.name === serverName);

  const connectedTitles = (candidateName: string) => {
    const candidate = servers.find((server) => server.name === candidateName);

    if (!candidate) {
      return [];
    }

    return clientStatuses
      .filter((status) => isServerConnected(status.entries, candidate))
      .map((status) => CLIENTS.find((client) => client.id === status.clientId)?.title ?? status.clientId);
  };

  const onSubmit = async (values: ConnectFormValues) => {
    if (!selectedServer) {
      return;
    }

    const selectedClientIds = CLIENTS.map((client) => client.id).filter((id) => values[id]);

    if (selectedClientIds.length === 0) {
      await showToast({ style: Toast.Style.Failure, title: locales.CONNECT_FORM_NO_CLIENT_SELECTED });
      return;
    }

    await showToast({ style: Toast.Style.Animated, title: locales.TOAST_CONNECTING });

    const results = selectedClientIds.map((clientId: ClientId) => addServerToClient(selectedServer, clientId));
    const failed = results.filter((result) => result.status === "error");

    if (failed.length > 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: locales.TOAST_CONNECT_FAILED,
        message: summarizeResults(results),
      });
      return;
    }

    await showToast({
      style: Toast.Style.Success,
      title: locales.TOAST_CONNECTED,
      message: `${summarizeResults(results)} — ${locales.TOAST_RESTART_HINT}`,
    });
    await popToRoot();
  };

  if (loadError || servers.length === 0) {
    return (
      <Form>
        <Form.Description title={locales.CONNECT_FORM_TITLE} text={loadError ?? locales.CONNECT_FORM_NO_SERVERS} />
      </Form>
    );
  }

  const alreadyConnected = connectedTitles(serverName);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title={locales.CONNECT_FORM_SUBMIT} icon={Icon.Plug} onSubmit={onSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="serverName"
        title={locales.CONNECT_FORM_SERVER_LABEL}
        value={serverName}
        onChange={setServerName}
      >
        {servers.map((server) => (
          <Form.Dropdown.Item
            key={server.name}
            value={server.name}
            title={server.name}
            icon={Icon.HardDrive}
          />
        ))}
      </Form.Dropdown>

      {CLIENTS.map((client) => {
        const isConnected = alreadyConnected.includes(client.title);

        return (
          <Form.Checkbox
            key={`${serverName}-${client.id}`}
            id={client.id}
            label={isConnected ? `${client.title} (${locales.CONNECT_FORM_ALREADY_CONNECTED})` : client.title}
            defaultValue={!isConnected}
          />
        );
      })}

      <Form.Description text={locales.CONNECT_FORM_CLIENTS_INFO} />
    </Form>
  );
}
