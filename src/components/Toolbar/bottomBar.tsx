import { useCanvasStore, useCameraCanavasState } from "../../store/canvasStore";

const Icon = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} width={16} height={16} draggable={false} style={{ opacity: 0.7 }} />
);

export default function BottomControls() {
  const { cameraZoom, setCameraZoom } = useCameraCanavasState();
  const { undo, theme } = useCanvasStore();
  const bgColor = theme === 'dark' ? 'bg-[#232329] border-[#313131]' : 'bg-white border-gray-200';

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? cameraZoom * 1.2 : cameraZoom / 1.2;
    setCameraZoom(Math.min(Math.max(newZoom, 0.1), 30));
  };

  return (
    <div className="flex items-center gap-2">
      {/* Zoom Controls */}
      <div className={`flex items-center rounded-xl border shadow-sm p-1 ${bgColor}`}>
        <button onClick={() => handleZoom('out')} className="p-1.5 rounded-lg hover:bg-gray-500/10" title="Zoom Out">
          <Icon src="/icons/zoom-out.svg" alt="Zoom Out" />
        </button>
        <span className="text-xs font-medium w-12 text-center">
          {Math.round(cameraZoom * 100)}%
        </span>
        <button onClick={() => handleZoom('in')} className="p-1.5 rounded-lg hover:bg-gray-500/10" title="Zoom In">
          <Icon src="/icons/zoom-in.svg" alt="Zoom In" />
        </button>
      </div>

      {/* Undo / Redo */}
      <div className={`flex items-center gap-1 rounded-xl border shadow-sm p-1 ${bgColor}`}>
        <button onClick={undo} className="p-1.5 rounded-lg hover:bg-gray-500/10" title="Undo">
          <Icon src="/icons/undo.svg" alt="Undo" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-gray-500/10 opacity-40 cursor-not-allowed" title="Redo (Coming Soon)">
          <Icon src="/icons/redo.svg" alt="Redo" />
        </button>
      </div>
    </div>
  );
}