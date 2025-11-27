# Calorimetric Electron Desk - Project Documentation

## 📋 Project Overview

**Calorimetric Electron Desk** is a modern desktop application built with Electron, React, and TypeScript. The project follows a well-organized architecture that separates concerns between the main process, renderer process, and shared utilities.

### 🛠 Technology Stack
- **Electron**: Cross-platform desktop application framework
- **React**: UI library for the renderer process
- **TypeScript**: Type-safe JavaScript for better development experience
- **Vite**: Fast build tool and development server
- **Electron Forge**: Packaging and distribution tool

---

## 📁 Project Structure

```
calorimetric-desk/
├── 📄 Configuration Files
│   ├── package.json           # Project metadata, dependencies, and scripts
│   ├── tsconfig.json          # TypeScript compiler configuration
│   ├── forge.config.ts        # Electron Forge build configuration
│   ├── vite.main.config.ts    # Vite config for main process
│   ├── vite.renderer.config.ts # Vite config for renderer process
│   ├── vite.preload.config.ts # Vite config for preload scripts
│   ├── .eslintrc.json         # ESLint configuration
│   ├── .gitignore            # Git ignore patterns
│   └── forge.env.d.ts        # TypeScript declarations for Forge
│
├── 📄 Entry Points
│   ├── index.html            # Main HTML template
│   └── src/                  # Source code directory
│
└── 📁 Source Code (src/)
    ├── 🔧 main/              # Main Process (Node.js)
    │   ├── main.ts          # Main process entry point
    │   ├── services/        # Business logic services
    │   └── windows/         # Window management
    │
    ├── 🎨 renderer/          # Renderer Process (Browser)
    │   ├── index.tsx        # React application entry point
    │   ├── App.tsx          # Root React component
    │   ├── index.css        # Global styles
    │   ├── components/      # Reusable UI components
    │   ├── pages/           # Page/screen components
    │   ├── hooks/           # Custom React hooks
    │   ├── styles/          # Component-specific styles
    │   └── utils/           # Utility functions
    │
    ├── 🔒 preload/           # Preload Scripts
    │   └── preload.ts       # IPC bridge and security
    │
    ├── 🔄 shared/            # Shared Code
    │   ├── types/           # TypeScript type definitions
    │   └── constants/       # Application constants
    │
    └── 📎 assets/            # Static Assets
        ├── icons/           # Application icons
        └── images/          # Static images
```

---

## 📂 Detailed Folder Descriptions

### 🔧 Main Process (`src/main/`)

The main process runs in Node.js and has full access to system resources. It manages the application lifecycle, creates windows, and handles system-level operations.

#### `main.ts`
- **Purpose**: Entry point for the main process
- **Responsibilities**:
  - Application lifecycle management
  - Window creation and management
  - System event handling (app ready, window closed, etc.)
  - IPC communication setup
- **Key Features**:
  - Handles Squirrel startup events (Windows installer)
  - Creates and configures browser windows
  - Manages application quit behavior

#### `services/` (Empty)
- **Purpose**: Business logic and system services
- **Intended Content**:
  - File system operations
  - Database connections
  - External API integrations
  - Background processes
  - System tray management

#### `windows/` (Empty)
- **Purpose**: Window management and configuration
- **Intended Content**:
  - Window creation utilities
  - Window state management
  - Multi-window coordination
  - Window-specific configurations

### 🎨 Renderer Process (`src/renderer/`)

The renderer process runs in Chromium and handles the user interface. It uses React for component-based development and has limited access to system resources for security.

#### `index.tsx`
- **Purpose**: React application entry point
- **Responsibilities**:
  - Mounts the React application to the DOM
  - Initializes the renderer process
  - Handles root element creation if missing
- **Key Features**:
  - Uses React 18's `createRoot` API
  - Graceful fallback for missing root element

#### `App.tsx`
- **Purpose**: Root React component
- **Responsibilities**:
  - Application layout and routing
  - Global state management setup
  - Theme provider setup
- **Current State**: Basic welcome component

#### `index.css`
- **Purpose**: Global CSS styles
- **Responsibilities**:
  - CSS reset/normalize
  - Global CSS variables
  - Base typography and layout styles

#### `components/`
- **Purpose**: Reusable UI components
- **Intended Content**:
  - Buttons, inputs, forms
  - Cards, modals, dialogs
  - Navigation components
  - Data display components
- **Organization**: Export components from `index.ts` for clean imports

#### `pages/`
- **Purpose**: Full-page/screen components
- **Intended Content**:
  - Home/Dashboard pages
  - Settings pages
  - Data management pages
  - Authentication pages
- **Organization**: Page components that compose smaller components

#### `hooks/`
- **Purpose**: Custom React hooks for reusable logic
- **Intended Content**:
  - Data fetching hooks
  - Window management hooks
  - Form handling hooks
  - Local storage hooks
- **Organization**: Export hooks from `index.ts`

#### `styles/`
- **Purpose**: Component-specific stylesheets
- **Intended Content**:
  - CSS modules
  - Styled-components
  - Component-specific styling

#### `utils/`
- **Purpose**: Pure utility functions and helpers
- **Intended Content**:
  - Date formatting functions
  - Data transformation utilities
  - Validation helpers
  - API client utilities
- **Organization**: Export utilities from `index.ts`

### 🔒 Preload Scripts (`src/preload/`)

#### `preload.ts`
- **Purpose**: Security bridge between main and renderer processes
- **Responsibilities**:
  - Exposes safe APIs to the renderer process
  - Implements context isolation
  - Handles IPC communication securely
- **Key Features**:
  - Uses Electron's `contextBridge`
  - Prevents direct Node.js access from renderer
  - Provides typed API interfaces

### 🔄 Shared Code (`src/shared/`)

#### `types/`
- **Purpose**: TypeScript type definitions shared across processes
- **Intended Content**:
  - IPC message interfaces
  - Data model types
  - API response types
  - Configuration interfaces
- **Benefits**: Ensures type consistency between main and renderer processes

#### `constants/`
- **Purpose**: Application-wide constants
- **Intended Content**:
  - IPC channel names
  - File paths
  - Configuration values
  - Error codes
  - UI constants (colors, sizes)

### 📎 Assets (`src/assets/`)

#### `icons/`
- **Purpose**: Application icons and favicons
- **Intended Content**:
  - PNG, ICO, ICNS icon files
  - Different sizes for various platforms
  - Application branding assets

#### `images/`
- **Purpose**: Static images and graphics
- **Intended Content**:
  - Background images
  - Logo files
  - Illustration assets
  - Screenshots

---

## ⚙️ Configuration Files

### `package.json`
- **Purpose**: Project metadata and dependency management
- **Key Sections**:
  - **scripts**: Build, start, package, and lint commands
  - **dependencies**: Runtime dependencies (React, Electron)
  - **devDependencies**: Development tools (TypeScript, ESLint, Vite)
  - **main**: Entry point for packaged application

### `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Key Settings**:
  - Target: ESNext modules
  - JSX: React JSX transform
  - Module resolution: Node.js style
  - Source maps enabled

### `forge.config.ts`
- **Purpose**: Electron Forge build and packaging configuration
- **Key Features**:
  - Vite plugin integration
  - Multiple build targets (main, preload, renderer)
  - Packaging options (ASAR, makers)
  - Security fuses configuration

### Vite Configuration Files
- **`vite.main.config.ts`**: Main process build configuration
- **`vite.renderer.config.ts`**: Renderer process build configuration
- **`vite.preload.config.ts`**: Preload script build configuration

### `.eslintrc.json`
- **Purpose**: Code linting configuration
- **Features**:
  - TypeScript support
  - Electron-specific rules
  - Import/export validation

---

## 🔄 Application Architecture

### Process Model
1. **Main Process**: Node.js environment with full system access
2. **Renderer Process**: Chromium environment with limited access
3. **Preload Scripts**: Bridge between processes with security controls

### Data Flow
```
User Interaction → Renderer Process → Preload API → IPC → Main Process → System APIs
```

### Security Model
- **Context Isolation**: Renderer cannot directly access Node.js APIs
- **Preload Bridge**: Controlled API exposure through contextBridge
- **Security Fuses**: Runtime security hardening

---

## 🚀 Development Workflow

### Getting Started
```bash
npm install          # Install dependencies
npm start           # Start development server
npm run package     # Package application
npm run make        # Create distributables
npm run lint        # Run linting
```

### Development Features
- **Hot Reload**: Vite provides fast development experience
- **Type Safety**: TypeScript ensures compile-time error checking
- **Code Quality**: ESLint enforces consistent code standards
- **Cross-Platform**: Electron Forge handles platform-specific builds

---

## 📈 Future Development Areas

### Immediate Next Steps
1. **Implement IPC Communication**: Set up secure channels between processes
2. **Add Routing**: Implement React Router for multi-page navigation
3. **State Management**: Add Redux/Zustand for global state
4. **UI Components**: Build reusable component library
5. **Services Layer**: Implement business logic in main process

### Advanced Features
- **Database Integration**: Add SQLite or similar
- **File System Operations**: Implement file management
- **System Tray**: Add tray icon and menu
- **Auto Updates**: Implement update mechanism
- **Native Menus**: Add application and context menus

---

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [Electron Forge Documentation](https://www.electronforge.io)

---

*This documentation provides a comprehensive overview of the Calorimetric Electron Desk project structure and architecture. As the project evolves, this document should be updated to reflect new features and organizational changes.*