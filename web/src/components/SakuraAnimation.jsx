"use client";

import React, { useEffect, useRef, memo } from "react";

const BLOW_ANIMATIONS = ['blow-soft-left', 'blow-medium-left', 'blow-soft-right', 'blow-medium-right'];
const SWAY_ANIMATIONS = ['sway-0', 'sway-1', 'sway-2', 'sway-3', 'sway-4', 'sway-5', 'sway-6', 'sway-7', 'sway-8'];
const FALL_SPEED = 1;
const MAX_SIZE = 14;
const MIN_SIZE = 10;
function randomArrayElem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SakuraAnimation = memo(function SakuraAnimation() {
  const containerRef = useRef(null);

  useEffect(() => {
    let animId;
    let isActive = false;
    let lastTime = Date.now();
    let currentInterval = 3500; // Start very sparse for the cinematic buildup
    let targetInterval = 300;   // Normal speed
    let stopTime = 0;
    
    const handleControl = (e) => {
      const { action } = e.detail;
      if (action === 'stop') {
        targetInterval = Infinity;
        stopTime = Date.now();
      } else if (action === 'normal') {
        targetInterval = 300;
      } else if (action === 'reset') {
        currentInterval = 3500;
        targetInterval = 300;
      }
    };
    window.addEventListener('sakura-control', handleControl);

    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark") || 
                     document.documentElement.classList.contains("focus-mode") ||
                     document.documentElement.classList.contains("black-text");
      
      if (!isDark && !isActive) {
        isActive = true;
        createPetalLoop();
      } else if (isDark && isActive) {
        isActive = false;
        if (animId) cancelAnimationFrame(animId);
        
        // Remove existing petals smoothly
        if (containerRef.current) {
          Array.from(containerRef.current.children).forEach(child => child.remove());
        }
      }
    };

    // Watch for theme class changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const createPetal = () => {
      if (!containerRef.current || !isActive) return;

      const blowAnimation = randomArrayElem(BLOW_ANIMATIONS);
      const swayAnimation = randomArrayElem(SWAY_ANIMATIONS);
      const fallTime = ((document.documentElement.clientHeight * 0.007) + Math.round(Math.random() * 5)) * FALL_SPEED;

      const blowTime = ((fallTime > 30 ? fallTime : 30) - 20) + randomInt(0, 20);
      const swayTime = randomInt(2, 4);

      const animations = `fall ${fallTime}s linear 0s 1, ${blowAnimation} ${blowTime}s linear 0s infinite, ${swayAnimation} ${swayTime}s linear 0s infinite`;

      const petal = document.createElement("div");
      petal.className = "sakura";
      
      const height = randomInt(MIN_SIZE, MAX_SIZE);
      const width = height - Math.floor(randomInt(0, MIN_SIZE) / 3);

      Object.assign(petal.style, {
        animation: animations,
        WebkitAnimation: animations,
        borderRadius: `${randomInt(MAX_SIZE, MAX_SIZE + Math.floor(Math.random() * 10))}px ${randomInt(1, Math.floor(width / 4))}px`,
        height: `${height}px`,
        left: `${Math.random() * document.documentElement.clientWidth - 100}px`,
        marginTop: `${-(Math.floor(Math.random() * 20) + 15)}px`,
        width: `${width}px`,
      });

      // Remove petal when it falls off screen
      const onAnimationEnd = (ev) => {
        if (ev.animationName === "fall") {
          petal.remove();
        }
      };

      petal.addEventListener("animationend", onAnimationEnd);
      containerRef.current.appendChild(petal);
    };

    const createPetalLoop = () => {
      if (!isActive) return;
      const now = Date.now();
      
      if (targetInterval === Infinity) {
         const elapsed = now - stopTime;
         if (elapsed > 5000) {
           currentInterval = Infinity;
         } else {
           currentInterval = 300 + (4700 * (elapsed / 5000));
         }
      } else {
         currentInterval += (targetInterval - currentInterval) * 0.015; // Smoothly approach target (cinematic buildup)
      }

      if (targetInterval === Infinity && currentInterval === Infinity) {
         // Stop spawning petals completely once the 5 seconds are up
      } else if (now - lastTime >= currentInterval) {
        createPetal();
        lastTime = now;
      }
      animId = requestAnimationFrame(createPetalLoop);
    };

    // Initial check
    checkTheme();

    return () => {
      isActive = false;
      if (animId) cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('sakura-control', handleControl);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: -10,
      }}
      aria-hidden="true"
    />
  );
});

export default SakuraAnimation;
