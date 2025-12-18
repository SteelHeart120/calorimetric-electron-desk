# Bug Fix: Cannot find module 'better-sqlite3' in Packaged App

## Problem
When running the application after packaging it with `pnpm package`, the app would fail to start with the error:
`Error: Cannot find module 'better-sqlite3'`

This occurred because `better-sqlite3` is a native C++ module, and `pnpm`'s default symlinked `node_modules` structure, combined with Electron Forge's packaging process and Vite's bundling, prevented the module from being correctly included or resolved in the final production build.

## Solution

The fix involved several steps to ensure the native module is correctly installed, bundled, and unpacked at runtime:

### 1. Dependency Hoisting (`.npmrc`)
Added a `.npmrc` file to the project root to force `pnpm` to use a flat (hoisted) `node_modules` structure. This makes it easier for Electron Forge to find and copy dependencies.
```ini
node-linker=hoisted
shamefully-hoist=true
```

### 2. Vite Configuration (`vite.main.config.ts`)
Updated the Vite configuration for the main process to:
-   Mark `better-sqlite3` as an external module so Vite doesn't try to bundle it.
-   Set the resolve condition to `node` to ensure correct module resolution.

### 3. Forge Configuration (`forge.config.ts`)
Modified the Electron Forge configuration to handle the native module specifically:
-   **ASAR Unpacking**: Configured `packagerConfig.asar.unpack` to keep `better-sqlite3` outside the ASAR archive. Native modules (`.node` files) cannot be executed directly from within an ASAR file.
-   **Production Install Hook**: Added a `packageAfterCopy` hook. This hook manually creates a minimal `package.json` in the temporary build directory and runs `npm install --production`. This ensures that `better-sqlite3` and its binary dependencies are physically present in the `resources/app` folder of the packaged app, bypassing `pnpm` symlink issues.

## Verification
After applying these changes, running `pnpm package` produces a build where `better-sqlite3` is correctly located in `resources/app.asar.unpacked/node_modules/better-sqlite3`, and the application initializes the database successfully on startup.
