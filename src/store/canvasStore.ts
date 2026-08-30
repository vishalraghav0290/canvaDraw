import { create } from "zustand";

export type Point = { x: number; y: number };

export type CanvasElement = {
  id: string;
  type: 'freehand' | 'rectangle' | 'ellipse' | 'line';
  points: Point[];
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  strokeWidth: number;
};

interface CanvasStore {
  theme: 'light' | 'dark';
  elements: CanvasElement[];
  currentElement: CanvasElement | null;
  currentTool: 'freehand' | 'rectangle' | 'ellipse' | 'pan' | 'select';
  selectedElementId: string | null;
  strokeColor: string,
  setStrokeColor: (color: string) => void;



  deleteElement: (id: string) => void
  updateElement: (id: string, newElement: CanvasElement) => void;
  toggleTheme: () => void;
  setElements: (elements: CanvasElement[]) => void;
  setCurrentElement: (element: CanvasElement | null) => void;
  setCurrentTool: (tool: 'freehand' | 'rectangle' | 'ellipse' | 'pan' | 'select') => void;
  addElement: (element: CanvasElement) => void;
  undo: () => void;
  clearCanvas: () => void;
  setSelectedElementId: (id: string | null) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  theme: 'light',
  elements: [],
  currentElement: null,
  currentTool: 'freehand',
  selectedElementId: null,


  strokeColor: '#000000',
  setStrokeColor: (color: string) => set((state) => ({
    strokeColor: color,

    elements: state.selectedElementId
      ? state.elements.map(el => el.id === state.selectedElementId ? { ...el, strokeColor: color } : el)
      : state.elements
  })),

  setSelectedElementId: (id) => set({ selectedElementId: id }),

  deleteElement: (id) => set((state) => ({
    elements: state.elements.filter((el) => el.id !== id),
    selectedElementId: null // this is because we need to clear the selected item what fillter do filrtaration not delation 
  })),

  updateElement: (id, newElement) => set((state) => ({
    elements: state.elements.map((el) => el.id === id ? newElement : el)
  })),

  setElements: (elements) => set({ elements }),
  toggleTheme() {
    set((state) => ({ theme: state.theme === "light" ? "dark" : "light" }));
  },
  setCurrentElement: (currentElement) => set({ currentElement }),
  setCurrentTool: (currentTool) => set({ currentTool }),

  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
      currentElement: null,
    })),

  undo: () =>
    set((state) => ({
      elements: state.elements.slice(0, -1),
    })),

  clearCanvas: () => set({ elements: [], currentElement: null }),
}));


interface CameraState {
  cameraOffset: { x: number; y: number };
  cameraZoom: number;

  setCameraOffset: (x: number, y: number) => void;
  setCameraZoom: (zoom: number) => void;
}

export const useCameraCanavasState = create<CameraState>((set) => ({
  cameraOffset: { x: 0, y: 0 },
  cameraZoom: 1,

  setCameraOffset: (x, y) => set({ cameraOffset: { x, y } }),
  setCameraZoom: (cameraZoom) => set({ cameraZoom }),
}));