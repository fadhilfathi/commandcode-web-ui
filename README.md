# Command Code Web UI

A team orchestration dashboard for managing [Command Code](https://commandcode.ai) agents. Spawn, monitor, and control multiple AI coding agents from a single web interface.

## What It Does

Command Code Web UI lets you run a **team of Command Code agents** in parallel, each working on different tasks across different projects. Think of it as a control center for your AI developer team.

- **Chat with agents** — Send instructions and get real-time responses from any agent
- **Manage agents** — Configure models, project directories, and extra arguments per agent
- **Monitor status** — See which agents are running, idle, completed, or failed
- **Assign tasks** — Create tasks and assign them to specific agents or let them auto-assign
- **Stream output** — Watch agent output in real-time via WebSocket streaming

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3, Naive UI, Pinia, Vue Router, Vite |
| Backend | Koa 2, Socket.IO, lowdb |
| Shared | TypeScript, Turborepo monorepo |
| Runtime | Node.js >= 20 |

## Project Structure

```
commandcode-web-ui/
├── packages/
│   ├── client/          # Vue 3 frontend (Vite, Naive UI)
│   ├── server/          # Koa 2 backend (Socket.IO, lowdb)
│   └── shared/          # Shared TypeScript types
├── package.json         # Monorepo root (Turborepo)
└── turbo.json
```

## Getting Started

### Prerequisites

- Node.js >= 20
- [Command Code CLI](https://commandcode.ai) installed globally (`npm i -g command-code`)

### Install

```bash
git clone https://github.com/fadhilfathi/commandcode-web-ui.git
cd commandcode-web-ui
npm install
npm run build:shared
```

### Development

```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 5173). Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
```

## Configuration

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `HOST` | `127.0.0.1` | Backend bind address |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed CORS origins |
| `API_KEY` | — | Optional API key for remote access |
| `ALLOW_REMOTE` | `false` | Set `true` to bind to `0.0.0.0` |

## Usage

### 1. Create an Agent

Go to **Manage Agents** in the sidebar, click **+ New**, and fill in:
- **Name** — A display name for the agent
- **Project Directory** — The working directory for the agent
- **Model** — Optional model override (e.g., `claude-sonnet-4-6`)

### 2. Chat with an Agent

Go to **Chat**, select an agent from the list, and start sending messages. The agent processes your instructions using the Command Code CLI and streams output in real-time.

### 3. Monitor from Dashboard

The **Dashboard** shows all agents with their current status, running task counts, and recent activity.

### 4. Manage Tasks

Go to **Tasks** to create, assign, and track work across your agent team.

## Architecture

```
┌─────────────────────┐     WebSocket      ┌──────────────────────┐
│   Vue 3 Frontend    │ ◄────────────────► │   Koa 2 Backend      │
│   (Vite :5173)      │     REST API       │   (Socket.IO :3001)  │
│                     │                    │                      │
│   Naive UI          │                    │   Agent Manager      │
│   Pinia Stores      │                    │   Stream Router      │
│   Vue Router        │                    │   Task Scheduler     │
└─────────────────────┘                    │   lowdb (JSON)       │
                                           └──────────┬───────────┘
                                                      │ child_process
                                                      ▼
                                           ┌──────────────────────┐
                                           │  cmd -p "task"       │
                                           │  (Command Code CLI)  │
                                           └──────────────────────┘
```

## Features

### Chat Interface
- Per-agent conversation threads
- Persistent message history
- Real-time output streaming via Socket.IO
- Agent status indicators (idle, running, completed, failed)

### Agent Management
- Create, edit, and delete agents
- Configure model, project directory, color, and extra CLI arguments
- View session history and current status
- Color-coded agent cards

### Dashboard
- Overview of all agents and their statuses
- Running/idle/completed/failed counts
- Recent task activity feed
- Quick navigation to agent details

### Task System
- Create tasks with titles and descriptions
- Assign tasks to specific agents or auto-assign to idle agents
- Task status tracking (queued, assigned, running, completed, failed)
- Retry logic for failed tasks

## Environment Variables

Data is stored in `~/.commandcode-web-ui/dashboard.json` by default. Override with `CCMD_DATA_DIR`.

## License

MIT
