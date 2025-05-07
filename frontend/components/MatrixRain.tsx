"use client";

import { useEffect, useRef } from "react";

/**
 * MatrixRain – full-screen canvas animation that shows cascading characters.
 * Inspired by the classic "digital rain" from The Matrix films.
 *
 * Implementation details:
 *   • Runs only on the client via useEffect.
 *   • Uses requestAnimationFrame for ~60fps drawing.
 *   • Color is `#00FF66` (matching terminal), with subtle fade trail.
 *   • Characters are binary 0/1 and a few katakana glyphs for flavour.
 *   • Canvas is positioned absolute, behind main content (z-index 0).
 */
export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to fill the viewport
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const symbols = "01ﾊﾐﾑﾒﾓｩ｣ﾘｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄｶ".split("");
    const fontSize = 16;
    const columns = () => Math.floor(canvas.width / fontSize);
    let drops: number[] = Array(columns()).fill(0);

    const step = () => {
      // Fade the canvas slightly to create trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00FF66";
      ctx.font = `${fontSize}px monospace`;

      drops.forEach((y, i) => {
        const text = symbols[Math.floor(Math.random() * symbols.length)];
        ctx.fillText(text, i * fontSize, y * fontSize);

        // randomly reset drop to top
        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i]++;
        }
      });

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
} 