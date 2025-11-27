/**
 * @file src/renderer/index.tsx
 * @description Entry point for the Renderer process.
 * This file initializes the React application and mounts it to the DOM.
 * It also imports global styles.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');

// If 'root' div is not in index.html, we might need to append it or use body.
// However, usually index.html has a root div. Let's check index.html again or just append if missing.
// The default index.html usually doesn't have a root div in some templates, it just has body.
// Let's modify index.html to have a root div or append one.

if (!container) {
  const rootDiv = document.createElement('div');
  rootDiv.id = 'root';
  document.body.appendChild(rootDiv);
  const root = createRoot(rootDiv);
  root.render(<App />);
} else {
  const root = createRoot(container);
  root.render(<App />);
}

console.log('👋 Renderer process started');
