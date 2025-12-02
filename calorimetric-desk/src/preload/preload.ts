/**
 * @file src/preload/preload.ts
 * @description Entry point for the Preload script.
 * This script runs in the renderer process before the web page is loaded.
 * It has access to Node.js APIs and can expose them to the renderer via contextBridge.
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  onSaveMenu: (callback: () => void) => {
    ipcRenderer.on('save-menu', callback);
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
