"use client";

import React, { useEffect, useRef, memo, useState } from "react";
import { SETTINGS_KEYS, getSetting } from "../../../features/profile/utils/settingsUtils";

const DynamicSeasonalAnimation = memo(function DynamicSeasonalAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const initialDisabled = getSetting(SETTINGS_KEYS.DISABLE_PARTICLES, false);
    let animId;
    let isActive = false;
    let currentAlpha = initialDisabled ? 0.0 : 1.0;
    let targetAlpha = initialDisabled ? 0.0 : 1.0;
    let isFadingOutState = false;
    let particles = [];
    let currentTheme = "WINTER";

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function getCurrentSeasonTheme() {
      const month = new Date().getMonth(); // 0-indexed (0 = January)
      if (month >= 2 && month <= 4) return "SPRING";        // Mar, Apr, May (Sakura)
      if (month === 5) return "EARLY_SUMMER";               // Jun (Rain)
      if (month === 6 || month === 7) return "LATE_SUMMER"; // Jul, Aug (Lanterns)
      if (month >= 8 && month <= 10) return "AUTUMN";       // Sep, Oct, Nov (Momiji)
      return "WINTER";                                      // Dec, Jan, Feb (Snow)
    }

    class Sakura {
      constructor(w, h) {
        this.depth = Math.random() * 0.8 + 0.2; 
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        
        this.size = (Math.random() * 4 + 6) * this.depth; 
        this.vy = (Math.random() * 1.5 + 0.6) * this.depth; 
        this.vx = (Math.random() - 0.5) * 0.5 * this.depth;
        this.opacity = (Math.random() * 0.5 + 0.3) * this.depth;
        
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.04;
      }
      update() {
        this.y += this.vy;
        this.x += this.vx + Math.sin(this.angle) * 0.3 * this.depth; 
        this.angle += this.spin;
        if (this.y > this.h + this.size) {
          this.y = -20;
          this.x = Math.random() * this.w;
        }
      }
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.beginPath();
        ctx.moveTo(0, this.size);
        ctx.bezierCurveTo(this.size * 1.2, this.size * 0.3, this.size * 0.8, -this.size, 0, -this.size * 0.8);
        ctx.bezierCurveTo(-this.size * 0.5, -this.size, -this.size * 0.8, this.size * 0.2, 0, this.size);
        
        const grad = ctx.createLinearGradient(0, -this.size, 0, this.size);
        grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        grad.addColorStop(1, `rgba(180, 190, 210, ${this.opacity * 0.4})`);
        
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }
    }

    class Lantern {
      constructor(w, h) {
        this.depth = Math.random() * 0.7 + 0.3; 
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        
        this.width = 22 * this.depth; 
        this.height = 34 * this.depth; 
        this.vy = -(Math.random() * 1.2 + 0.2) * this.depth; 
        this.vx = (Math.random() - 0.5) * 0.2 * this.depth;
        this.opacity = (Math.random() * 0.4 + 0.6) * this.depth;
        
        this.wobble = Math.random() * Math.PI * 2;
      }
      update() {
        this.y += this.vy;
        this.wobble += 0.01;
        this.x += this.vx + Math.sin(this.wobble) * 0.2 * this.depth;
        
        if (this.y < -50) {
          let spawnY = this.h + 20;
          const contentContainer = document.getElementById('content-bounds');
          if (contentContainer) {
            const cb = contentContainer.getBoundingClientRect().bottom;
            if (cb > 0 && cb < this.h) {
              spawnY = cb + 30;
            }
          }
          this.y = spawnY + Math.random() * 50;
          this.x = Math.random() * this.w;
        }
      }
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.sin(this.wobble) * 0.05);

        ctx.beginPath();
        ctx.roundRect(-this.width/2, -this.height/2, this.width, this.height, 6 * this.depth);
        
        ctx.fillStyle = `rgba(251, 191, 36, ${this.opacity})`;
        ctx.shadowBlur = 20 * this.depth; 
        ctx.shadowColor = `rgba(245, 158, 11, ${this.opacity})`;
        ctx.fill();
        
        ctx.shadowBlur = 0; 

        ctx.fillStyle = `rgba(220, 38, 38, ${this.opacity * 0.9})`; 
        ctx.font = `bold ${this.width * 0.75}px sans-serif`; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('祭', 0, 0);
        
        ctx.fillStyle = `rgba(0, 0, 0, 0.4)`;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, 4 * this.depth);
        ctx.fillRect(-this.width/2, this.height/2 - (4 * this.depth), this.width, 4 * this.depth);
        
        ctx.restore();
      }
    }

    class Snow {
      constructor(w, h) {
        this.depth = Math.random() * 0.8 + 0.2;
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        
        this.size = (Math.random() * 2 + 2) * this.depth;
        this.vy = (Math.random() * 1.5 + 0.2) * this.depth;
        this.opacity = (Math.random() * 0.5 + 0.2) * this.depth;
        
        this.rotation = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.02;
      }
      update() {
        this.y += this.vy;
        this.rotation += this.spin;
        if (this.y > this.h + 20) {
          this.y = -20;
          this.x = Math.random() * this.w;
        }
      }
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.beginPath();
        for(let i=0; i<6; i++) {
          ctx.moveTo(0,0);
          ctx.lineTo(0, -this.size * 2);
          ctx.moveTo(0, -this.size);
          ctx.lineTo(this.size * 0.5, -this.size * 1.5);
          ctx.moveTo(0, -this.size);
          ctx.lineTo(-this.size * 0.5, -this.size * 1.5);
          ctx.rotate(Math.PI / 3);
        }
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = Math.max(0.5, 1 * this.depth);
        ctx.stroke();
        
        ctx.restore();
      }
    }

    class AutumnLeaf {
      constructor(w, h) {
        this.depth = Math.random() * 0.8 + 0.2; 
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        
        this.size = (Math.random() * 12 + 12) * this.depth; 
        this.vy = (Math.random() * 1.5 + 0.8) * this.depth; 
        this.vx = (Math.random() - 0.5) * 1.5 * this.depth;
        this.opacity = (Math.random() * 0.6 + 0.4) * this.depth;
        
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.05;
        
        const colors = ['#dc2626', '#ea580c', '#d97706', '#991b1b'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.y += this.vy;
        this.x += this.vx + Math.sin(this.angle) * 0.5 * this.depth;
        this.angle += this.spin;
        if (this.y > this.h + this.size) {
          this.y = -20;
          this.x = Math.random() * this.w;
        }
      }
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity * ctx.globalAlpha;
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.3, -this.size * 0.2);
        ctx.lineTo(this.size * 0.9, -this.size * 0.3);
        ctx.lineTo(this.size * 0.4, this.size * 0.2);
        ctx.lineTo(this.size * 0.6, this.size * 0.8);
        ctx.lineTo(this.size * 0.1, this.size * 0.4);
        
        ctx.lineTo(this.size * 0.1, this.size * 1.2);
        ctx.lineTo(-this.size * 0.1, this.size * 1.2);
        ctx.lineTo(-this.size * 0.1, this.size * 0.4);
        
        ctx.lineTo(-this.size * 0.6, this.size * 0.8);
        ctx.lineTo(-this.size * 0.4, this.size * 0.2);
        ctx.lineTo(-this.size * 0.9, -this.size * 0.3);
        ctx.lineTo(-this.size * 0.3, -this.size * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    class Rain {
      constructor(w, h) {
        this.depth = Math.random() * 0.8 + 0.2;
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        
        this.length = (Math.random() * 15 + 5) * this.depth;
        this.vy = (Math.random() * 20 + 10) * this.depth; 
        this.vx = -1 * this.depth; 
        this.opacity = (Math.random() * 0.3 + 0.1) * this.depth;
      }
      update() {
        this.y += this.vy;
        this.x += this.vx;
        if (this.y > this.h || this.x < -20) {
          if (Math.random() > 0.5) {
            this.y = -20;
            this.x = Math.random() * this.w + 50;
          } else {
            this.x = this.w + 20;
            this.y = Math.random() * this.h;
          }
        }
      }
      draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.vx, this.y + this.length);
        ctx.strokeStyle = `rgba(148, 163, 184, ${this.opacity})`;
        ctx.lineWidth = Math.max(0.5, 1 * this.depth);
        ctx.stroke();
      }
    }

    class SunShower {
      constructor(w, h) {
        this.depth = Math.random() * 0.8 + 0.2;
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.length = (Math.random() * 15 + 10) * this.depth;
        this.vy = (Math.random() * 15 + 15) * this.depth;
        this.vx = 4 * this.depth; 
        this.opacity = (Math.random() * 0.2 + 0.1) * this.depth;
      }
      update() {
        this.y += this.vy;
        this.x += this.vx;
        if (this.y > this.h || this.x > this.w + 20) { 
          if (Math.random() > 0.5) {
            this.y = -20; 
            this.x = (Math.random() * this.w) - 50; 
          } else {
            this.x = -20;
            this.y = Math.random() * this.h;
          }
        }
      }
      draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.vx, this.y + this.length);
        ctx.strokeStyle = `rgba(14, 165, 233, ${this.opacity})`;
        ctx.lineWidth = Math.max(0.5, 1.5 * this.depth);
        ctx.stroke();
      }
    }

    class BambooLeaf {
      constructor(w, h) {
        this.depth = Math.random() * 0.8 + 0.2;
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = (Math.random() * 6 + 10) * this.depth;
        this.vy = (Math.random() * 1.5 + 1.0) * this.depth;
        this.vx = (Math.random() * 2 + 1) * this.depth;
        this.opacity = (Math.random() * 0.6 + 0.4) * this.depth;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.08;
        const colors = ['#10b981', '#059669', '#34d399', '#a3e635']; 
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.y += this.vy;
        this.x += this.vx + Math.sin(this.angle) * 0.8 * this.depth;
        this.angle += this.spin;
        if (this.y > this.h + this.size || this.x > this.w + this.size) {
            if (Math.random() > 0.5) {
                this.y = -20;
                this.x = (Math.random() * this.w) - 50;
            } else {
                this.x = -20;
                this.y = Math.random() * this.h;
            }
        }
      }
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity * ctx.globalAlpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 1.5);
        ctx.quadraticCurveTo(this.size * 0.4, 0, 0, this.size * 1.5);
        ctx.quadraticCurveTo(-this.size * 0.4, 0, 0, -this.size * 1.5);
        ctx.fill();
        ctx.restore();
      }
    }

    class GinkgoLeaf {
      constructor(w, h) {
        this.depth = Math.random() * 0.8 + 0.2;
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = (Math.random() * 8 + 12) * this.depth;
        this.vy = (Math.random() * 1.5 + 0.8) * this.depth;
        this.vx = (Math.random() - 0.5) * 1.5 * this.depth;
        this.opacity = (Math.random() * 0.6 + 0.4) * this.depth;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.06;
        const colors = ['#facc15', '#eab308', '#f59e0b', '#fbbf24'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.y += this.vy;
        this.x += this.vx + Math.sin(this.angle) * 0.5 * this.depth;
        this.angle += this.spin;
        if (this.y > this.h + this.size) { this.y = -20; this.x = Math.random() * this.w; }
      }
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity * ctx.globalAlpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, this.size * 0.5); 
        ctx.lineTo(0, this.size); 
        ctx.lineTo(this.size * 0.1, this.size);
        ctx.lineTo(this.size * 0.1, this.size * 0.5);
        ctx.arc(0, this.size * 0.5, this.size, Math.PI + 0.2, Math.PI * 2 - 0.2, false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    class DaySnow {
      constructor(w, h) {
        this.depth = Math.random() * 0.8 + 0.2;
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = (Math.random() * 3 + 3) * this.depth;
        this.vy = (Math.random() * 1.5 + 0.2) * this.depth;
        this.opacity = (Math.random() * 0.5 + 0.3) * this.depth;
        this.rotation = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.02;
      }
      update() {
        this.y += this.vy;
        this.rotation += this.spin;
        if (this.y > this.h + 20) { this.y = -20; this.x = Math.random() * this.w; }
      }
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -this.size * 2);
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size * 0.5, -this.size * 1.5);
            ctx.moveTo(0, -this.size);
            ctx.lineTo(-this.size * 0.5, -this.size * 1.5);
            ctx.rotate(Math.PI / 3);
        }
        ctx.strokeStyle = `rgba(186, 230, 253, ${this.opacity})`;
        ctx.lineWidth = Math.max(1.0, 1.5 * this.depth);
        ctx.stroke();
        ctx.restore();
      }
    }

    function initParticles(startOffscreen = true) {
      particles = [];
      const w = canvas.width;
      const h = canvas.height;
      
      currentTheme = getCurrentSeasonTheme();

      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.classList.contains("focus-mode") ||
        document.documentElement.classList.contains("black-text");

      if (isDark) {
        if (currentTheme === "SPRING") {
          for(let i=0; i<30; i++) particles.push(new Sakura(w, h));
        } else if (currentTheme === "EARLY_SUMMER") {
          for(let i=0; i<80; i++) particles.push(new Rain(w, h));
        } else if (currentTheme === "LATE_SUMMER") {
          for(let i=0; i<12; i++) particles.push(new Lantern(w, h));
        } else if (currentTheme === "AUTUMN") {
          for(let i=0; i<35; i++) particles.push(new AutumnLeaf(w, h));
        } else { // WINTER
          for(let i=0; i<100; i++) particles.push(new Snow(w, h));
        }
      } else {
        // LIGHT MODE PARTICLES
        if (currentTheme === "SPRING") {
          for(let i=0; i<30; i++) particles.push(new Sakura(w, h));
        } else if (currentTheme === "EARLY_SUMMER") {
          for(let i=0; i<100; i++) particles.push(new SunShower(w, h));
        } else if (currentTheme === "LATE_SUMMER") {
          for(let i=0; i<35; i++) particles.push(new BambooLeaf(w, h));
        } else if (currentTheme === "AUTUMN") {
          for(let i=0; i<35; i++) particles.push(new GinkgoLeaf(w, h));
        } else { // WINTER
          for(let i=0; i<100; i++) particles.push(new DaySnow(w, h));
        }
      }
      
      if (startOffscreen) {
        particles.forEach(p => {
          if (p.vy < 0) {
            // Lanterns float up, so spawn them just below the content or viewport
            let spawnY = h + 20;
            const contentContainer = document.getElementById('content-bounds');
            if (contentContainer) {
              const cb = contentContainer.getBoundingClientRect().bottom;
              if (cb > 0 && cb < h) {
                spawnY = cb + 30;
              }
            }
            p.y = spawnY + Math.random() * (h / 2);
          } else {
            // Everything else falls down, so spawn them above the screen
            p.y = -20 - Math.random() * (h / 2);
          }
        });
      }
      
      particles.sort((a, b) => a.depth - b.depth);
    }

    function animate() {
      if (!isActive) return;
      
      // Interpolate alpha for smooth hardware-accelerated fade
      if (currentAlpha < targetAlpha) {
        currentAlpha = Math.min(1.0, currentAlpha + 0.015); // ~1s fade in
      } else if (currentAlpha > targetAlpha) {
        currentAlpha = Math.max(0.0, currentAlpha - 0.015); // ~1s fade out
      }

      if (currentAlpha <= 0.01 && targetAlpha === 0.0) {
        if (isFadingOutState) {
          isFadingOutState = false;
          window.dispatchEvent(new CustomEvent("canvas-faded-out"));
        }
        if (animId) cancelAnimationFrame(animId);
        isActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      } else if (targetAlpha === 0 && currentAlpha === 0) {
        // Fully faded out (e.g. stop action), stop the loop
        isActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = currentAlpha;

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      animId = requestAnimationFrame(animate);
    }

    let lastIsDark = null;
    let isInitialLoad = true;
    
    function checkTheme() {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.classList.contains("focus-mode") ||
        document.documentElement.classList.contains("black-text");

      if (!isActive) {
        isActive = true;
        if (isDark !== lastIsDark || particles.length === 0) {
          lastIsDark = isDark;
          resize();
          
          if (isInitialLoad) {
            initParticles(true); // Spawn off-screen
            currentAlpha = 0.0;
            targetAlpha = 0.0;
            isInitialLoad = false;
            
            setTimeout(() => {
              if (getSetting(SETTINGS_KEYS.DISABLE_PARTICLES, false)) return;
              targetAlpha = 1.0;
              if (!isActive) {
                isActive = true;
                if (animId) cancelAnimationFrame(animId);
                animate();
              }
            }, 1000);
          } else {
            // Initialize particles visibly on screen so the user doesn't wait
            initParticles(false);
          }
        }
        if (animId) cancelAnimationFrame(animId);
        animate();
      } else if (isDark !== lastIsDark) {
        lastIsDark = isDark;
        // The DOM changed themes. We only re-init if we are fully faded out and told to fade in.
        // Re-init is now handled directly by the fade_in event handler!
      }
    }

    // Watch for theme class changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("resize", () => {
      const oldW = canvas.width;
      const oldH = canvas.height;
      resize();
      
      const scaleX = oldW > 0 ? canvas.width / oldW : 1;
      const scaleY = oldH > 0 ? canvas.height / oldH : 1;
      
      if (isActive) {
        particles.forEach((p) => {
          p.w = canvas.width;
          p.h = canvas.height;
          p.x = p.x * scaleX;
          p.y = p.y * scaleY;
        });
      }
    });

    const handleControl = (e) => {
      const { action } = e.detail;
      if (action === "stop") {
        targetAlpha = 0.0;
      } else if (action === "normal") {
        targetAlpha = 1.0;
        if (!isActive) {
          isActive = true;
          checkTheme();
        }
      } else if (action === "fade_out") {
        if (!isActive || currentAlpha === 0) {
          window.dispatchEvent(new CustomEvent("canvas-faded-out"));
        } else {
          isFadingOutState = true;
          targetAlpha = 0.0;
        }
      } else if (action === "fade_in") {
        isFadingOutState = false;
        if (getSetting(SETTINGS_KEYS.DISABLE_PARTICLES, false)) return;
        initParticles(false); // Spawn them instantly!
        targetAlpha = 1.0;
        if (!isActive) {
          isActive = true;
          animate();
        }
      } else if (action === "reset") {
        checkTheme();
      }
    };
    window.addEventListener("sakura-control", handleControl);

    resize();
    checkTheme();

    return () => {
      isActive = false;
      if (animId) cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("sakura-control", handleControl);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "1440px",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
      aria-hidden="true"
    />
  );
});

export default DynamicSeasonalAnimation;
