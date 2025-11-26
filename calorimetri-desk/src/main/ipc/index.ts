import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';

export function setupIpcHandlers(): void {
  // Example IPC handler
  ipcMain.handle(IPC_CHANNELS.PING, async () => {
    return 'pong';
  });

  // Add more IPC handlers here
}
