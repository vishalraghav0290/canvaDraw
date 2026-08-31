import { useRef, useEffect } from 'react';
import { useCanvasStore, useCameraCanavasState, type CanvasElement } from "../../store/canvasStore";
import { getScreenToWorld } from '../../utils/math';
import { getElementBounds, isPointInBounds } from '../../utils/hittest';

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPanning = useRef(false);
  const isSpacePressed = useRef(false);
  const isDragging = useRef(false);
  const lastPanPosition = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const isResizing = useRef(false);
  const activeTextarea = useRef<HTMLTextAreaElement | null>(null); // vanilla DOM text input

  const elements = useCanvasStore((state) => state.elements);
  const currentElement = useCanvasStore((state) => state.currentElement);
  const selectedElementId = useCanvasStore((state) => state.selectedElementId);

  const cameraOffset = useCameraCanavasState((state) => state.cameraOffset);
  const cameraZoom = useCameraCanavasState((state) => state.cameraZoom);

  // Creates a real textarea element on document.body (bypasses React render cycle)
  const spawnTextInput = (screenX: number, screenY: number, worldX: number, worldY: number) => {
    // Remove any existing text input first
    if (activeTextarea.current) {
      activeTextarea.current.remove();
      activeTextarea.current = null;
    }

    const { cameraZoom } = useCameraCanavasState.getState();
    const { strokeColor } = useCanvasStore.getState();
    const fontSize = Math.round(24 * cameraZoom);

    const ta = document.createElement('textarea');
    ta.rows = 1;

    // Auto-resize as user types
    const autoResize = () => {
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
      ta.style.width = 'auto';
      // Grow width based on longest line
      const lines = ta.value.split('\n');
      const longestLine = lines.reduce((a, b) => a.length > b.length ? a : b, '');
      // Measure text width using a canvas context
      const tmpCtx = document.createElement('canvas').getContext('2d');
      if (tmpCtx) {
        tmpCtx.font = `${fontSize}px sans-serif`;
        const measuredWidth = tmpCtx.measureText(longestLine || ' ').width;
        ta.style.width = `${Math.max(measuredWidth + 4, 4)}px`;
      }
    };

    Object.assign(ta.style, {
      position: 'fixed',
      left: `${screenX}px`,
      top: `${screenY}px`,
      width: '4px',          // Start tiny, expands as you type
      height: `${fontSize * 1.4}px`,
      fontSize: `${fontSize}px`,
      fontFamily: 'sans-serif',
      lineHeight: '1.4',
      color: strokeColor,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      padding: '0',
      margin: '0',
      resize: 'none',
      overflow: 'hidden',
      whiteSpace: 'pre',
      zIndex: '99999',
      caretColor: strokeColor,
      wordBreak: 'keep-all',
    });

    ta.addEventListener('input', autoResize);

    ta.addEventListener('blur', () => {
      const val = ta.value.trim();
      if (val) {
        useCanvasStore.getState().addElement({
          id: Date.now().toString(),
          type: 'text',
          x: worldX,
          y: worldY,
          width: 0,
          height: 0,
          points: [],
          strokeColor: useCanvasStore.getState().strokeColor,
          strokeWidth: 3,
          text: val,
          fontSize: '24',
        });
      }
      ta.remove();
      activeTextarea.current = null;
    });

    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ta.remove();
        activeTextarea.current = null;
        e.preventDefault();
      }
      // Stop canvas shortcuts (delete, space) from firing while typing
      e.stopPropagation();
      // Allow auto-resize on next tick after keydown
      setTimeout(autoResize, 0);
    });

    ta.addEventListener('pointerdown', (e) => e.stopPropagation());
    ta.addEventListener('mousedown', (e) => e.stopPropagation());

    document.body.appendChild(ta);
    activeTextarea.current = ta;
    setTimeout(() => ta.focus(), 0);
  };

  const drawShape = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
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
    }
    else if (element.type === 'text') {
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

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { elements, currentElement } = useCanvasStore.getState();
    const { cameraOffset, cameraZoom } = useCameraCanavasState.getState();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(cameraOffset.x, cameraOffset.y);
    ctx.scale(cameraZoom, cameraZoom);

    elements.forEach((el) => drawShape(ctx, el));
    if (currentElement) drawShape(ctx, currentElement);

    // Draw Selection Bounding Box
    const { selectedElementId } = useCanvasStore.getState();
    if (selectedElementId) {
      const selectedEl = elements.find(e => e.id === selectedElementId);
      if (selectedEl) {
        const bounds = getElementBounds(selectedEl);
        ctx.save();
        ctx.strokeStyle = '#3b82f6'; // Tailwind blue-500
        ctx.lineWidth = 1.5 / cameraZoom; // Keep stroke thin even when zoomed in
        ctx.setLineDash([5 / cameraZoom, 5 / cameraZoom]);

        // Draw the box with a 4px padding around the shape
        ctx.strokeRect(
          bounds.minX - 4,
          bounds.minY - 4,
          bounds.maxX - bounds.minX + 8,
          bounds.maxY - bounds.minY + 8
        );

        // Draw the resize handle (bottom-right corner)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5 / cameraZoom;
        ctx.setLineDash([]);
        const handleSize = 8 / cameraZoom;
        const halfSize = handleSize / 2;
        ctx.fillRect(bounds.maxX - halfSize, bounds.maxY - halfSize, handleSize, handleSize);
        ctx.strokeRect(bounds.maxX - halfSize, bounds.maxY - halfSize, handleSize, handleSize);

        ctx.restore();
      }
    }

    ctx.restore();
  };

  useEffect(() => {
    redrawCanvas();
  }, [elements, currentElement, cameraOffset, cameraZoom, selectedElementId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { cameraZoom, cameraOffset, setCameraZoom, setCameraOffset } = useCameraCanavasState.getState();

      const zoomFactor = Math.exp(-e.deltaY * 0.001);
      const newZoom = Math.min(Math.max(cameraZoom * zoomFactor, 0.1), 30);

      const newOffsetX = e.offsetX - ((e.offsetX - cameraOffset.x) / cameraZoom) * newZoom;
      const newOffsetY = e.offsetY - ((e.offsetY - cameraOffset.y) / cameraZoom) * newZoom;

      setCameraZoom(newZoom);
      setCameraOffset(newOffsetX, newOffsetY);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept keypresses while the text input textarea is focused
      if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' && !isSpacePressed.current) {
        isSpacePressed.current = true;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const { selectedElementId, deleteElement } = useCanvasStore.getState();
        if (selectedElementId) {
          deleteElement(selectedElementId);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        isSpacePressed.current = false;
        if (canvasRef.current) canvasRef.current.style.cursor = 'default';
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        redrawCanvas();
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { currentTool, strokeColor } = useCanvasStore.getState();

    if (e.button === 1 || isSpacePressed.current || currentTool === 'pan') {
      isPanning.current = true;
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
      return;
    }


    const { cameraOffset, cameraZoom } = useCameraCanavasState.getState();
    const worldCoords = getScreenToWorld(e.nativeEvent.offsetX, e.nativeEvent.offsetY, cameraOffset, cameraZoom);

    if (currentTool === 'select') {
      const { elements, setSelectedElementId } = useCanvasStore.getState();

      // NEW: Check if clicking the active resize handle
      if (selectedElementId) {
        console.log(selectedElementId, '================')
        const selectedEl = elements.find(e => e.id === selectedElementId);
        if (selectedEl) {
          const bounds = getElementBounds(selectedEl);
          // Scale hit tolerance so it's always easy to click, regardless of zoom
          const hitTolerance = 10 / cameraZoom;
          if (
            Math.abs(worldCoords.x - bounds.maxX) <= hitTolerance &&
            Math.abs(worldCoords.y - bounds.maxY) <= hitTolerance
          ) {
            isResizing.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            return;
          }
        }
      }

      // Loop backwards to select the shape that is visually on top
      let foundId = null;
      for (let i = elements.length - 1; i >= 0; i--) {
        const bounds = getElementBounds(elements[i]);
        if (isPointInBounds(worldCoords.x, worldCoords.y, bounds)) {
          foundId = elements[i].id;
          break;
        }
      }
      setSelectedElementId(foundId);
      // If we clicked a shape, start dragging
      if (foundId) {
        isDragging.current = true;
        lastMousePos.current = { x: worldCoords.x, y: worldCoords.y };
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      return; // Stop here so we don't start drawing a new shape
    }

    if (currentTool === 'text') {
      console.log('[TEXT] spawning vanilla textarea at screen:', e.clientX, e.clientY);
      spawnTextInput(e.clientX, e.clientY, worldCoords.x, worldCoords.y);
      return;
    }

    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: currentTool as 'freehand' | 'rectangle' | 'ellipse' | 'line' | 'text',
      x: worldCoords.x,
      y: worldCoords.y,
      width: 0,
      height: 0,
      points: [worldCoords],
      strokeColor: strokeColor,
      strokeWidth: 3
    };

    useCanvasStore.getState().setCurrentElement(newElement);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning.current) {
      const deltaX = e.clientX - lastPanPosition.current.x;
      const deltaY = e.clientY - lastPanPosition.current.y;
      const { cameraOffset, setCameraOffset } = useCameraCanavasState.getState();

      setCameraOffset(cameraOffset.x + deltaX, cameraOffset.y + deltaY);
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const { currentTool, selectedElementId, elements, updateElement } = useCanvasStore.getState();

    // NEW: RESIZE SHAPE LOGIC
    if (currentTool === 'select' && isResizing.current && selectedElementId) {
      const selectedEl = elements.find(e => e.id === selectedElementId);
      if (!selectedEl) return;

      const { cameraOffset, cameraZoom } = useCameraCanavasState.getState();
      const worldCoords = getScreenToWorld(e.nativeEvent.offsetX, e.nativeEvent.offsetY, cameraOffset, cameraZoom);

      const updatedEl = { ...selectedEl };

      if (updatedEl.type !== 'freehand' && updatedEl.type !== 'line') {
        updatedEl.width = worldCoords.x - updatedEl.x;
        updatedEl.height = worldCoords.y - updatedEl.y;
      }

      updateElement(selectedElementId, updatedEl);
      return;
    }

    // DRAG SELECTED SHAPE LOGIC
    if (currentTool === 'select' && isDragging.current && selectedElementId) {
      const selectedEl = elements.find(e => e.id === selectedElementId);
      if (!selectedEl) return;

      const { cameraOffset, cameraZoom } = useCameraCanavasState.getState();
      const worldCoords = getScreenToWorld(e.nativeEvent.offsetX, e.nativeEvent.offsetY, cameraOffset, cameraZoom);

      const deltaX = worldCoords.x - lastMousePos.current.x;
      const deltaY = worldCoords.y - lastMousePos.current.y;

      const updatedEl = { ...selectedEl };

      if (updatedEl.type === 'freehand' || updatedEl.type === 'line') {
        updatedEl.points = updatedEl.points.map(p => ({ x: p.x + deltaX, y: p.y + deltaY }));
      } else {
        updatedEl.x += deltaX;
        updatedEl.y += deltaY;
      }

      updateElement(selectedElementId, updatedEl);
      lastMousePos.current = { x: worldCoords.x, y: worldCoords.y }; // Reset for next frame
      return;
    }

    const currentEl = useCanvasStore.getState().currentElement;
    if (!currentEl) return;

    const { cameraOffset, cameraZoom } = useCameraCanavasState.getState();
    const worldCoords = getScreenToWorld(e.nativeEvent.offsetX, e.nativeEvent.offsetY, cameraOffset, cameraZoom);

    const updatedElement = { ...currentEl };

    if (updatedElement.type === 'freehand') {
      updatedElement.points = [...updatedElement.points, worldCoords];
    } else {
      updatedElement.width = worldCoords.x - updatedElement.x;
      updatedElement.height = worldCoords.y - updatedElement.y;

      if (updatedElement.type === 'line') {
        updatedElement.points = [updatedElement.points[0], worldCoords];
      }
    }

    useCanvasStore.getState().setCurrentElement(updatedElement);
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning.current) {
      isPanning.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch { }
      if (canvasRef.current) {
        canvasRef.current.style.cursor = isSpacePressed.current ? 'grab' : 'default';
      }
      return;
    }
    // ADD THIS BLOCK: Release resize lock
    if (isResizing.current) {
      isResizing.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch { }
      return;
    }
    if (isDragging.current) {
      isDragging.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch { }
      return;
    }

    const currentEl = useCanvasStore.getState().currentElement;
    if (currentEl) {
      useCanvasStore.getState().addElement(currentEl);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerOut={stopDrawing}
        style={{ display: 'block', touchAction: 'none' }}
      />
    </>
  );
}