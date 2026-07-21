# Stacks Buddy for Raycast

Search and run every Buddy command registered by a local Stacks project, including custom commands from `app/Commands`.

## How it works

The extension reads the selected project's command inventory with:

```sh
./buddy list --json --no-interaction
```

There is no hosted command API and no stale command catalog. The list always reflects the framework and custom commands installed in the selected project.

## Setup

1. Install the extension in Raycast.
2. Choose a Stacks project directory in the extension preferences.
3. Optionally choose the terminal application used to launch commands.
4. Open `Stacks Buddy`, search for a command, and press Return.

Commands open in a terminal so interactive prompts, logs, and long-running development servers behave exactly as they do when Buddy is launched directly. Commands that remove or replace resources receive an additional Raycast confirmation before the terminal opens.

## Development

```sh
bun install
bun run dev
```

Validate the extension with:

```sh
bun test
bun run typecheck
bun run lint
bun run build
```

## License

MIT
