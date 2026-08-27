import { useRef, useEffect } from 'react';
import { useCanvasStore, useCameraCanavasState } from "../../store/canvasStore";
import { getScreenToWorld } from '../../utils/math';

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const isPanning = useRef(false);
  const isSpacePressed = useRef(false);
  const lastPanPosition = useRef({ x: 0, y: 0 });

  const masterArray = useCanvasStore((state) => state.masterArray);
  const addPointToCurrent = useCanvasStore((state) => state.addPointToCurrent);
  const finishStroke = useCanvasStore((state) => state.finishStroke);

  const cameraOffset = useCameraCanavasState((state) => state.cameraOffset);
  const cameraZoom = useCameraCanavasState((state) => state.cameraZoom);
  const setCameraOffset = useCameraCanavasState((state) => state.setCameraOffset);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { masterArray } = useCanvasStore.getState();
    const { cameraOffset, cameraZoom } = useCameraCanavasState.getState();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(cameraOffset.x, cameraOffset.y);
    ctx.scale(cameraZoom, cameraZoom);

    masterArray.forEach((stroke) => {
      if (stroke.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });

    ctx.restore();
  };

  useEffect(() => {
    redrawCanvas();
  }, [masterArray, cameraOffset, cameraZoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const { cameraZoom, cameraOffset, setCameraZoom, setCameraOffset } = useCameraCanavasState.getState();

      const zoomSensitivity = 0.5;
      const zoomFactor = Math.exp(-e.deltaY * zoomSensitivity);
      const newZoom = Math.min(Math.max(cameraZoom * zoomFactor, 0.1), 30);

      const mouseX = e.offsetX;
      const mouseY = e.offsetY;

      const newOffsetX = mouseX - ((mouseX - cameraOffset.x) / cameraZoom) * newZoom;
      const newOffsetY = mouseY - ((mouseY - cameraOffset.y) / cameraZoom) * newZoom;

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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
      }
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || isSpacePressed.current) {
      isPanning.current = true;
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { cameraOffset, cameraZoom } = useCameraCanavasState.getState();
    const worldCoords = getScreenToWorld(e.nativeEvent.offsetX, e.nativeEvent.offsetY, cameraOffset, cameraZoom);

    ctx.save();
    ctx.translate(cameraOffset.x, cameraOffset.y);
    ctx.scale(cameraZoom, cameraZoom);

    ctx.beginPath();
    ctx.moveTo(worldCoords.x, worldCoords.y);

    isDrawing.current = true;
    addPointToCurrent(worldCoords);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning.current) {
      const deltaX = e.clientX - lastPanPosition.current.x;
      const deltaY = e.clientY - lastPanPosition.current.y;

      const currentOffset = useCameraCanavasState.getState().cameraOffset;
      setCameraOffset(currentOffset.x + deltaX, currentOffset.y + deltaY);

      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { cameraOffset, cameraZoom } = useCameraCanavasState.getState();
    const worldCoords = getScreenToWorld(e.nativeEvent.offsetX, e.nativeEvent.offsetY, cameraOffset, cameraZoom);

    ctx.lineTo(worldCoords.x, worldCoords.y);
    ctx.stroke();

    addPointToCurrent(worldCoords);
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

    if (!isDrawing.current) return;
    isDrawing.current = false;

    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d')?.restore();

    finishStroke();
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerOut={stopDrawing}
      style={{ display: 'block', touchAction: 'none', backgroundColor: '#e5e5e5' }}
    />
  );
}