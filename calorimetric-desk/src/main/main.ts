/**
 * @file src/main/main.ts
 * @description Entry point for the Main process.
 * This file controls the lifecycle of the application, creates browser windows,
 * and handles system events.
 */

import { app, BrowserWindow, Menu, ipcMain, protocol, shell, dialog } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { initDatabase, closeDatabase, registerIpcHandlers } from './services';
import * as fs from 'fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Create application menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Guardar Menu',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-menu');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Pacientes',
      submenu: [
        {
          label: 'Agregar Paciente',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('show-add-patient');
          }
        }
      ]
    },
    {
      label: 'Recetas',
      submenu: [
        {
          label: 'Nueva Receta',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('show-add-recipe');
          }
        },
        { type: 'separator' },
        {
          label: 'Agregar Ingrediente',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('show-add-ingrediente');
          }
        },
        {
          label: 'Lista de Ingredientes',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            mainWindow.webContents.send('show-ingredientes-list');
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Database',
      submenu: [
        {
          label: 'Show Database Location',
          click: () => {
            const dbPath = path.join(app.getPath('userData'), 'calorimetric.db');
            const userDataPath = app.getPath('userData');
            
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Database Location',
              message: 'Database File Location',
              detail: `Database file: calorimetric.db\n\nFull path:\n${dbPath}\n\nUser data folder:\n${userDataPath}`,
              buttons: ['OK', 'Open Folder', 'Copy Path']
            }).then(result => {
              if (result.response === 1) {
                // Open folder
                shell.showItemInFolder(dbPath);
              } else if (result.response === 2) {
                // Copy path to clipboard
                require('electron').clipboard.writeText(dbPath);
              }
            });
          }
        },
        {
          label: 'Open Database Folder',
          click: () => {
            const userDataPath = app.getPath('userData');
            shell.openPath(userDataPath);
          }
        },
        { type: 'separator' },
        {
          label: 'Reset Database',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'warning',
              title: 'Reset Database',
              message: 'Reset Database',
              detail: 'This will delete ALL data including:\n- All recipes\n- All ingredients\n- All patients\n- All menus\n\nThe app will restart and load fresh initial data.\n\nAre you sure you want to continue?',
              buttons: ['Cancel', 'Reset Database'],
              defaultId: 0,
              cancelId: 0
            }).then(result => {
              if (result.response === 1) {
                const dbPath = path.join(app.getPath('userData'), 'calorimetric.db');
                
                try {
                  closeDatabase();
                  
                  if (fs.existsSync(dbPath)) {
                    fs.unlinkSync(dbPath);
                    console.log('Database deleted successfully');
                  }
                  
                  // Restart the app
                  app.relaunch();
                  app.exit(0);
                } catch (error) {
                  console.error('Error resetting database:', error);
                  dialog.showErrorBox('Error', `Failed to reset database: ${error.message}`);
                }
              }
            });
          }
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // Register protocol to serve local images
  protocol.registerFileProtocol('local-file', (request, callback) => {
    const url = request.url.replace('local-file://', '');
    const filePath = path.join(app.getPath('userData'), url);
    callback({ path: filePath });
  });

  initDatabase();
  registerIpcHandlers();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  closeDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
