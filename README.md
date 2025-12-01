# CloudWatch Log Viewer

A desktop application to view AWS CloudWatch Logs more easily and beautifully.

Built with Tauri + SvelteKit.

## Getting Started

### Prerequisites

- Node.js (using pnpm)
- Rust and Cargo
- Tauri CLI

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm tauri dev
```

## Build

To create a production build:

```bash
pnpm tauri build
```

The built app will be created in the `src-tauri/target/release/bundle/` directory.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).
