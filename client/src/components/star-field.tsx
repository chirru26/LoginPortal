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
      angle: number;
      tail?: boolean;
      tailLength?: number;
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
    
    // Background stars (slower, smaller)
    for (let i = 0; i < starCount; i++) {
      // Distribute more stars at the top of the screen
      const yBias = Math.pow(Math.random(), 1.5); // Bias towards smaller values
      
      stars.push({
        x: Math.random() * canvas.width,
        y: yBias * canvas.height,
        size: Math.random() * 1.5 + 0.5, // Slightly smaller range
        speed: Math.random() * 0.15 + 0.05, // Slower
        opacity: Math.random() * 0.5 + 0.5, // Random starting opacity
        twinkleSpeed: Math.random() * 0.03 + 0.01, // Speed of twinkling effect
        twinkleDirection: Math.random() > 0.5, // Whether opacity is increasing or decreasing
        color: starColors[Math.floor(Math.random() * starColors.length)], // Random color
        angle: Math.PI / 2 // Straight down
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
        color: starColors[Math.floor(Math.random() * starColors.length)],
        angle: Math.PI / 2
      });
    }
    
    // Shooting stars (faster, with tails)
    const shootingStarsCount = 15; // Number of shooting stars
    
    for (let i = 0; i < shootingStarsCount; i++) {
      // Create shooting stars that enter from the top half of the screen
      const x = Math.random() * canvas.width;
      // Start them outside the viewport or at the top
      const y = -50 + Math.random() * canvas.height * 0.5;
      // Random angle between 60 and 120 degrees (converted to radians)
      const angleVariation = (Math.random() * 60 - 30) * (Math.PI / 180);
      const angle = Math.PI / 2 + angleVariation;
      
      stars.push({
        x,
        y,
        size: Math.random() * 2 + 1.5, // Larger
        speed: Math.random() * 3 + 2, // Much faster
        opacity: Math.random() * 0.3 + 0.7, // Brighter
        twinkleSpeed: 0, // No twinkling for shooting stars
        twinkleDirection: true,
        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 100, 0.8)',
        angle,
        tail: true, // Has a tail
        tailLength: Math.random() * 100 + 50 // Random tail length
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
        
        // Draw tails for shooting stars
        if (star.tail && star.tailLength) {
          // Calculate the tail end position (opposite to the direction of travel)
          const tailEndX = star.x - Math.cos(star.angle) * star.tailLength;
          const tailEndY = star.y - Math.sin(star.angle) * star.tailLength;
          
          // Create gradient for tail
          const tailGradient = ctx.createLinearGradient(
            star.x, star.y,
            tailEndX, tailEndY
          );
          
          tailGradient.addColorStop(0, color);
          tailGradient.addColorStop(1, 'transparent');
          
          // Draw tail
          ctx.beginPath();
          ctx.strokeStyle = tailGradient;
          ctx.lineWidth = star.size;
          ctx.lineCap = 'round';
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(tailEndX, tailEndY);
          ctx.stroke();
        }
        
        // Draw star
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect for larger stars or shooting stars
        if (star.size > 1.5 || star.tail) {
          const glowSize = star.tail ? star.size * 3 : star.size * 4;
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, glowSize
          );
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Move stars based on their angle and speed
        if (star.tail) {
          // Shooting stars follow their angle
          star.x += Math.cos(star.angle) * star.speed;
          star.y += Math.sin(star.angle) * star.speed;
          
          // Reset shooting stars when they go off screen
          if (star.y > canvas.height || 
              star.y < -100 || 
              star.x > canvas.width + 100 || 
              star.x < -100) {
            // Reset to a new random position at the top
            star.x = Math.random() * canvas.width;
            star.y = -50;
            // New random angle
            const angleVariation = (Math.random() * 60 - 30) * (Math.PI / 180);
            star.angle = Math.PI / 2 + angleVariation;
            // New random tail length
            star.tailLength = Math.random() * 100 + 50;
          }
        } else {
          // Regular stars have gentle sway and mostly fall down
          star.y += star.speed;
          star.x += Math.sin(time + star.y * 0.05) * 0.2;
          
          // Reset regular stars
          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
          }
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