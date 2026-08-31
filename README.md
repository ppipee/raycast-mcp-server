# MCP Server Inspector

A Raycast extension for managing MCP (Model Context Protocol) servers defined in
`~/.ai-code/mcp/servers.json` and connecting them to your AI coding clients — Cursor, Claude Code,
and Claude Desktop.

## Commands

- **Inspect MCP Servers** — Check whether the MCP servers in `~/.ai-code/mcp` are healthy and see
  which clients currently use them.
- **Add MCP Server** — Add a new MCP server definition to `~/.ai-code/mcp/servers.json`.
- **Connect MCP Server** — Wire an MCP server from `~/.ai-code/mcp` into Cursor, Claude Code, or
  Claude Desktop.
- **Configure Client MCP Servers** — Choose exactly which servers a client uses; unchecked servers
  are removed from that client's config.

## How it works

Server definitions live in a single shared file, `~/.ai-code/mcp/servers.json`, and are proxied
through a local health-check/connect process (`~/.ai-code/mcp/connect.sh`) on port `9100`. Each
supported client reads/writes its own config file:

| Client | Config path |
|---|---|
| Cursor | `~/.cursor/mcp.json` |
| Claude Code | `~/.claude.json` |
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` |

## Development

```bash
npm install
npm run dev
```

```bash
npm run build
```

Requires the [Raycast](https://www.raycast.com/) app and the `ray` CLI (installed via
`@raycast/api`).
