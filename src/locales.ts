export const SECTION_PROXY = "Shared Proxy";
export const SECTION_SERVERS = "Registry Servers (~/.ai-code/mcp)";
export const SECTION_CLIENTS = "Clients";

export const PROXY_RUNNING = "Running";
export const PROXY_STOPPED = "Not Running";
export const PROXY_ITEM_TITLE = "mcp-proxy";

export const STATUS_CHECKING = "Checking…";
export const STATUS_HEALTHY = "Working";
export const STATUS_ERROR = "Failed";
export const STATUS_TIMEOUT = "Timed Out";
export const STATUS_NOT_CHECKED = "Not Checked";

export const TIMEOUT_OAUTH_HINT = "No response before timeout — this server uses mcp-remote OAuth and may need browser auth.";
export const TIMEOUT_HINT = "No response before timeout — the command may be slow to install or hung.";

export const ACTION_SHOW_DETAILS = "Show Details";
export const ACTION_RECHECK = "Recheck Health";
export const ACTION_RECHECK_ALL = "Recheck All Servers";
export const ACTION_CONNECT_TO_CLIENT = "Connect to Client";
export const ACTION_OPEN_SERVERS_JSON = "Open servers.json";
export const ACTION_OPEN_CONFIG = "Open Config File";
export const ACTION_OPEN_PROXY_LOG = "Open Proxy Log";
export const ACTION_COPY_COMMAND = "Copy Server Command";
export const ACTION_CONNECT_FORM = "Connect a Server…";

export const CLIENT_CONFIG_MISSING = "Config file not found";
export const CLIENT_CONFIG_INVALID = "Config file is not valid JSON";

export const CONNECT_FORM_TITLE = "Connect MCP Server";
export const CONNECT_FORM_SERVER_LABEL = "Server";
export const CONNECT_FORM_CLIENTS_INFO = "The server is added as a connect.sh entry, matching your existing setup. A .bak backup of each config is written first.";
export const CONNECT_FORM_ALREADY_CONNECTED = "already connected";
export const CONNECT_FORM_SUBMIT = "Connect Server";
export const CONNECT_FORM_NO_SERVERS = "No servers found in ~/.ai-code/mcp/servers.json";
export const CONNECT_FORM_NO_CLIENT_SELECTED = "Select at least one client";

export const ACTION_CONFIGURE_CLIENT = "Configure Client…";
export const ACTION_DISCONNECT_FROM_CLIENT = "Disconnect from Client";

export const CONFIGURE_FORM_CLIENT_LABEL = "Client";
export const CONFIGURE_FORM_SERVERS_LABEL = "Servers";
export const CONFIGURE_FORM_INFO = "Checked servers become the only registry servers this client uses — unchecked ones are removed from its config. Entries not managed by ~/.ai-code/mcp are left untouched. A .bak backup is written first.";
export const CONFIGURE_FORM_SUBMIT = "Apply Configuration";

export const TOAST_CONFIGURED = "Client configured";
export const TOAST_CONFIGURE_FAILED = "Failed to configure client";
export const TOAST_NO_CHANGES = "No changes needed";
export const TOAST_DISCONNECTED = "Server disconnected";

export const TOAST_CONNECTING = "Connecting server…";
export const TOAST_CONNECTED = "Server connected";
export const TOAST_CONNECT_FAILED = "Failed to connect server";
export const TOAST_RESTART_HINT = "Restart the client apps to pick up the change.";

export const ADD_FORM_TITLE = "Add MCP Server";
export const ADD_FORM_NAME_LABEL = "Name";
export const ADD_FORM_COMMAND_LABEL = "Command";
export const ADD_FORM_ARGS_LABEL = "Arguments";
export const ADD_FORM_ENV_LABEL = "Environment Variables";
export const ADD_FORM_SUBMIT = "Add Server";
export const ADD_FORM_INFO =
  "The server is written to ~/.ai-code/mcp/servers.json, next to your existing entries. A .bak backup is written first. Connect it to a client afterwards with Connect MCP Server.";
export const ADD_FORM_NAME_INFO = "Used as the servers.json key and in the connect.sh command. Letters, digits, dot, dash, and underscore only.";
export const ADD_FORM_ARGS_INFO = "Space separated. Quote any argument that contains spaces.";
export const ADD_FORM_ENV_INFO = "One KEY=VALUE per line. Blank lines and # comments are ignored.";

export const ADD_FORM_NAME_REQUIRED = "Enter a server name";
export const ADD_FORM_NAME_INVALID = "Use only letters, digits, dot, dash, and underscore";
export const ADD_FORM_NAME_TAKEN = "A server with this name already exists";
export const ADD_FORM_COMMAND_REQUIRED = "Enter a command";
export const ADD_FORM_ENV_INVALID = "Each line must be KEY=VALUE";
export const ADD_FORM_REGISTRY_MISSING = "servers.json not found";
export const ADD_FORM_REGISTRY_INVALID = "servers.json is not valid JSON";

export const ACTION_ADD_SERVER = "Add New Server…";

export const TOAST_SERVER_ADDED = "Server added to servers.json";
export const TOAST_ADD_FAILED = "Failed to add server";
export const TOAST_PROXY_RESTART_HINT =
  "The shared proxy loads servers.json at startup — restart it (or the client apps) before connecting to the new server.";

export const DETAIL_COMMAND = "Command";
export const DETAIL_ENV_KEYS = "Env Variables";
export const DETAIL_TRANSPORT = "Transport";
export const DETAIL_TRANSPORT_MCP_REMOTE = "mcp-remote (OAuth)";
export const DETAIL_TRANSPORT_STDIO = "stdio";
export const DETAIL_STATUS = "Status";
export const DETAIL_RESPONSE_TIME = "Response Time";
export const DETAIL_SERVER_INFO = "Server Info";
export const DETAIL_CONNECTED_CLIENTS = "Connected Clients";
export const DETAIL_ERROR_OUTPUT = "Error Output";
