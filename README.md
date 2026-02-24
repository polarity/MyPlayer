# MyPlayer

MyPlayer is a lightweight desktop music player built with early Electron.
It focuses on a compact always-on-top window, waveform visualization, and quick playback controls for local audio files.

> **Project status:** Archived / legacy project. The codebase targets an older Electron runtime (`1.3.x`) and is kept mostly for reference and light maintenance.

![MyPlayer icon](src/img/myplayer.png)

## Features

- Play local audio files (`.mp3`, `.m4a`, `.wav`).
- Auto-generate a playlist by recursively scanning the selected file's directory.
- Drag-and-drop support for loading tracks.
- ID3 metadata display (artist/title when available).
- Waveform rendering and timeline using `wavesurfer.js`.
- Basic transport controls: open, replay, play/pause, next, previous.
- Optional open-file handling from OS integration (including startup file on Windows).

## Tech stack

- **Electron** application (`main` process in `src/main.js`, renderer in `src/client.js`).
- **wavesurfer.js** for waveform rendering and playback.
- **id3js** for reading local ID3 tags.
- **electron-builder** configuration in `package.json` for packaging.

## Project structure

- `src/main.js` — Electron main process (window creation, app lifecycle, open-file handling).
- `src/client.js` — Renderer logic (playback, playlist handling, metadata updates, UI events).
- `src/index.html` — UI markup and styles.
- `build/` — App icons and packaging metadata.
- `resources/` — Design resources and icon source assets.
- `doc/` — Legacy notes (e.g., file associations on macOS).

## Getting started

### Prerequisites

- Node.js and npm.
- A desktop environment (GUI) to run Electron.

Because this project targets an older Electron release, modern Node versions may not be fully compatible with all legacy dependencies.

### Install

```bash
npm install
```

### Run in development

```bash
npm start
```

### Build distributables

```bash
npm run pack
npm run dist
```

## How playback works

1. Open a file via file picker, drag-and-drop, or OS open-file event.
2. The renderer scans the file's parent directory recursively for supported audio files.
3. A playlist is generated from discovered files.
4. The selected track is loaded as a blob into WaveSurfer and played.
5. Metadata and UI timing labels are updated during playback.

## Known limitations (legacy behavior)

- No streaming support; local files only.
- Uses deprecated Electron APIs and old dependency versions.
- Minimal error handling for unreadable/corrupt media files.
- UI is fixed-size and intentionally minimal.

## Maintenance notes

If you plan to modernize this project, start with:

1. Upgrading Electron and replacing deprecated APIs (`remote`, older app/window options, etc.).
2. Refreshing dependency versions and build tooling.
3. Adding automated tests and linting.
4. Separating UI styles/scripts into maintainable modules.

## License

ISC (see `package.json`).
