import { useRef, useEffect } from 'react';
import { useCanvasStore, useCameraCanavasState, type CanvasElement } from "../../store/canvasStore";
import { getScreenToWorld } from '../../utils/math';
import { getElementBounds, isPointInBounds } from '../../utils/hittest';

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPanning = useRef(false);
  const isSpacePressed = useRef(false);
  const lastPanPosition = useRef({ x: 0, y: 0 });

  const elements = useCanvasStore((state) => state.elements);
  const currentElement = useCanvasStore((state) => state.currentElement);
  const selectedElementId = useCanvasStore((state) => state.selectedElementId);
  
  const cameraOffset = useCameraCanavasState((state) => state.cameraOffset);
  const cameraZoom = useCameraCanavasState((state) => state.cameraZoom);

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
      if (e.code === 'Space' && !isSpacePressed.current) {
        isSpacePressed.current = true;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
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
    const { currentTool } = useCanvasStore.getState();

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
      return; // Stop here so we don't start drawing a new shape
    }

    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: currentTool as 'freehand' | 'rectangle' | 'ellipse' | 'line',
      x: worldCoords.x,
      y: worldCoords.y,
      width: 0,
      height: 0,
      points: [worldCoords],
      strokeColor: '#000000',
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
      } catch {}
      if (canvasRef.current) {
        canvasRef.current.style.cursor = isSpacePressed.current ? 'grab' : 'default';
      }
      return;
    }

    const currentEl = useCanvasStore.getState().currentElement;
    if (currentEl) {
      useCanvasStore.getState().addElement(currentEl);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerOut={stopDrawing}
      style={{ display: 'block', touchAction: 'none' }}
    />
  );
}