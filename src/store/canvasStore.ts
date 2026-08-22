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


