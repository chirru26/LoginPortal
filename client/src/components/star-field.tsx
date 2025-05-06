import { useEffect, useRef } from 'react';
import { useTheme } from "@/components/theme-provider";

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full screen
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Create stars with more varied properties
    const stars: {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      twinkleSpeed: number;
      twinkleDirection: boolean;
      color: string;
    }[] = [];
    
    const starCount = Math.floor((canvas.width * canvas.height) / 1500); // Higher density
    
    // Get colors based on theme
    const getStarColors = () => {
      if (theme === 'dark') {
        return [
          'rgba(255, 255, 255, 0.8)',
          'rgba(220, 220, 255, 0.7)',
          'rgba(230, 230, 255, 0.9)',
          'rgba(200, 200, 255, 0.6)',
          'rgba(255, 255, 220, 0.7)'
        ];
      } else {
        return [
          'rgba(0, 0, 50, 0.6)',
          'rgba(20, 20, 70, 0.5)',
          'rgba(30, 30, 80, 0.7)',
          'rgba(50, 50, 100, 0.5)',
          'rgba(40, 0, 80, 0.5)'
        ];
      }
    };
    
    const starColors = getStarColors();
    
    for (let i = 0; i < starCount; i++) {
      // Distribute more stars at the top of the screen
      const yBias = Math.pow(Math.random(), 1.5); // Bias towards smaller values
      
      stars.push({
        x: Math.random() * canvas.width,
        y: yBias * canvas.height,
        size: Math.random() * 2 + 0.5, // Larger size range
        speed: Math.random() * 0.15 + 0.05, // Slightly slower
        opacity: Math.random() * 0.5 + 0.5, // Random starting opacity
        twinkleSpeed: Math.random() * 0.03 + 0.01, // Speed of twinkling effect
        twinkleDirection: Math.random() > 0.5, // Whether opacity is increasing or decreasing
        color: starColors[Math.floor(Math.random() * starColors.length)] // Random color
      });
    }
    
    // Add a few extra-large stars
    for (let i = 0; i < 5; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 2.5, // Larger stars
        speed: Math.random() * 0.08 + 0.02, // Slower movement
        opacity: Math.random() * 0.3 + 0.7, // Brighter
        twinkleSpeed: Math.random() * 0.05 + 0.02, // Faster twinkling
        twinkleDirection: Math.random() > 0.5,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }
    
    // Animation loop
    let animationId: number;
    let time = 0;
    
    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update stars
      stars.forEach(star => {
        // Handle twinkling
        if (star.twinkleDirection) {
          star.opacity += star.twinkleSpeed;
          if (star.opacity >= 1) {
            star.opacity = 1;
            star.twinkleDirection = false;
          }
        } else {
          star.opacity -= star.twinkleSpeed;
          if (star.opacity <= 0.2) {
            star.opacity = 0.2;
            star.twinkleDirection = true;
          }
        }
        
        // Set color with opacity
        const color = star.color.replace(/[\d.]+\)$/, `${star.opacity})`);
        ctx.fillStyle = color;
        
        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect for larger stars
        if (star.size > 1.5) {
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 4
          );
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Move stars with slight horizontal sway
        star.y += star.speed;
        star.x += Math.sin(time + star.y * 0.05) * 0.2;
        
        // Reset stars that go off screen
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, [theme]); // Re-run when theme changes
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}