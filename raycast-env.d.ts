/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `inspect-mcp-servers` command */
  export type InspectMcpServers = ExtensionPreferences & {}
  /** Preferences accessible in the `add-mcp-server` command */
  export type AddMcpServer = ExtensionPreferences & {}
  /** Preferences accessible in the `connect-mcp-server` command */
  export type ConnectMcpServer = ExtensionPreferences & {}
  /** Preferences accessible in the `configure-client` command */
  export type ConfigureClient = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `inspect-mcp-servers` command */
  export type InspectMcpServers = {}
  /** Arguments passed to the `add-mcp-server` command */
  export type AddMcpServer = {}
  /** Arguments passed to the `connect-mcp-server` command */
  export type ConnectMcpServer = {}
  /** Arguments passed to the `configure-client` command */
  export type ConfigureClient = {}
}

