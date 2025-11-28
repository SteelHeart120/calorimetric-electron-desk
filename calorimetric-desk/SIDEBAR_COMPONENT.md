# Sidebar Component Documentation

## Overview

The `Sidebar` component is a fully responsive, customizable navigation sidebar built with React and Tailwind CSS. It provides a desktop-first layout with a collapsible mobile menu.

## Features

- ✅ **Fully Responsive**: Desktop sidebar with mobile hamburger menu
- ✅ **Dark Mode Support**: Built-in dark mode styling
- ✅ **Customizable**: Accept custom navigation items, teams, and styling
- ✅ **TypeScript**: Fully typed for better developer experience
- ✅ **Icon Support**: Uses react-icons for scalable vector icons
- ✅ **Accessible**: Includes proper ARIA labels and semantic HTML

## Installation

The component is already set up in your project. Make sure you have these dependencies:

```bash
pnpm add react-icons
pnpm add -D tailwindcss postcss autoprefixer @vitejs/plugin-react
```

## Usage

### Basic Usage

```tsx
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Sidebar>
      <h1>Your content here</h1>
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
    { id: 2, name: 'Design', href: '#', initial: 'D', current: false },
  ];

  return (
    <Sidebar
      navigation={navigation}
      teams={teams}
      userName="John Doe"
      userImage="https://example.com/avatar.jpg"
    >
      <h1>Your content here</h1>
    </Sidebar>
  );
}
```

## Props

### SidebarProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `navigation` | `NavigationItem[]` | Default items | Array of navigation menu items |
| `teams` | `Team[]` | Default teams | Array of team items |
| `logo` | `string` | Tailwind logo | URL for the company logo |
| `userName` | `string` | `'User'` | Display name for the user |
| `userImage` | `string` | Default avatar | URL for the user profile image |
| `children` | `ReactNode` | - | Main content to render |
| `className` | `string` | `''` | Additional CSS classes |

### NavigationItem Interface

```typescript
interface NavigationItem {
  name: string;                                      // Display name
  href: string;                                      // Link URL
  icon: React.ComponentType<{ className?: string }>; // Icon component
  current: boolean;                                  // Active state
}
```

### Team Interface

```typescript
interface Team {
  id: number;      // Unique identifier
  name: string;    // Team name
  href: string;    // Link URL
  initial: string; // Single character initial
  current: boolean; // Active state
}
```

## Styling

The component uses Tailwind CSS utility classes. You can customize the appearance by:

1. **Modifying Tailwind Config**: Edit `tailwind.config.js` to change colors, spacing, etc.

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          600: '#2563eb',
          // ... more shades
        }
      }
    }
  }
}
```

2. **Custom CSS Classes**: Pass custom classes via the `className` prop

```tsx
<Sidebar className="custom-sidebar-class">
  {/* content */}
</Sidebar>
```

3. **Dark Mode**: The component automatically supports dark mode when you add the `dark` class to your HTML element

```html
<html class="dark">
```

## Customization Examples

### Change Active Item Color

Modify the `classNames` calls in the component to use different colors:

```tsx
// Change from indigo to blue
item.current
  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
  : 'text-gray-700 hover:bg-blue-50'
```

### Add Additional Navigation Sections

You can add more sections by modifying the sidebar content:

```tsx
<ul role="list" className="flex flex-1 flex-col gap-y-7">
  <li>
    {/* Main navigation */}
  </li>
  <li>
    {/* Teams */}
  </li>
  <li>
    {/* Add your custom section here */}
    <div className="text-xs font-semibold leading-6 text-gray-400">
      Settings
    </div>
    <ul role="list" className="-mx-2 mt-2 space-y-1">
      {/* Custom items */}
    </ul>
  </li>
</ul>
```

### Remove Teams Section

Simply pass an empty array:

```tsx
<Sidebar teams={[]}>
  {/* content */}
</Sidebar>
```

## Icons

The component uses `react-icons/hi2` (Heroicons v2 outline). You can use any icon from this library:

```tsx
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineBell,
  // ... more icons
} from 'react-icons/hi2';
```

Browse all available icons: [React Icons - Heroicons 2](https://react-icons.github.io/react-icons/icons/hi2/)

## Responsive Behavior

- **Desktop (lg and up)**: Fixed sidebar at 288px (18rem) width
- **Mobile (below lg)**: Hidden sidebar with hamburger menu
- **Mobile Menu**: Slide-in overlay with backdrop

## Accessibility

- Semantic HTML with proper `nav`, `ul`, `li` structure
- ARIA labels for screen readers (`sr-only` class)
- Keyboard navigation support
- Focus management

## Tips

1. **Make Navigation Dynamic**: Store navigation state in context or state management
2. **Active Route Detection**: Use React Router or similar to set `current` based on route
3. **Add Tooltips**: Wrap icon-only items with a tooltip component
4. **Nested Navigation**: Add sub-items by creating nested `ul` structures

## Example: Dynamic Navigation with State

```tsx
const [navigation, setNavigation] = useState([
  { name: 'Dashboard', href: '#', icon: HiOutlineHome, current: true },
  { name: 'Team', href: '#', icon: HiOutlineUsers, current: false },
]);

const handleNavigationClick = (clickedName: string) => {
  setNavigation(nav =>
    nav.map(item => ({
      ...item,
      current: item.name === clickedName
    }))
  );
};
```

## Troubleshooting

### Icons not displaying
- Ensure `react-icons` is installed: `pnpm add react-icons`
- Check import paths

### Tailwind classes not working
- Verify `tailwind.config.js` includes the component path in `content`
- Ensure PostCSS is configured in `vite.renderer.config.ts`
- Check that `@tailwind` directives are in your CSS file

### Dark mode not working
- Add `dark` class to `<html>` element
- Configure dark mode in `tailwind.config.js`: `darkMode: 'class'`

## License

This component is part of the Calorimetric Electron Desk project.
