// Shared constants used across the application

export const APP_NAME = 'Calorimetric Electron Desk';
export const APP_VERSION = '1.0.0';

// IPC Channel Names
export const IPC_CHANNELS = {
  // Add your IPC channels here
  PING: 'ping',
  PONG: 'pong',
} as const;
