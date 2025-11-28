# 🚀 Quick Start Guide

## Your Electron App with Tailwind CSS is Ready!

### What's New

✅ **Tailwind CSS** - Utility-first CSS framework installed and configured  
✅ **Sidebar Component** - Professional, responsive navigation component  
✅ **Dark Mode** - Built-in dark mode support  
✅ **React Icons** - Comprehensive icon library  
✅ **TypeScript** - Full type safety for the Sidebar component  

---

## Run the Application

```bash
# Start development server
pnpm start
```

The app will launch with:
- A responsive sidebar navigation
- Sample dashboard with cards
- Dark mode styling ready
- Hot reload enabled

---

## File Overview

### Key Files Updated/Created

1. **`src/renderer/components/Sidebar.tsx`**  
   Main sidebar component with navigation and mobile menu

2. **`src/renderer/App.tsx`**  
   Updated to use the Sidebar with sample content

3. **`src/renderer/index.css`**  
   Added Tailwind directives and global styles

4. **`tailwind.config.js`**  
   Tailwind configuration file

5. **`postcss.config.js`**  
   PostCSS configuration for Tailwind

6. **`vite.renderer.config.ts`**  
   Updated with React plugin support

---

## How to Use the Sidebar

### Basic Example

```tsx
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Sidebar>
      <h1 className="text-2xl font-bold">Hello World</h1>
    </Sidebar>
  );
}
```

### Custom Navigation

```tsx
import Sidebar from './components/Sidebar';
import { HiOutlineHome, HiOutlineUsers } from 'react-icons/hi2';

function App() {
  const navigation = [
    { name: 'Dashboard', href: '#', icon: HiOutlineHome, current: true },
    { name: 'Team', href: '#', icon: HiOutlineUsers, current: false },
  ];

  const teams = [
    { id: 1, name: 'Engineering', href: '#', initial: 'E', current: false },
  ];

  return (
    <Sidebar 
      navigation={navigation} 
      teams={teams}
      userName="Your Name"
    >
      {/* Your content here */}
    </Sidebar>
  );
}
```

---

## Tailwind CSS Usage

### Utility Classes

Tailwind uses utility classes for styling:

```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold">Card Title</h2>
  <p className="mt-2 text-sm">Card content</p>
</div>
```

### Common Patterns

```tsx
// Spacing
className="p-4"        // padding all sides
className="px-6 py-4"  // padding horizontal/vertical
className="mt-4"       // margin top

// Colors
className="bg-blue-500"      // background
className="text-white"       // text color
className="border-gray-200"  // border color

// Layout
className="flex items-center justify-between"
className="grid grid-cols-3 gap-4"

// Responsive
className="hidden lg:block"        // hide on mobile, show on desktop
className="text-sm md:text-base"   // responsive text size

// Dark Mode
className="bg-white dark:bg-gray-900"
className="text-gray-900 dark:text-white"
```

---

## Enable Dark Mode

Add this to toggle dark mode:

```tsx
// Toggle dark mode
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
};

// In your component
<button onClick={toggleDarkMode}>
  Toggle Dark Mode
</button>
```

---

## Available Icons

Import from `react-icons/hi2`:

```tsx
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineFolder,
  HiOutlineCalendar,
  HiOutlineDocumentDuplicate,
  HiOutlineChartPie,
  HiOutlineCog,
  HiOutlineBell,
  HiOutlineInbox,
  HiOutlineSparkles,
} from 'react-icons/hi2';

// Use in JSX
<HiOutlineHome className="h-6 w-6" />
```

Browse all icons: https://react-icons.github.io/react-icons/

---

## Project Structure

```
src/renderer/
├── components/
│   ├── Sidebar.tsx       ← Your sidebar component
│   └── index.ts          ← Component exports
├── App.tsx               ← Main app (uses Sidebar)
├── index.tsx             ← React entry point
└── index.css             ← Global styles + Tailwind
```

---

## Documentation

📖 **Detailed Docs Available:**

- `README.md` - Project overview and quick start
- `PROJECT_DOCUMENTATION.md` - Full architecture documentation
- `SIDEBAR_COMPONENT.md` - Sidebar component API reference
- `TAILWIND_SETUP.md` - Complete setup summary

---

## Next Steps

1. ✅ **Run the app** - `pnpm start`
2. 🎨 **Customize colors** - Edit `tailwind.config.js`
3. 🧩 **Add more components** - Create new components in `src/renderer/components/`
4. 🌗 **Implement dark mode toggle** - Add a toggle button in your UI
5. 🚀 **Build features** - Start building your application!

---

## Tailwind IntelliSense (Recommended)

Install the **Tailwind CSS IntelliSense** VS Code extension for:
- Autocomplete for Tailwind classes
- Class name suggestions
- CSS preview on hover
- Linting

---

## Common Commands

```bash
# Development
pnpm start              # Start dev server

# Building
pnpm run package        # Package app
pnpm run make          # Create installer

# Code Quality
pnpm run lint          # Run ESLint
```

---

## Tips

💡 **Use Tailwind Play** - Test styles at https://play.tailwindcss.com  
💡 **Check Tailwind Docs** - https://tailwindcss.com/docs  
💡 **Customize Theme** - Edit `tailwind.config.js` for brand colors  
💡 **Use @apply** - Extract repeated utilities into CSS classes  

---

## Need Help?

- Check `SIDEBAR_COMPONENT.md` for component API
- Check `TAILWIND_SETUP.md` for setup details
- Check `PROJECT_DOCUMENTATION.md` for architecture

---

**Happy Coding! 🎉**
