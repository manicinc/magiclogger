import { ColorName } from '../types';

export const PRESETS: Record<string, ColorName[]> = {
  info: ['cyan', 'bold'],
  success: ['green', 'bold'],
  warning: ['yellow', 'bold'],
  error: ['brightRed', 'bold'],
  debug: ['gray', 'italic'],
  important: ['magenta', 'bold', 'underline'],
  highlight: ['brightYellow', 'bold'],
  muted: ['dim'],
  special: ['brightCyan', 'bold'],
  code: ['brightGreen'],
  header: ['brightWhite', 'bgBlue', 'bold'],
};
