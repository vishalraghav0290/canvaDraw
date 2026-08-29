import Canvas from './components/Canvas/Canvas';
import TopBar from './components/Toolbar/topToolbar';
import { useCanvasStore } from './store/canvasStore';

export default function App() {
  const theme = useCanvasStore((state) => state.theme);

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${
      theme === 'dark' ? 'bg-[#121212]' : 'bg-[#f8f9fa]'
    }`}>
      {/* LAYER 0: The Canvas (Forced to the bottom) */}
      <div className="absolute inset-0 z-0">
        <Canvas />
      </div>

      {/* LAYER 50: The UI (Forced to the top) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[95vw] w-max">
        <TopBar />
      </div>
    </div>
  );
}