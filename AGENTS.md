# AGENTS.md

Guidance for coding agents working in this repository.

## Repository context

- This is a **legacy Electron music player** project.
- Favor low-risk, incremental changes over broad refactors.
- Preserve existing behavior unless the task explicitly asks for modernization.

## Primary code areas

- `src/main.js`: Electron main-process lifecycle/window logic.
- `src/client.js`: playback logic, playlist generation, drag/drop, metadata.
- `src/index.html`: app UI and inline styles.
- `package.json`: scripts, dependency versions, electron-builder config.

## Working conventions

- Keep dependencies compatible with legacy Electron unless requested otherwise.
- Do not introduce major framework/tooling changes without explicit instruction.
- Prefer simple CommonJS-style JavaScript consistent with current code.
- Keep UI changes minimal and in the existing style unless asked to redesign.

## Validation checklist

When practical, run these checks after changes:

1. `npm run -s start` (manual runtime check in GUI-capable environments).
2. `npm run -s pack` (packaging sanity check; may be slow).

If the environment cannot run GUI apps, document that limitation clearly.

## Documentation expectations

For any user-facing behavior change, update `README.md` with:

- what changed,
- how to run it,
- known limitations.

## Safety notes

- Avoid destructive file operations unless explicitly requested.
- Keep changes scoped to the task; do not “clean up” unrelated legacy code.
