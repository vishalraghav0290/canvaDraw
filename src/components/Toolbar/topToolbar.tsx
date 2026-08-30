import { useCanvasStore } from "../../store/canvasStore";
import type { ToolType } from "../../store/canvasStore";

const Icon = ({ src, alt, active }: { src: string; alt: string; active?: boolean }) => (
  <img
    src={src}
    alt={alt}
    width={18}
    height={18}
    draggable={false}
    style={
      active
        ? { filter: 'invert(36%) sepia(76%) saturate(1352%) hue-rotate(200deg) brightness(97%) contrast(97%)' }
        : { opacity: 0.65 }
    }
  />
);

const tools: { id: ToolType; icon: string; label: string }[] = [
  { id: 'select',    icon: '/icons/select.svg',    label: 'Selection' },
  { id: 'pan',       icon: '/icons/pan.svg',       label: 'Pan'       },
  { id: 'freehand',  icon: '/icons/freehand.svg',  label: 'Draw'      },
  { id: 'eraser',    icon: '/icons/eraser.svg',    label: 'Eraser'    },
  { id: 'rectangle', icon: '/icons/rectangle.svg', label: 'Rectangle' },
  { id: 'ellipse',   icon: '/icons/ellipse.svg',   label: 'Ellipse'   },
  { id: 'line',      icon: '/icons/line.svg',      label: 'Line'      },
  { id: 'text',      icon: '/icons/text.svg',      label: 'Text'      },
];

export default function TopBar() {
  const { currentTool, setCurrentTool, theme, toggleTheme } = useCanvasStore();
  const bgColor = theme === 'dark' ? 'bg-[#232329] border-[#313131]' : 'bg-white border-gray-200';

  return (
    <div className={`flex items-center gap-1 p-1.5 rounded-xl border shadow-sm ${bgColor}`}>
      {tools.map((tool) => {
        const isActive = currentTool === tool.id;
        return (
          <div key={tool.id} className="relative group">
            <button
              onClick={() => setCurrentTool(tool.id)}
              title={tool.label}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                isActive ? 'bg-blue-500/20' : 'hover:bg-gray-500/10'
              }`}
            >
              <Icon src={tool.icon} alt={tool.label} active={isActive} />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
              {tool.label}
            </div>
          </div>
        );
      })}

      <div className="w-px h-6 bg-gray-500/20 mx-1" />

      {/* Theme toggle with SVG icons instead of emoji */}
      <div className="relative group">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors flex items-center justify-center"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <img
            src={theme === 'dark' ? '/icons/sun.svg' : '/icons/moon.svg'}
            alt={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            width={18}
            height={18}
            draggable={false}
            style={{ opacity: 0.65 }}
          />
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </div>
      </div>
    </div>
  );
}