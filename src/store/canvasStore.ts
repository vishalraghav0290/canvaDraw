import { create } from "zustand";
import {
  saveElements, loadElements,
  saveTheme, loadTheme,
  saveStrokeColor, loadStrokeColor,
  saveCurrentTool, loadCurrentTool,
  saveCamera, loadCamera,
} from "../utils/storage";

export type Point = { x: number; y: number };

export type ToolType = 'freehand' | 'rectangle' | 'ellipse' | 'pan' | 'select' | 'text' | 'line' | 'eraser';

export type CanvasElement = {
  id: string;
  type: 'freehand' | 'rectangle' | 'ellipse' | 'line' | 'text';
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
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  fontFamily?: 'handwritten' | 'normal' | 'code' | 'serif';
  textAlign?: 'left' | 'center' | 'right';
};

// ─── Load persisted values on app boot ────────────────────────────────────────
const _savedTheme   = loadTheme();
const _savedTool    = loadCurrentTool() as ToolType;
const _savedStroke  = loadStrokeColor(_savedTheme);
const _savedEls     = loadElements();

// ─── Canvas Store ─────────────────────────────────────────────────────────────
interface CanvasStore {
  theme: 'light' | 'dark';
  elements: CanvasElement[];
  currentElement: CanvasElement | null;
  currentTool: ToolType;
  selectedElementId: string | null;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  opacity: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  fontFamily: 'handwritten' | 'normal' | 'code' | 'serif';
  textFontSize: 'S' | 'M' | 'L' | 'XL';
  textAlign: 'left' | 'center' | 'right';

  setStrokeColor: (color: string) => void;
  setStrokeWidth: (w: number) => void;
  setFillColor: (color: string) => void;
  setOpacity: (o: number) => void;
  setStrokeStyle: (s: 'solid' | 'dashed' | 'dotted') => void;
  setFontFamily: (f: 'handwritten' | 'normal' | 'code' | 'serif') => void;
  setTextFontSize: (s: 'S' | 'M' | 'L' | 'XL') => void;
  setTextAlign: (a: 'left' | 'center' | 'right') => void;
  setSelectedElementId: (id: string | null) => void;
  deleteElement: (id: string) => void;
  updateElement: (id: string, newElement: CanvasElement) => void;
  toggleTheme: () => void;
  setElements: (elements: CanvasElement[]) => void;
  setCurrentElement: (element: CanvasElement | null) => void;
  setCurrentTool: (tool: ToolType) => void;
  addElement: (element: CanvasElement) => void;
  undo: () => void;
  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  theme:           _savedTheme,
  elements:        _savedEls,
  currentElement:  null,
  currentTool:     _savedTool,
  selectedElementId: null,
  strokeColor:     _savedStroke,
  strokeWidth:     2,
  fillColor:       'transparent',
  opacity:         100,
  strokeStyle:     'solid' as const,
  fontFamily:      'normal' as const,
  textFontSize:    'M' as const,
  textAlign:       'left' as const,

  setStrokeColor: (color) => {
    saveStrokeColor(color);
    set((state) => ({
      strokeColor: color,
      elements: state.selectedElementId
        ? state.elements.map(el =>
            el.id === state.selectedElementId ? { ...el, strokeColor: color } : el
          )
        : state.elements,
    }));
    // Persist updated elements
    saveElements(get().elements);
  },

  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setFillColor: (fillColor) => set({ fillColor }),
  setOpacity: (opacity) => set({ opacity }),
  setStrokeStyle: (strokeStyle) => set({ strokeStyle }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setTextFontSize: (textFontSize) => set({ textFontSize }),
  setTextAlign: (textAlign) => set({ textAlign }),

  setSelectedElementId: (id) => set({ selectedElementId: id }),

  deleteElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId: null,
    }));
    saveElements(get().elements);
  },

  updateElement: (id, newElement) => {
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? newElement : el)),
    }));
    saveElements(get().elements);
  },

  setElements: (elements) => {
    set({ elements });
    saveElements(elements);
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      saveTheme(newTheme);
      // Auto-adjust stroke color for readability:
      //   black on light → white on dark, and vice versa
      let newStroke = state.strokeColor;
      if (newTheme === 'dark' && state.strokeColor === '#000000') {
        newStroke = '#ffffff';
        saveStrokeColor(newStroke);
      } else if (newTheme === 'light' && state.strokeColor === '#ffffff') {
        newStroke = '#000000';
        saveStrokeColor(newStroke);
      }
      return { theme: newTheme, strokeColor: newStroke };
    });
  },

  setCurrentElement: (currentElement) => set({ currentElement }),

  setCurrentTool: (currentTool) => {
    saveCurrentTool(currentTool);
    set({ currentTool, selectedElementId: null });
  },

  addElement: (element) => {
    set((state) => ({
      elements: [...state.elements, element],
      currentElement: null,
    }));
    saveElements(get().elements);
  },

  undo: () => {
    set((state) => ({ elements: state.elements.slice(0, -1) }));
    saveElements(get().elements);
  },

  clearCanvas: () => {
    set({ elements: [], currentElement: null });
    saveElements([]);
  },
}));

// ─── Camera Store ─────────────────────────────────────────────────────────────
interface CameraState {
  cameraOffset: { x: number; y: number };
  cameraZoom: number;
  setCameraOffset: (x: number, y: number) => void;
  setCameraZoom: (zoom: number) => void;
}

const _savedCamera = loadCamera();

export const useCameraCanavasState = create<CameraState>((set) => ({
  cameraOffset: { x: _savedCamera.x, y: _savedCamera.y },
  cameraZoom:   _savedCamera.zoom,

  setCameraOffset: (x, y) => {
    set({ cameraOffset: { x, y } });
    saveCamera({ x, y, zoom: useCameraCanavasState.getState().cameraZoom });
  },
  setCameraZoom: (cameraZoom) => {
    set({ cameraZoom });
    const { cameraOffset } = useCameraCanavasState.getState();
    saveCamera({ x: cameraOffset.x, y: cameraOffset.y, zoom: cameraZoom });
  },
}));