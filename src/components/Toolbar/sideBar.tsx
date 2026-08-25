import { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[10px] uppercase tracking-widest font-semibold opacity-40 mb-2">{children}</p>
);

const Divider = () => <div className="h-px bg-gray-500/10 my-3" />;

// ─── Color Swatches ───────────────────────────────────────────────────────────
const PRESETS = ['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) => (
    <div>
        <Label>{label}</Label>
        <div className="flex flex-wrap gap-1.5 mb-2">
            {PRESETS.map(c => (
                <button
                    key={c}
                    onClick={() => onChange(c)}
                    title={c}
                    style={{ background: c }}
                    className={`w-5 h-5 rounded border-2 transition-all ${value === c ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-105 border-gray-400/30'
                        }`}
                />
            ))}
        </div>
        <div className="flex items-center gap-2">
            <input type="color" value={value} onChange={e => onChange(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0 flex-shrink-0" />
            <span className="text-[11px] font-mono opacity-40">{value}</span>
        </div>
    </div>
);

// ─── Stroke Width ─────────────────────────────────────────────────────────────
const StrokeWidth = () => {
    const { strokeWidth, setStrokeWidth } = useCanvasStore();
    return (
        <div>
            <Label>Stroke Width</Label>
            <div className="flex gap-1">
                {[1, 2, 4, 8].map(w => (
                    <button key={w} onClick={() => setStrokeWidth(w)}
                        className={`flex-1 flex items-center justify-center rounded-lg py-2 transition-colors ${strokeWidth === w ? 'bg-blue-500/20 ring-1 ring-blue-500/30' : 'hover:bg-gray-500/10'
                            }`}>
                        <div className="rounded-full bg-current" style={{ width: 20, height: w }} />
                    </button>
                ))}
            </div>
        </div>
    );
};

// ─── Stroke Style ─────────────────────────────────────────────────────────────
const StrokeStyle = () => {
    const { strokeStyle, setStrokeStyle } = useCanvasStore();
    const styles = [
        { id: 'solid', label: '——' },
        { id: 'dashed', label: '- - -' },
        { id: 'dotted', label: '· · ·' },
    ] as const;
    return (
        <div>
            <Label>Stroke Style</Label>
            <div className="flex gap-1">
                {styles.map(s => (
                    <button key={s.id} onClick={() => setStrokeStyle(s.id)}
                        className={`flex-1 text-xs py-1.5 rounded-lg font-mono tracking-widest transition-colors ${strokeStyle === s.id ? 'bg-blue-500/20 ring-1 ring-blue-500/30' : 'hover:bg-gray-500/10 opacity-60'
                            }`}>
                        {s.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ─── Fill Style (shapes only) ─────────────────────────────────────────────────
const FillStyle = () => {
    const { fillColor, setFillColor } = useCanvasStore();
    const noFill = fillColor === 'transparent';
    return (
        <div>
            <ColorPicker label="Fill Color" value={noFill ? '#ffffff' : fillColor} onChange={setFillColor} />
            <button onClick={() => setFillColor('transparent')}
                className={`mt-2 w-full text-xs py-1 rounded-lg transition-colors ${noFill ? 'bg-blue-500/20 ring-1 ring-blue-500/30' : 'hover:bg-gray-500/10 opacity-60'
                    }`}>
                No Fill
            </button>
        </div>
    );
};

// ─── Opacity ──────────────────────────────────────────────────────────────────
const OpacitySlider = () => {
    const { opacity, setOpacity } = useCanvasStore();
    return (
        <div>
            <div className="flex justify-between mb-1">
                <Label>Opacity</Label>
                <span className="text-[10px] opacity-40 font-mono">{opacity}%</span>
            </div>
            <input type="range" min={0} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))}
                className="w-full h-1.5 rounded-full accent-blue-500 cursor-pointer" />
        </div>
    );
};

// ─── Layers ───────────────────────────────────────────────────────────────────
const Layers = () => {
    const { selectedElementId, elements, setElements } = useCanvasStore();
    const idx = elements.findIndex(e => e.id === selectedElementId);

    const move = (direction: 'top' | 'up' | 'down' | 'bottom') => {
        if (idx < 0) return;
        const arr = [...elements];
        const [el] = arr.splice(idx, 1);
        if (direction === 'top') arr.push(el);
        else if (direction === 'bottom') arr.unshift(el);
        else if (direction === 'up' && idx < arr.length) arr.splice(idx + 1, 0, el);
        else arr.splice(Math.max(0, idx - 1), 0, el);
        setElements(arr);
    };

    const LayerBtn = ({ icon, title, dir }: { icon: string; title: string; dir: 'top' | 'up' | 'down' | 'bottom' }) => (
        <button onClick={() => move(dir)} title={title} disabled={!selectedElementId}
            className={`flex-1 text-sm py-1.5 rounded-lg transition-colors ${selectedElementId ? 'hover:bg-gray-500/10' : 'opacity-25 cursor-not-allowed'
                }`}>
            {icon}
        </button>
    );

    return (
        <div>
            <Label>Layers</Label>
            <div className="flex gap-1">
                <LayerBtn icon="⬇" title="Send to Back" dir="bottom" />
                <LayerBtn icon="↓" title="Send Backward" dir="down" />
                <LayerBtn icon="↑" title="Bring Forward" dir="up" />
                <LayerBtn icon="⬆" title="Bring to Front" dir="top" />
            </div>
        </div>
    );
};

// ─── Font Family ──────────────────────────────────────────────────────────────
const FontFamily = () => {
    const { fontFamily, setFontFamily } = useCanvasStore();
    const fonts = [
        { id: 'handwritten', label: '✏', title: 'Handwritten', style: 'cursive' },
        { id: 'normal', label: 'A', title: 'Normal', style: 'sans-serif' },
        { id: 'code', label: '<>', title: 'Code', style: 'monospace' },
        { id: 'serif', label: 'Ꞗ', title: 'Serif', style: 'serif' },
    ] as const;
    return (
        <div>
            <Label>Font Family</Label>
            <div className="flex gap-1">
                {fonts.map(f => (
                    <button key={f.id} onClick={() => setFontFamily(f.id)} title={f.title}
                        style={{ fontFamily: f.style }}
                        className={`flex-1 text-sm py-1.5 rounded-lg transition-colors ${fontFamily === f.id ? 'bg-blue-500/20 ring-1 ring-blue-500/30' : 'hover:bg-gray-500/10 opacity-60'
                            }`}>
                        {f.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ─── Font Size ────────────────────────────────────────────────────────────────
const FontSize = () => {
    const { textFontSize, setTextFontSize } = useCanvasStore();
    return (
        <div>
            <Label>Font Size</Label>
            <div className="flex gap-1">
                {(['S', 'M', 'L', 'XL'] as const).map(s => (
                    <button key={s} onClick={() => setTextFontSize(s)}
                        className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${textFontSize === s ? 'bg-blue-500/20 ring-1 ring-blue-500/30' : 'hover:bg-gray-500/10 opacity-60'
                            }`}>
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ─── Text Align ───────────────────────────────────────────────────────────────
// const TextAlign = () => {
//   const { textAlign, setTextAlign } = useCanvasStore();
//   const aligns = [
//     { id: 'left',   icon: '≡' },
//     { id: 'center', icon: '☰' },
//     { id: 'right',  icon: '≡' },
//   ] as const;
//   return (
//     <div>
//       <Label>Text Align</Label>
//       <div className="flex gap-1">
//         {aligns.map((a, i) => (
//           <button key={a.id} onClick={() => setTextAlign(a.id)}
//             className={`flex-1 text-sm py-1.5 rounded-lg transition-colors ${
//               textAlign === a.id ? 'bg-blue-500/20 ring-1 ring-blue-500/30' : 'hover:bg-gray-500/10 opacity-60'
//             }`}
//             style={{ textAlign: a.id }}>
//             {i === 0 ? '⬅' : i === 1 ? '⬌' : '➡'}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// ─── Eraser ───────────────────────────────────────────────────────────────────
const EraserPanel = () => {
    const { strokeWidth, setStrokeWidth } = useCanvasStore();
    return (
        <div>
            <div className="flex justify-between mb-1">
                <Label>Eraser Size</Label>
                <span className="text-[10px] opacity-40 font-mono">{strokeWidth * 4}px</span>
            </div>
            <input type="range" min={1} max={20} value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))}
                className="w-full h-1.5 rounded-full accent-blue-500 cursor-pointer" />
            <p className="text-[11px] opacity-40 mt-2">Drag over elements to erase them</p>
        </div>
    );
};

// ─── Per-tool panels ──────────────────────────────────────────────────────────
function SelectPanel() {
    const { selectedElementId, elements, strokeColor, setStrokeColor } = useCanvasStore();
    if (!selectedElementId) {
        return <p className="text-xs opacity-40 text-center py-4">Click an element to edit its properties</p>;
    }
    const el = elements.find(e => e.id === selectedElementId);
    if (!el) return null;
    return (
        <div className="space-y-3">
            <p className="text-[11px] opacity-50 capitalize">Type: {el.type}</p>
            <ColorPicker label="Stroke" value={strokeColor} onChange={setStrokeColor} />
            <Divider />
            <StrokeWidth />
            <Divider />
            <OpacitySlider />
            <Divider />
            <Layers />
        </div>
    );
}

function ShapePanel() {
    const { strokeColor, setStrokeColor } = useCanvasStore();
    return (
        <div className="space-y-3">
            <ColorPicker label="Stroke" value={strokeColor} onChange={setStrokeColor} />
            <Divider />
            <FillStyle />
            <Divider />
            <StrokeWidth />
            <Divider />
            <StrokeStyle />
            <Divider />
            <OpacitySlider />
            <Divider />
            <Layers />
        </div>
    );
}

function DrawPanel() {
    const { strokeColor, setStrokeColor } = useCanvasStore();
    return (
        <div className="space-y-3">
            <ColorPicker label="Stroke" value={strokeColor} onChange={setStrokeColor} />
            <Divider />
            <StrokeWidth />
            <Divider />
            <StrokeStyle />
            <Divider />
            <OpacitySlider />
        </div>
    );
}

function TextPanel() {
    const { strokeColor, setStrokeColor } = useCanvasStore();
    return (
        <div className="space-y-3">
            <ColorPicker label="Text Color" value={strokeColor} onChange={setStrokeColor} />
            <Divider />
            <FontFamily />
            <Divider />
            <FontSize />
            <Divider />
            {/* <TextAlign /> */}
            <Divider />
            <OpacitySlider />
        </div>
    );
}

function LinePanel() {
    const { strokeColor, setStrokeColor } = useCanvasStore();
    return (
        <div className="space-y-3">
            <ColorPicker label="Stroke" value={strokeColor} onChange={setStrokeColor} />
            <Divider />
            <StrokeWidth />
            <Divider />
            <StrokeStyle />
            <Divider />
            <OpacitySlider />
        </div>
    );
}

function PanPanel() {
    return (
        <div className="text-center py-6 space-y-2">
            <img src="/icons/pan.svg" alt="pan" width={32} height={32} className="mx-auto opacity-20" />
            <p className="text-xs opacity-40">Hold Space + drag to pan.<br />Scroll to zoom.</p>
        </div>
    );
}

// ─── Title map ────────────────────────────────────────────────────────────────
const TITLES: Record<string, string> = {
    select: 'Selection', pan: 'Pan', freehand: 'Draw',
    eraser: 'Eraser', rectangle: 'Rectangle', ellipse: 'Ellipse',
    line: 'Line', text: 'Text',
};

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function Sidebar() {
    const [open, setOpen] = useState(true);
    const { currentTool, theme } = useCanvasStore();
    const bg = theme === 'dark'
        ? 'bg-[#232329] border-[#313131] text-white'
        : 'bg-white border-gray-200 text-gray-800';

    const renderPanel = () => {
        switch (currentTool) {
            case 'select': return <SelectPanel />;
            case 'pan': return <PanPanel />;
            case 'freehand': return <DrawPanel />;
            case 'line': return <LinePanel />;
            case 'rectangle':
            case 'ellipse': return <ShapePanel />;
            case 'text': return <TextPanel />;
            case 'eraser': return <EraserPanel />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Hamburger toggle button */}
            <button
                onClick={() => setOpen(v => !v)}
                title={open ? 'Close sidebar' : 'Open sidebar'}
                className={`p-2 rounded-lg border shadow-sm transition-colors self-start ${bg} hover:bg-gray-500/10`}
            >
                <img src="/icons/menu.svg" alt="Menu" width={18} height={18} draggable={false}
                    style={{ opacity: 0.65 }} />
            </button>

            {/* Properties panel */}
            {open && (
                <div className={`w-[212px] rounded-xl border shadow-sm p-3 ${bg} transition-all`}>
                    <p className="text-[10px] uppercase tracking-widest font-semibold opacity-40 mb-3">
                        {TITLES[currentTool] ?? 'Properties'}
                    </p>
                    {renderPanel()}
                </div>
            )}
        </div>
    );
}