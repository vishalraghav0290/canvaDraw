import Canvas from './components/Canvas/Canvas';
import TopBar from './components/Toolbar/topToolbar';

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#e5e5e5]">
      <TopBar />
      <Canvas />
    </div>
  );
}

export default App;