# TETHER_ARCHITECT Agent - Deployment & Testing Guide

## Overview
**TETHER_ARCHITECT** is a declarative agent for Microsoft 365 Copilot that orchestrates the Tether project. It works in both **Antigravity** (web) and **VS Code Insiders** (local development).

---

## 📦 Project Structure

```
agent-tether-orchestrator/
├── appPackage/
│   ├── manifest.json              # Teams app manifest
│   ├── declarativeAgent.json       # Agent definition and instructions
│   └── ai-plugin.json              # MCP plugin configuration
├── .vscode/
│   └── mcp.json                    # VS Code MCP server config
├── .env.local                      # Environment variables
└── README.md                       # This file
```

---