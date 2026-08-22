import Canvas from "../components/Canvas/Canvas";

export const redrawCanvas = (Canvas) => {
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