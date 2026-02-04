import React, { useEffect, useRef } from 'react';

const OpticNerveAnimation = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Configuration
        const nerveCount = 12;
        const particlesPerNerve = 5;
        const eyeRadius = 60; // Size of the eye center

        let width, height, centerX, centerY;
        let nerves = [];
        let particles = [];

        // Nerve Path Generator (Cubic Bezier)
        class Nerve {
            constructor(yOffset, index) {
                // Start from the edge of the eye
                this.startX = centerX + eyeRadius;
                this.startY = centerY;

                // End at the right edge of the screen, spread out vertically
                this.endX = width;
                // Spread nerves fan-like
                this.endY = centerY + (yOffset * 10) + (Math.sin(index) * height * 0.4);

                // Control points for organic curve
                this.cp1x = centerX + (width - centerX) * 0.3;
                this.cp1y = centerY;

                this.cp2x = centerX + (width - centerX) * 0.6;
                this.cp2y = this.endY;

                this.index = index;
            }

            draw(ctx) {
                ctx.beginPath();
                ctx.moveTo(this.startX, this.startY);
                ctx.bezierCurveTo(this.cp1x, this.cp1y, this.cp2x, this.cp2y, this.endX, this.endY);
                ctx.strokeStyle = `rgba(37, 99, 235, ${0.1 + (Math.abs(Math.sin(Date.now() * 0.001 + this.index)) * 0.2)})`; // Pulsing Blue
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            getPointAtT(t) {
                // Cubic Bezier formula
                // B(t) = (1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t) t^2 P2 + t^3 P3
                const mt = 1 - t;
                const mt2 = mt * mt;
                const mt3 = mt2 * mt;
                const t2 = t * t;
                const t3 = t2 * t;

                const x = mt3 * this.startX + 3 * mt2 * t * this.cp1x + 3 * mt * t2 * this.cp2x + t3 * this.endX;
                const y = mt3 * this.startY + 3 * mt2 * t * this.cp1y + 3 * mt * t2 * this.cp2y + t3 * this.endY;

                return { x, y };
            }
        }

        class Particle {
            constructor(nerve) {
                this.nerve = nerve;
                this.t = Math.random(); // Position along the curve (0 to 1)
                this.speed = 0.005 + Math.random() * 0.01; // Travel speed
                this.size = 2 + Math.random() * 2;
                this.active = false; // "Firing" state
            }

            update() {
                this.t += this.speed;
                if (this.t > 1) {
                    this.t = 0;
                    // Reset to nerve start or potentially switch nerve?
                    // For now loop
                }
            }

            draw(ctx) {
                const pos = this.nerve.getPointAtT(this.t);

                // Yellow dotted ball
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = '#fbbf24'; // Amber-400
                ctx.fill();

                // Glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#f59e0b';
            }
        }

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight * 0.6; // Top section height usually
            centerX = width * 0.15; // Eye position on the left
            centerY = height / 2;

            // Re-init nerves
            nerves = [];
            particles = [];
            for (let i = 0; i < nerveCount; i++) {
                // Distribute nerves
                const offset = i - (nerveCount / 2);
                const nerve = new Nerve(offset, i);
                nerves.push(nerve);

                for (let p = 0; p < particlesPerNerve; p++) {
                    particles.push(new Particle(nerve));
                }
            }
        };

        const drawEye = (ctx) => {
            // 1. Outer Tech Ring (Sclera equivalent but sci-fi)
            ctx.beginPath();
            ctx.arc(centerX, centerY, eyeRadius * 1.2, 0, Math.PI * 2);
            const gradRing = ctx.createRadialGradient(centerX, centerY, eyeRadius * 0.8, centerX, centerY, eyeRadius * 1.2);
            gradRing.addColorStop(0, 'rgba(15, 23, 42, 0)');
            gradRing.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)');
            gradRing.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
            ctx.fillStyle = gradRing;
            ctx.fill();

            ctx.strokeStyle = '#1e293b'; // Slate-800
            ctx.lineWidth = 1;
            ctx.stroke();

            // 2. Main Eye Globe
            ctx.beginPath();
            ctx.arc(centerX, centerY, eyeRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#020617'; // Slate-950 black
            ctx.fill();

            // 3. Iris Gradient
            ctx.beginPath();
            ctx.arc(centerX, centerY, eyeRadius * 0.9, 0, Math.PI * 2);
            const irisGrad = ctx.createRadialGradient(centerX, centerY, eyeRadius * 0.3, centerX, centerY, eyeRadius * 0.9);
            irisGrad.addColorStop(0, '#1d4ed8'); // Blue-700
            irisGrad.addColorStop(0.6, '#3b82f6'); // Blue-500
            irisGrad.addColorStop(1, '#60a5fa'); // Blue-400
            ctx.fillStyle = irisGrad;
            ctx.fill();

            // 4. Iris Detail Lines (Muscle fibers)
            ctx.save();
            ctx.translate(centerX, centerY);
            for (let i = 0; i < 60; i++) {
                ctx.rotate((Math.PI * 2) / 60);
                ctx.beginPath();
                ctx.moveTo(eyeRadius * 0.4, 0);
                ctx.lineTo(eyeRadius * 0.85, 0);
                ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
            ctx.restore();

            // 5. Pupil (Deep Void)
            ctx.beginPath();
            ctx.arc(centerX, centerY, eyeRadius * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.shadowBlur = 0;
            ctx.fill();

            // 6. Digital Overlay / HUD Ring
            ctx.beginPath();
            ctx.arc(centerX, centerY, eyeRadius * 0.5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(147, 197, 253, 0.3)'; // Blue-300
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 4]); // Dashed technical look
            ctx.stroke();
            ctx.setLineDash([]); // Reset

            // 7. Specular Reflection (Glint)
            ctx.beginPath();
            ctx.ellipse(centerX - eyeRadius * 0.3, centerY - eyeRadius * 0.3, eyeRadius * 0.15, eyeRadius * 0.1, Math.PI / 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'white';
            ctx.fill();
            ctx.shadowBlur = 0;
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; // Slate-950 with trails
            ctx.fillRect(0, 0, width, height);

            drawEye(ctx);

            nerves.forEach(nerve => nerve.draw(ctx));

            particles.forEach(p => {
                p.update();
                p.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default OpticNerveAnimation;
