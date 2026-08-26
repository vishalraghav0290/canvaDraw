import Canvas from './components/Canvas/Canvas';
import TopBar from './components/Toolbar/topToolbar';
import { useCanvasStore } from './store/canvasStore';

function App() {
  const theme = useCanvasStore((state) => state.theme);

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${
      theme === 'dark' ? 'bg-[#121212]' : 'bg-[#f8f9fa]'
    }`}>
      <TopBar />
      <Canvas />
    </div>
  );
}

export default App;