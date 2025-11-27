# Calorimetric Electron Desk

A modern desktop application built with Electron, React, and TypeScript.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development
npm start

# Package application
npm run package

# Create distributables
npm run make
```

## 📖 Documentation

For comprehensive project documentation including:
- Detailed folder structure and purposes
- Architecture overview
- Development guidelines
- Configuration explanations

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

## 🛠 Tech Stack

- **Electron** - Cross-platform desktop apps
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Electron Forge** - Packaging

## 📂 Project Structure

```
src/
├── main/          # Main process (Node.js)
├── renderer/      # Renderer process (React UI)
├── preload/       # Security bridge
├── shared/        # Shared types/constants
└── assets/        # Static files
```

## 📋 Scripts

- `npm start` - Start development server
- `npm run package` - Package application
- `npm run make` - Create platform-specific distributables
- `npm run lint` - Run ESLint

## 🤝 Contributing

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for development guidelines and architecture details.