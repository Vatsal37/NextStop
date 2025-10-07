import { useEffect, useRef } from "react";

function AnimatedBackground({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Travel-related symbols
    const symbols = ["✈️", "🧳", "🗺️", "🛫", "🛬", "📍"];

    const particles = [];

    const createParticles = () => {
      const particleCount = Math.min(5, Math.floor(window.innerWidth / 200));

      for (let i = 0; i < particleCount; i++) {
        const colors = [
          "#666666", // Dark gray
          "#555555", // Darker gray
          "#777777", // Medium gray
        ];

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 10 + 8,
          speed: Math.random() * 0.3 + 0.1,
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.003,
        });
      }
    };

    createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.y -= particle.speed;
        particle.rotation += particle.rotationSpeed;

        if (particle.y < -particle.size) {
          particle.y = canvas.height + particle.size;
          particle.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.font = `${particle.size}px Arial`;
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = 0.15;
        ctx.fillText(particle.symbol, 0, 0);
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ backgroundColor: "transparent" }}
    />
  );
}

export default AnimatedBackground;