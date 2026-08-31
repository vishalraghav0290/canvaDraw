/**
 * canvas.types.ts
 * Central type definitions for the canvas application.
 * Import from here instead of from individual store/utility files.
 */

// ─── Primitives ───────────────────────────────────────────────────────────────

export type Point = { x: number; y: number };

// ─── Tools ───────────────────────────────────────────────────────────────────

export type ToolType =
  | 'select'
  | 'pan'
  | 'freehand'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'text'
  | 'eraser';

// ─── Style options ────────────────────────────────────────────────────────────

export type StrokeStyle  = 'solid' | 'dashed' | 'dotted';
export type FontFamily   = 'handwritten' | 'normal' | 'code' | 'serif';
export type TextFontSize = 'S' | 'M' | 'L' | 'XL';
export type TextAlign    = 'left' | 'center' | 'right';
export type Theme        = 'light' | 'dark';

// ─── Canvas element ───────────────────────────────────────────────────────────

export type ElementType = 'freehand' | 'rectangle' | 'ellipse' | 'line' | 'text';

export type CanvasElement = {
  id: string;
  type: ElementType;
  points: Point[];
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  strokeWidth: number;
  text?: string;
  fontSize?: string;
  fillColor?: string;
  opacity?: number;
  strokeStyle?: StrokeStyle;
  fontFamily?: FontFamily;
  textAlign?: TextAlign;
};

// ─── Camera ───────────────────────────────────────────────────────────────────

export type CameraState = {
  x: number;
  y: number;
  zoom: number;
};
