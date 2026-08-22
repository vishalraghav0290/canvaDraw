import { useRef, useEffect, useReducer } from 'react';



export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // We use useRef instead of useState for isDrawing. 
  // useState causes React to re-render, which would make drawing laggy and slow!
  const isDrawing = useRef(false);
  const masterArray=useRef([]); // this array store down the history of the strokes 
  const currentStroke=useRef([]);// this array store down the current strokes only 

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Wipe the screen clean!
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Loop through every stroke in our master history
    masterArray.current.forEach((stroke) => {
      if (stroke.length === 0) return;

      // 3. Draw this specific stroke
      ctx.beginPath();
      // Move pen to the very first point of this stroke
      ctx.moveTo(stroke[0].x, stroke[0].y); 

      // Trace the line through all the remaining points
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      
      ctx.stroke(); // Apply the ink!
    });
  };


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set basic pen settings
        ctx.lineCap = 'round'; // Makes line ends smooth
        ctx.lineJoin = 'round'; // Makes corners smooth
        ctx.lineWidth = 3; // Thickness of the line
      }
          redrawCanvas();
    };
  resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // 1. Press down (Start drawing)
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath(); // Tells canvas "start a brand new line here"
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); // Move the invisible pen to the cursor
    isDrawing.current = true;
        currentStroke.current=[];
        currentStroke.current.push({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
  };

  // 2. Drag (Draw the line)
  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;

    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);  // Draw a path to the new mouse position
    currentStroke.current.push({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    ctx.stroke(); // Actually fill the path with ink so we can see it
  };

  // 3. Lift up (Stop drawing)
  const stopDrawing = () => {
    if(!isDrawing.current)return; 
    isDrawing.current = false;
    masterArray.current.push(currentStroke.current);
  };





  


  return (
    <canvas
      ref={canvasRef}
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerOut={stopDrawing} // Also stop if the mouse accidentally leaves the screen
      style={{ display: 'block', touchAction: 'none', backgroundColor: '#e5e5e5' }}
    />
  );
}


