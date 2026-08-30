import Canvas from './components/Canvas/Canvas';
import TopBar from './components/Toolbar/topToolbar';
import Sidebar from './components/Toolbar/sideBar';
import BottomControls from './components/Toolbar/bottomBar';
import { useCanvasStore } from './store/canvasStore';

export default function App() {
  const theme = useCanvasStore((state) => state.theme);

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-[#f8f9fa] text-black'
      }`}>
      <div className="absolute inset-0 z-0"><Canvas /></div>
      <div className="absolute top-4 left-4 z-50 pointer-events-auto"><Sidebar /></div>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"><TopBar /></div>
      <div className="absolute bottom-4 left-4 z-50 pointer-events-auto"><BottomControls /></div>
    </div>
  );
}