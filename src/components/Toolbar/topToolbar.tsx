import { useCanvasStore } from "../../store/canvasStore";

export default function TopBar() {
  const currentTool = useCanvasStore((state) => state.currentTool);
  const setCurrentTool = useCanvasStore((state) => state.setCurrentTool);
  const undo = useCanvasStore((state) => state.undo);
  const clearCanvas = useCanvasStore((state) => state.clearCanvas);
  const theme = useCanvasStore((state) => state.theme);
  const toggleTheme = useCanvasStore((state) => state.toggleTheme);
  

  const tools = [
    { id: 'select', label: '👆 Select' },
    { id: 'pan', label: '✋ Pan' },
    { id: 'freehand', label: '✏️ Draw' },
    // { id: 'line', label: '📏 Line' },
    { id: 'rectangle', label: '⬜ Rect' },
    { id: 'ellipse', label: '⭕ Ellipse' },
  ] as const;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white rounded-lg shadow-md border border-gray-200 z-10">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setCurrentTool(tool.id)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            currentTool === tool.id
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {tool.label}
        </button>
      ))}

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button onClick={undo} className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
        ↩️ Undo
      </button>
      <button onClick={clearCanvas} className="px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50">
        🗑️ Clear
      </button>
      <div className={`w-px h-6 mx-1 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />

      <button onClick={toggleTheme} className={`p-1.5 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-700'}`}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

    </div>
  );
}