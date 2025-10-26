// src/lib/config.ts
// Central place for API base URL used by the frontend.
// Prefer Vite build-time env var. If not present (e.g. older build), try a runtime
// detection for the known frontend domain so deployed site points to the Render backend.
const VITE_API_RAW = (import.meta.env && import.meta.env.VITE_API_URL) ? String(import.meta.env.VITE_API_URL).replace(/\/*$/, '') : '';

let API_BASE = VITE_API_RAW || '';

// Runtime fallback: if the app is running on the deployed frontend domain but
// was built without VITE_API_URL, point to the Render backend automatically.
if (!API_BASE && typeof window !== 'undefined') {
  const host = window.location.hostname || '';
  if (host.includes('osinthub-delta.vercel.app')) {
    API_BASE = 'https://osinthub-tny5.onrender.com';
  }
}

// Final fallback to localhost for local dev
export { API_BASE };
