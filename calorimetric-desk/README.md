# Calorimetric Electron Desk

A modern desktop application built with Electron, React, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm start

# Package application
pnpm run package

# Create distributables
pnpm run make
```

## 📖 Documentation

For comprehensive project documentation including:
- Detailed folder structure and purposes
- Architecture overview
- Development guidelines
- Configuration explanations

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

For Sidebar component documentation:
- Props and interfaces
- Usage examples
- Customization guide

See [SIDEBAR_COMPONENT.md](./SIDEBAR_COMPONENT.md)

## 🛠 Tech Stack

- **Electron** - Cross-platform desktop apps
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool
- **Electron Forge** - Packaging

## 📂 Project Structure

```
src/
├── main/          # Main process (Node.js)
├── renderer/      # Renderer process (React UI)
│   ├── components/  # Reusable components (Sidebar, etc.)
│   ├── pages/       # Page components
│   ├── hooks/       # Custom React hooks
│   ├── styles/      # Styling files
│   └── utils/       # Utility functions
├── preload/       # Security bridge
├── shared/        # Shared types/constants
└── assets/        # Static files
```

## 📋 Scripts

- `pnpm start` - Start development server with hot reload
- `pnpm run package` - Package application
- `pnpm run make` - Create platform-specific distributables
- `pnpm run lint` - Run ESLint

## 🎨 Tailwind CSS

This project uses Tailwind CSS v4 for styling. Configuration files:
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

To customize the theme, edit `tailwind.config.js`.

## 🧩 Components

### Sidebar Component
A fully responsive, customizable navigation sidebar with:
- Desktop fixed sidebar
- Mobile hamburger menu
- Dark mode support
- Customizable navigation items and teams
- TypeScript support

See [SIDEBAR_COMPONENT.md](./SIDEBAR_COMPONENT.md) for detailed documentation.

## 🤝 Contributing

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for development guidelines and architecture details.