import { Action, ActionPanel, Form, Icon, popToRoot, showToast, Toast } from "@raycast/api";
import { useMemo, useState } from "react";

import { CLIENTS } from "./constants";
import * as locales from "./locales";
import type { ClientId, ConfigureClientProps, ConfigureResult } from "./types";
import configureClientServers from "./utils/configureClientServers";
import isServerConnected from "./utils/isServerConnected";
import readClientConfig from "./utils/readClientConfig";
import readRegistryServers from "./utils/readRegistryServers";

function summarizeResult(result: ConfigureResult): string {
  const parts: string[] = [];

  if (result.added.length > 0) {
    parts.push(`added ${result.added.join(", ")}`);
  }

  if (result.removed.length > 0) {
    parts.push(`removed ${result.removed.join(", ")}`);
  }

  return parts.join(" · ");
}

export default function ConfigureClient({ initialClientId }: ConfigureClientProps) {
  const [loadError, setLoadError] = useState<string>();
  const [clientId, setClientId] = useState<ClientId>(initialClientId ?? "cursor");

  const servers = useMemo(() => {
    try {
      return readRegistryServers();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));

      return [];
    }
  }, []);

  const clientStatus = useMemo(() => readClientConfig(clientId), [clientId]);

  const onSubmit = async (values: Record<string, unknown>) => {
    const selectedNames = servers.filter((server) => values[server.name] === true).map((server) => server.name);
    const result = configureClientServers({ clientId, registryServers: servers, selectedNames });

    if (result.status === "error") {
      await showToast({ style: Toast.Style.Failure, title: locales.TOAST_CONFIGURE_FAILED, message: result.message });
      return;
    }

    if (result.added.length === 0 && result.removed.length === 0) {
      await showToast({ style: Toast.Style.Success, title: locales.TOAST_NO_CHANGES });
      return;
    }

    await showToast({
      style: Toast.Style.Success,
      title: locales.TOAST_CONFIGURED,
      message: `${summarizeResult(result)} — ${locales.TOAST_RESTART_HINT}`,
    });
    await popToRoot();
  };

  if (loadError || servers.length === 0) {
    return (
      <Form>
        <Form.Description title={locales.CONFIGURE_FORM_SERVERS_LABEL} text={loadError ?? locales.CONNECT_FORM_NO_SERVERS} />
      </Form>
    );
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title={locales.CONFIGURE_FORM_SUBMIT} icon={Icon.Gear} onSubmit={onSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="clientId"
        title={locales.CONFIGURE_FORM_CLIENT_LABEL}
        value={clientId}
        onChange={(value) => setClientId(value as ClientId)}
      >
        {CLIENTS.map((client) => (
          <Form.Dropdown.Item key={client.id} value={client.id} title={client.title} icon={Icon.AppWindow} />
        ))}
      </Form.Dropdown>

      {servers.map((server) => (
        <Form.Checkbox
          key={`${clientId}-${server.name}`}
          id={server.name}
          title={server === servers[0] ? locales.CONFIGURE_FORM_SERVERS_LABEL : undefined}
          label={server.name}
          defaultValue={isServerConnected(clientStatus.entries, server)}
        />
      ))}

      <Form.Description text={locales.CONFIGURE_FORM_INFO} />
    </Form>
  );
}
