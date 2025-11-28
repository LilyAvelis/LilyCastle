# GardenLab

Experimental copy of the core Garden VS Code extension. Use this workspace to stage large refactors (webview extraction, room/item architecture, etc.) without touching the production `04-Сад-Лилий/Garden` folder until the changes are stable.

## Quick start

1. `cd "c:\Users\Garden\Desktop\LilyCastle\04-Сад-Лилий\GardenLab"`
2. `npm install`
3. `npm run compile`
4. Package or launch via VS Code just like the primary extension.

GardenLab shares the same settings and MongoDB collections as Garden, so sessions/pages stay in sync while you test UI or data-layer changes.

## Keeping GardenLab fresh

Whenever the main Garden folder changes, re-run:

```
robocopy "..\Garden" . /E /XD node_modules out .git
npm install
```

This overwrites everything except build artefacts so the lab stays current before starting a new experiment. Commit or copy results back into `Garden` once you are confident in the refactor.
