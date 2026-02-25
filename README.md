# MyPlayer

MyPlayer is a lightweight desktop music player originally built with early Electron.
It focuses on a compact always-on-top window, waveform visualization, and quick playback controls for local audio files.

> **Project status:** Legacy project under light maintenance. Runtime is updated to modern Electron for compatibility, while core behavior remains unchanged.

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

- `src/main.js` - Electron main process (window creation, app lifecycle, open-file handling).
- `src/client.js` - Renderer logic (playback, playlist handling, metadata updates, UI events).
- `src/index.html` - UI markup and styles.
- `build/` - App icons and packaging metadata.
- `resources/` - Design resources and icon source assets.
- `doc/` - Legacy notes (for example, file associations on macOS).

## Getting started

### Prerequisites

- Node.js and npm.
- A desktop environment (GUI) to run Electron.
- Use an active Node.js LTS release.

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
npm run dist:single
```

`npm run dist:single` creates a single Windows portable `.exe` artifact.
Note: it is a single launcher file for distribution, but Electron still unpacks runtime files internally when the app starts.

## How playback works

1. Open a file via file picker, drag-and-drop, or OS open-file event.
2. The renderer scans the file's parent directory recursively for supported audio files.
3. A playlist is generated from discovered files.
4. The selected track is loaded as a blob into WaveSurfer and played.
5. Metadata and UI timing labels are updated during playback.

## Recent maintenance update (2026-02-24)

- Updated Electron from `1.3.x` to `40.6.0`.
- Replaced deprecated renderer `remote` usage with IPC calls.
- Updated main-process window creation/options for current Electron.
- Added single-instance handling via `app.requestSingleInstanceLock()`.
- Updated window/layout sizing so controls stay inside the fixed player window.
- Updated WaveSurfer initialization to use a safe fallback height for canvas rendering.
- Kept UI and playback behavior intentionally unchanged.

## Known limitations

- No streaming support; local files only.
- Renderer still uses Node integration for compatibility with legacy code.
- Minimal error handling for unreadable/corrupt media files.
- UI is fixed-size and intentionally minimal.

## Maintenance notes

If you plan to modernize this project, start with:

1. Moving renderer file-system access into a preload layer and disabling `nodeIntegration`.
2. Refreshing remaining dependency versions and build tooling.
3. Adding automated tests and linting.
4. Separating UI styles/scripts into maintainable modules.

## License

ISC (see `package.json`).
