import { Color, Detail, Icon } from "@raycast/api";

import * as locales from "../../locales";
import type { ServerDetailProps } from "./types";

const STATE_TAGS = {
  healthy: { text: locales.STATUS_HEALTHY, color: Color.Green, icon: Icon.CheckCircle },
  error: { text: locales.STATUS_ERROR, color: Color.Red, icon: Icon.XMarkCircle },
  timeout: { text: locales.STATUS_TIMEOUT, color: Color.Orange, icon: Icon.Clock },
};

export default function ServerDetail({ server, health, isChecking, connectedClientTitles }: ServerDetailProps) {
  const commandLine = [server.command, ...server.args].join(" ");
  const envKeys = Object.keys(server.env);
  const stateTag = health ? STATE_TAGS[health.state] : undefined;
  const statusText = isChecking ? locales.STATUS_CHECKING : (stateTag?.text ?? locales.STATUS_NOT_CHECKED);

  const markdownSections = [
    `# ${server.name}`,
    `**${locales.DETAIL_COMMAND}**\n\n\`\`\`\n${commandLine}\n\`\`\``,
  ];

  if (health?.message) {
    markdownSections.push(`**${locales.DETAIL_ERROR_OUTPUT}**\n\n\`\`\`\n${health.message}\n\`\`\``);
  }

  return (
    <Detail
      markdown={markdownSections.join("\n\n")}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title={locales.DETAIL_STATUS}>
            <Detail.Metadata.TagList.Item text={statusText} color={isChecking ? Color.Blue : stateTag?.color} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Label
            title={locales.DETAIL_TRANSPORT}
            text={server.usesMcpRemote ? locales.DETAIL_TRANSPORT_MCP_REMOTE : locales.DETAIL_TRANSPORT_STDIO}
          />
          {health?.state === "healthy" && (
            <Detail.Metadata.Label
              title={locales.DETAIL_SERVER_INFO}
              text={`${health.serverName ?? "unknown"} ${health.serverVersion ?? ""}`.trim()}
            />
          )}
          {health && (
            <Detail.Metadata.Label title={locales.DETAIL_RESPONSE_TIME} text={`${(health.durationMs / 1000).toFixed(1)}s`} />
          )}
          <Detail.Metadata.Separator />
          <Detail.Metadata.TagList title={locales.DETAIL_CONNECTED_CLIENTS}>
            {connectedClientTitles.length > 0 ? (
              connectedClientTitles.map((title) => (
                <Detail.Metadata.TagList.Item key={title} text={title} color={Color.Green} />
              ))
            ) : (
              <Detail.Metadata.TagList.Item text="None" color={Color.SecondaryText} />
            )}
          </Detail.Metadata.TagList>
          {envKeys.length > 0 && (
            <Detail.Metadata.Label title={locales.DETAIL_ENV_KEYS} text={envKeys.join(", ")} />
          )}
        </Detail.Metadata>
      }
    />
  );
}
