import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'node:fs';
import path from 'node:path';

let projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || 'eng-science-3cf5x';

try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.projectId) {
      projectId = parsed.projectId;
    }
  }
} catch (e) {
  console.warn('Could not read firebase-applet-config.json, using fallback projectId:', projectId);
}

if (!getApps().length) {
  initializeApp({
    projectId,
  });
}

export const adminAuth = getAuth();
