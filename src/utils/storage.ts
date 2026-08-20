/**
 * storage.ts — Unified persistence layer
 *
 * Strategy:
 *  • localStorage  → canvas elements + theme (survives browser close)
 *  • sessionStorage → camera position/zoom + currentTool (per-tab, resets on close)
 *  • cookies       → strokeColor user preference (shared across tabs/subdomains, 30-day TTL)
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export type StoredElements = import('../store/canvasStore').CanvasElement[];

// ─── Cookie helpers ───────────────────────────────────────────────────────────
function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(encodeURIComponent(name) + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// ─── localStorage — canvas elements ──────────────────────────────────────────
const LS_ELEMENTS_KEY = 'tdc_elements';
const LS_THEME_KEY    = 'tdc_theme';

export function saveElements(elements: StoredElements) {
  try {
    localStorage.setItem(LS_ELEMENTS_KEY, JSON.stringify(elements));
  } catch (e) {
    console.warn('[storage] localStorage write failed (quota?)', e);
  }
}

export function loadElements(): StoredElements {
  try {
    const raw = localStorage.getItem(LS_ELEMENTS_KEY);
    return raw ? (JSON.parse(raw) as StoredElements) : [];
  } catch {
    return [];
  }
}

export function saveTheme(theme: 'light' | 'dark') {
  try {
    localStorage.setItem(LS_THEME_KEY, theme);
  } catch { /* ignore */ }
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const val = localStorage.getItem(LS_THEME_KEY);
    return val === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function clearSavedCanvas() {
  localStorage.removeItem(LS_ELEMENTS_KEY);
}

// ─── sessionStorage — camera & tool ──────────────────────────────────────────
const SS_CAMERA_KEY = 'tdc_camera';
const SS_TOOL_KEY   = 'tdc_tool';

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export function saveCamera(state: CameraState) {
  try {
    sessionStorage.setItem(SS_CAMERA_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function loadCamera(): CameraState {
  try {
    const raw = sessionStorage.getItem(SS_CAMERA_KEY);
    return raw ? (JSON.parse(raw) as CameraState) : { x: 0, y: 0, zoom: 1 };
  } catch {
    return { x: 0, y: 0, zoom: 1 };
  }
}

export function saveCurrentTool(tool: string) {
  try {
    sessionStorage.setItem(SS_TOOL_KEY, tool);
  } catch { /* ignore */ }
}

export function loadCurrentTool(): string {
  try {
    return sessionStorage.getItem(SS_TOOL_KEY) ?? 'freehand';
  } catch {
    return 'freehand';
  }
}

// ─── cookies — stroke color preference ───────────────────────────────────────
const COOKIE_STROKE_KEY = 'tdc_stroke_color';

export function saveStrokeColor(color: string) {
  setCookie(COOKIE_STROKE_KEY, color, 30);
}

export function loadStrokeColor(defaultForTheme: 'light' | 'dark'): string {
  const saved = getCookie(COOKIE_STROKE_KEY);
  if (saved) return saved;
  return defaultForTheme === 'dark' ? '#ffffff' : '#000000';
}

export function clearStrokeColor() {
  deleteCookie(COOKIE_STROKE_KEY);
}
