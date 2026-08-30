import { useCanvasStore } from "../../store/canvasStore";

export default function TopBar() {
  const currentTool = useCanvasStore((state) => state.currentTool);
  const setCurrentTool = useCanvasStore((state) => state.setCurrentTool);
  const undo = useCanvasStore((state) => state.undo);
  const clearCanvas = useCanvasStore((state) => state.clearCanvas);
  const theme = useCanvasStore((state) => state.theme);
  const toggleTheme = useCanvasStore((state) => state.toggleTheme);
  const strokeColor = useCanvasStore((state) => state.strokeColor);
  const setStrokeColor = useCanvasStore((state) => state.setStrokeColor);


  const tools = [
    { id: 'select', label: 'Select', icon: '👆' },
    { id: 'pan', label: 'Pan', icon: '✋' },
    { id: 'freehand', label: 'Draw', icon: '✏️' },
    { id: 'rectangle', label: 'Rect', icon: '⬜' },
    { id: 'ellipse', label: 'Ellipse', icon: '⭕' },
  ] as const;

  return (
    <div className={`flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg shadow-md border transition-colors flex-nowrap ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setCurrentTool(tool.id)}
          className={`px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${currentTool === tool.id
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
            }`}
        >
          <span>{tool.icon}</span>
          <span className="hidden sm:inline">{tool.label}</span>
        </button>
      ))}
      <input
        type="color"
        value={strokeColor}
        onChange={(e) => setStrokeColor(e.target.value)}
        className="w-8 h-8 border-none bg-transparent cursor-pointer"
        title="Change Color"
      />


      <div className="w-px h-6 bg-gray-300 mx-0.5 sm:mx-1" />

      <button
        onClick={undo}
        className="px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
      >
        <span>↩️</span>
        <span className="hidden sm:inline">Undo</span>
      </button>
      <button
        onClick={clearCanvas}
        className="px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-1.5"
      >
        <span>🗑️</span>
        <span className="hidden sm:inline">Clear</span>
      </button>

      <div className={`w-px h-6 mx-0.5 sm:mx-1 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />

      <button onClick={toggleTheme} className={`p-1.5 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-700'}`}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

    </div>
  );
}