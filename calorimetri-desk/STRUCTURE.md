# Project Structure

This document describes the folder structure of the Calorimetric Electron Desktop application.

## Directory Layout

```
calorimetri-desk/
├── assets/                      # Static assets (icons, images, fonts)
│   ├── icons/                   # Application icons
│   └── images/                  # Images and graphics
│
├── src/                         # Source code
│   ├── main/                    # Main process (Electron backend)
│   │   ├── index.ts            # Main process entry point
│   │   ├── windows/            # Window management
│   │   │   └── mainWindow.ts  # Main window creation
│   │   ├── ipc/                # IPC handlers (Inter-Process Communication)
│   │   │   └── index.ts       # IPC setup and handlers
│   │   └── services/           # Business logic and services
│   │
│   ├── preload/                # Preload scripts
│   │   └── index.ts           # Preload script entry point
│   │
│   ├── renderer/               # Renderer process (Frontend UI)
│   │   ├── index.ts           # Renderer entry point
│   │   ├── components/        # Reusable UI components
│   │   ├── styles/            # CSS/SCSS styles
│   │   │   └── index.css     # Main stylesheet
│   │   └── utils/             # Frontend utility functions
│   │
│   └── shared/                 # Code shared between processes
│       ├── types/              # TypeScript type definitions
│       │   └── index.ts
│       └── constants/          # Shared constants and enums
│           └── index.ts
│
├── forge.config.ts             # Electron Forge configuration
├── vite.main.config.ts         # Vite config for main process
├── vite.preload.config.ts      # Vite config for preload script
├── vite.renderer.config.ts     # Vite config for renderer process
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── index.html                  # HTML entry point

```

## Process Architecture

### Main Process (`src/main/`)
- **Entry Point**: `index.ts` - Initializes the Electron app
- **Windows**: Window creation and management logic
- **IPC**: Handles communication between main and renderer processes
- **Services**: Business logic, file operations, system APIs

### Preload Scripts (`src/preload/`)
- Bridge between main and renderer processes
- Exposes safe APIs to the renderer
- Handles security context isolation

### Renderer Process (`src/renderer/`)
- **Frontend UI**: HTML, CSS, JavaScript/TypeScript
- **Components**: Reusable UI elements
- **Styles**: Application styling
- **Utils**: Frontend-specific utilities

### Shared (`src/shared/`)
- **Types**: TypeScript interfaces and types used across processes
- **Constants**: Application-wide constants and configuration

## Key Files

- **forge.config.ts**: Electron Forge build and packaging configuration
- **vite.*.config.ts**: Vite bundler configuration for each process
- **tsconfig.json**: TypeScript compiler options
- **package.json**: Project metadata, dependencies, and npm scripts

## Development Workflow

1. **Start Development**: `npm start`
2. **Build App**: `npm run package`
3. **Create Installers**: `npm run make`

## Best Practices

1. Keep main process code in `src/main/`
2. Keep renderer code in `src/renderer/`
3. Use `src/shared/` for code that needs to be accessed by both processes
4. Use IPC channels defined in `src/shared/constants/` for communication
5. Place static assets in `assets/`
6. Use TypeScript types from `src/shared/types/` for type safety
