import { create} from "zustand";


type Point = {x: number , y: number};
type stroke =Point[];

interface CanvasStore {
    masterArray: stroke[];
    currentStroke: stroke;

    addPointToCurrent: (point:Point)=>void;
    finishStroke: ()=>void;
    undo : ()=>void;
    clearCanvas: ()=>void;
}


export const useCanvasStore = create<CanvasStore>((set)=>({
    masterArray: [],
  currentStroke: [],

  
  addPointToCurrent: (point) => 
    set((state) => ({
      currentStroke: [...state.currentStroke, point]
    })),

  
  finishStroke: () => 
    set((state) => {
      if (state.currentStroke.length === 0) return state; 
      return {
        masterArray: [...state.masterArray, state.currentStroke],
        currentStroke: []
      };
    }),

  
  undo: () => 
    set((state) => ({
      masterArray: state.masterArray.slice(0, -1) 
      // it working like [[{},{},{}] , [{},{}] , [{}]] it remove last value which in itelsf tis the array
    })),

  // 4. Wipes everything
  clearCanvas: () => set({ masterArray: [], currentStroke: [] }),

}))


//---------------------------------------------------------------------------------------//



// Add to your types
interface CanvasState {
  // ... existing states
  cameraOffset: { x: number; y: number };
  cameraZoom: number;
  
  // ... existing actions
  setCameraOffset: (x: number, y: number) => void;
  setCameraZoom: (zoom: number) => void;
}

// Add inside create()
export const useCameraCanavasState = create<CanvasState>((set) => ({
  // ... existing data
  cameraOffset: { x: 0, y: 0 },
  cameraZoom: 1, // 1 = 100%

  // ... existing actions
  setCameraOffset: (x, y) => set({ cameraOffset: { x, y } }),
  setCameraZoom: (zoom) => set({ cameraZoom: zoom }),
}));


//--------------------------------------------------------------------



// The new master object that can represent ANY tool
export type CanvasElement = {
  id: string; // Needed later for selecting/deleting specific shapes
  type: 'freehand' | 'rectangle' | 'ellipse' | 'line';
  points: Point[]; // Used for freehand or lines
  x: number; // Used for shapes (top left corner)
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  strokeWidth: number;
};

interface CanvasShapeState {
  elements: CanvasElement[]; // Replaces masterArray
  currentElement: CanvasElement | null; // Replaces currentStroke
  currentTool: 'freehand' | 'rectangle' | 'ellipse' | 'pan' | 'select';
  
  // ... (keep camera states)
}