'use client';

import { useEffect, useRef } from 'react';

interface MatrixRainProps {
  density?: number;
  speed?: number;
}

export default function MatrixRain({ density = 20, speed = 1.5 }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Matrix characters - using some Matrix-inspired characters
    const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$&+,:;=?@#|<>._★^%()![]{}"`~*|/\\'.split('');
    
    // Create drops
    const columns = Math.floor(canvas.width / 20); // character width
    const drops: number[] = [];
    
    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * canvas.height);
    }

    // Draw the matrix rain
    const draw = () => {
      // Translucent background to show trail
      ctx.fillStyle = 'rgba(13, 2, 8, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text color and font
      ctx.fillStyle = '#00FF41';
      ctx.font = '15px monospace';

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        
        // Draw character
        ctx.fillText(text, i * 20, drops[i] * 20);

        // Move drop down
        drops[i]++;

        // Random reset for some drops to create cascade effect
        if (drops[i] * 20 > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
      }
    };

    // Animation loop
    const interval = setInterval(() => {
      draw();
    }, 100 / speed);

    // Clean up
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [density, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
} 