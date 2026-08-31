import type { CanvasElement } from '../store/canvasStore';
import { getElementBounds } from '../utils/hittest';

// A standalone draw function so we don't have to mount a React component
const drawShapeForExport = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    ctx.beginPath();
    ctx.strokeStyle = element.strokeColor || '#000000';
    ctx.lineWidth = element.strokeWidth || 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (element.type === 'freehand' || element.type === 'line') {
        if (!element.points.length) return;
        ctx.moveTo(element.points[0].x, element.points[0].y);
        for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
        }
    } else if (element.type === 'rectangle') {
        ctx.rect(element.x, element.y, element.width, element.height);
    } else if (element.type === 'ellipse') {
        const rx = Math.abs(element.width / 2);
        const ry = Math.abs(element.height / 2);
        const cx = element.x + element.width / 2;
        const cy = element.y + element.height / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
    } else if (element.type === 'text') {
        ctx.font = `${element.fontSize || 24}px sans-serif`;
        ctx.fillStyle = element.strokeColor || '#000000';
        ctx.textBaseline = 'top';
        const lines = (element.text || '').split('\n');
        const lineHeight = Number(element.fontSize || 24) * 1.2;
        lines.forEach((line, index) => {
            ctx.fillText(line, element.x, element.y + index * lineHeight);
        });
        return;
    }
    ctx.stroke();
};

export const exportToPNG = (elements: CanvasElement[]) => {
    if (elements.length === 0) return alert("Canvas is empty!");

    // 1. Find the furthest edges of all combined shapes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    elements.forEach((el) => {
        const bounds = getElementBounds(el);
        minX = Math.min(minX, bounds.minX);
        minY = Math.min(minY, bounds.minY);
        maxX = Math.max(maxX, bounds.maxX);
        maxY = Math.max(maxY, bounds.maxY);
    });

    const padding = 40; // 40px whitespace border
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    // 2. Create temporary canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 3. Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 4. Align the camera so the top-left shape starts exactly at the padding
    ctx.translate(-minX + padding, -minY + padding);

    // 5. Draw and download
    elements.forEach((el) => drawShapeForExport(ctx, el));

    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    //javascript code to download the image
};