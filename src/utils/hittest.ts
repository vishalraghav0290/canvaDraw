import type { CanvasElement } from '../store/canvasStore';

export const getElementBounds = (el: CanvasElement) => {
    if (el.type === 'freehand' || el.type === 'line') {
        const xs = el.points.map(p => p.x);
        const ys = el.points.map(p => p.y);
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };
    } else if (el.type === 'text') {
        // Rough approximation of text width based on font size
        const width = (el.text?.length || 0) * ((Number(el.fontSize) || 24) * 0.6);
        const height = Number(el.fontSize) || 24;
        return {
            minX: el.x,
            maxX: el.x + width,
            minY: el.y,
            maxY: el.y + height
        };
    }
    else {
        // Math.min/max handles if the user drew the shape backwards (negative width/height)
        return {
            minX: Math.min(el.x, el.x + el.width),
            maxX: Math.max(el.x, el.x + el.width),
            minY: Math.min(el.y, el.y + el.height),
            maxY: Math.max(el.y, el.y + el.height)
        };
    }

};

export const isPointInBounds = (x: number, y: number, bounds: ReturnType<typeof getElementBounds>) => {
    // We add a 5px padding so it's easier to click thin lines
    const padding = 5;
    return x >= bounds.minX - padding &&
        x <= bounds.maxX + padding &&
        y >= bounds.minY - padding &&
        y <= bounds.maxY + padding;
};