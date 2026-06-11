import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

export interface ServerConfig {
  port: number;
  host: string;
  dataDir: string;
  dbPath: string;
  corsOrigins: string[];
  apiKey: string | null;
  allowRemote: boolean;
}

const HOME = process.env.HOME || process.env.USERPROFILE || '';
const DATA_DIR = process.env.CCMD_DATA_DIR || resolve(HOME, '.commandcode-web-ui');

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '127.0.0.1',
  dataDir: DATA_DIR,
  dbPath: resolve(DATA_DIR, 'dashboard.db'),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
  apiKey: process.env.API_KEY || null,
  allowRemote: process.env.ALLOW_REMOTE === 'true',
};
