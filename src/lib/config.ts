// src/lib/config.ts
// Central place for API base URL used by the frontend.
export const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL)
  ? String(import.meta.env.VITE_API_URL).replace(/\/*$/, '')
  : 'http://localhost:8000';
