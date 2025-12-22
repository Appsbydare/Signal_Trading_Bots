"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";

interface HeroTelegramSignalsProps {
  opacity?: number; // Default: 0.35
  className?: string;
}

// Telegram signal texts with variety
const signalTexts = [
  // Gold signals with emojis
  "🔼BUY\n💵GOLD\n📊ENTER IN = 4210- 4206\n\n❌SL = 4205 (50 pips)\n\n😄TP1 = 4212\n😄TP2 = 4230\n😄TP3 = 4250\n😄TP4 = 4300",
  "😄Xauusd SELLZone Now 4078 Limit 4080\n\n✔️TP¹  4073\n✔️TP²  4068\n✔️TP³  4063\n✔️TP⁴  4058\n\n🚫SL   4088",
  "Buy Gold Now\nTP1 – 3202\nTP2 – 3205\nTP3 – 3210\nTP4 – 3300",
  // Forex pairs
  "Buy EURUSD\nTP – 1.1620\nSL – 1.1590",
  "Sell GBPUSD\nTP – 1.2450\nSL – 1.2500",
  "Buy USDJPY\nTP – 150.50\nSL – 149.80",
  "Sell AUDUSD\nTP – 0.6520\nSL – 0.6580",
  "Buy USDCAD\nTP – 1.3650\nSL – 1.3580",
  // Indices
  "Buy NAS100\nTP – 18,500\nSL – 18,200",
  "Sell SPX500\nTP – 5,200\nSL – 5,280",
  "Buy NASDAQ\nTP – 18,600\nSL – 18,300",
  // Crypto
  "Buy BTCUSD 90,150–90,300\nTP1 – 90,900\nTP2 – 92,000\nSL – 90,000",
];

// Paper plane colors - 3 shades of blue/purple (blue-leaning)
const planeColors = [
  "#64B5F6", // Light blue
  "#0088CC", // Telegram blue
  "#5C6BC0", // Indigo (blue-purple)
];

// Paper plane sizes - increased for visibility
const planeSizes = [36, 44, 52];

export function HeroTelegramSignals({
  opacity = 0.35,
  className = "",
}: HeroTelegramSignalsProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeSignals, setActiveSignals] = useState<Array<{
    id: number;
    text: string;
    x: number;
    y: number;
    duration: number;
  }>>([]);
  const [activePlanes, setActivePlanes] = useState<Array<{
    id: number;
    color: string;
    size: number;
    startX: number;
    endY: number;
    duration: number;
    leftKeyframes: string[];
    topKeyframes: string[];
    rotateKeyframes: number[];
  }>>([]);

  // Check if position overlaps with existing signals
  const checkOverlap = (x: number, y: number, existingSignals: typeof activeSignals, minDistance: number = 20) => {
    return existingSignals.some((signal) => {
      const dx = signal.x - x;
      const dy = signal.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < minDistance;
    });
  };

  // Generate random position that doesn't overlap
  const getRandomPosition = (existingSignals: typeof activeSignals) => {
    let attempts = 0;
    let position = { x: 0, y: 0 };
    
    do {
      position = {
        x: Math.random() * 75 + 12.5, // 12.5-87.5% of width (more margin)
        y: Math.random() * 65 + 17.5, // 17.5-82.5% of height (more margin)
      };
      attempts++;
    } while (checkOverlap(position.x, position.y, existingSignals) && attempts < 50);
    
    return position;
  };

  // Spawn new signal watermark
  useEffect(() => {
    if (prefersReducedMotion) return;

    const spawnSignal = () => {
      setActiveSignals((prev) => {
        const position = getRandomPosition(prev);
        const signalId = Date.now() + Math.random();
        const signal = {
          id: signalId,
          text: signalTexts[Math.floor(Math.random() * signalTexts.length)],
          x: position.x,
          y: position.y,
          duration: 4 + Math.random() * 3, // 4-7 seconds
        };
        
        // Remove signal after duration
        setTimeout(() => {
          setActiveSignals((current) => current.filter((s) => s.id !== signalId));
        }, signal.duration * 1000);
        
        return [...prev, signal];
      });
    };

    // Spawn initial signals with delay between them
    const initialDelay1 = setTimeout(() => {
      spawnSignal();
    }, 1000);
    const initialDelay2 = setTimeout(() => {
      spawnSignal();
    }, 3000); // Stagger initial signals

    // Spawn new signals periodically
    const interval = setInterval(() => {
      setActiveSignals((current) => {
        if (current.length >= 3) return current; // Don't spawn if already at max
        const position = getRandomPosition(current);
        const signalId = Date.now() + Math.random();
        const signal = {
          id: signalId,
          text: signalTexts[Math.floor(Math.random() * signalTexts.length)],
          x: position.x,
          y: position.y,
          duration: 4 + Math.random() * 3,
        };
        
        // Remove signal after duration
        setTimeout(() => {
          setActiveSignals((prev) => prev.filter((s) => s.id !== signalId));
        }, signal.duration * 1000);
        
        return [...current, signal];
      });
    }, 6000); // Increased interval to reduce overlap chances

    return () => {
      clearTimeout(initialDelay1);
      clearTimeout(initialDelay2);
      clearInterval(interval);
    };
  }, [prefersReducedMotion, activeSignals.length]);

  // Helper function to generate curved path from top to bottom-right
  // Also calculates rotation based on direction of movement
  const generateCurvePath = (startX: number, endX: number, endY: number) => {
    // Smooth curve from top to bottom/bottom-right
    const midX = startX + (endX - startX) * 0.5 + (Math.random() - 0.5) * 10; // Mid curve with slight variation
    const midY = 35 + Math.random() * 15; // Mid-point vertical (30-50%)
    
    // Position keyframes
    const positions = [
      { x: startX, y: -8 },           // Entry from top
      { x: midX, y: midY },           // Mid curve
      { x: endX, y: endY },           // Exit at bottom-right
    ];
    
    // Calculate rotation angles based on direction between points  
    const rotations = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const dx = positions[i + 1].x - positions[i].x;
      const dy = positions[i + 1].y - positions[i].y;
      // atan2 gives angle in radians, convert to degrees
      // This points the plane nose in the direction of travel
      let angle = (Math.atan2(dy, dx) * 180 / Math.PI);
      rotations.push(angle);
    }
    // Add final rotation (same as last segment)
    rotations.push(rotations[rotations.length - 1]);
    
    return {
      leftKeyframes: positions.map(p => `${p.x}%`),
      topKeyframes: positions.map(p => `${p.y}%`),
      rotateKeyframes: rotations,
    };
  };

  // Spawn paper planes
  useEffect(() => {
    if (prefersReducedMotion) return;

    const spawnPlane = () => {
      setActivePlanes((prev) => {
        // Don't spawn if already at max
        if (prev.length >= 6) return prev;
        
        const planeId = Date.now() + Math.random();
        // Vary speed for natural look (5-9 seconds)
        const duration = 5 + Math.random() * 4;
        
        // Entry: random position across top
        const startX = 10 + Math.random() * 80; // 10-90% across top
        
        // Exit: bottom or bottom-right area
        // Favor right side but allow some variation
        const endX = 60 + Math.random() * 35; // 60-95% (right side)
        const endY = 95 + Math.random() * 10; // 95-105% (beyond bottom edge)
        
        // Generate the path once when creating the plane
        const path = generateCurvePath(startX, endX, endY);
        
        const newPlane = {
          id: planeId,
          color: planeColors[Math.floor(Math.random() * planeColors.length)],
          size: planeSizes[Math.floor(Math.random() * planeSizes.length)],
          startX,
          endY,
          duration,
          leftKeyframes: path.leftKeyframes,
          topKeyframes: path.topKeyframes,
          rotateKeyframes: path.rotateKeyframes,
        };
        
        // Remove plane after duration
        setTimeout(() => {
          setActivePlanes((current) => current.filter((p) => p.id !== planeId));
        }, duration * 1000);
        
        return [...prev, newPlane];
      });
    };

    // Spawn initial batch of planes with staggered delays
    const initialDelays = [500, 1500, 2500].map((delay) =>
      setTimeout(spawnPlane, delay)
    );

    // Spawn new planes periodically
    const interval = setInterval(() => {
      spawnPlane();
    }, 3000 + Math.random() * 2000); // Every 3-5 seconds

    return () => {
      initialDelays.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [prefersReducedMotion]);

  // Generate micro-wobble animation for natural flight
  const generateMicroWobble = () => {
    const wobbleAmplitude = 1.5;
    const wobbleKeyframes = [];
    
    // Generate smooth sine-wave wobble throughout flight
    for (let i = 0; i <= 10; i++) {
      const progress = i / 10;
      const wobble = Math.sin(progress * Math.PI * 6) * wobbleAmplitude;
      wobbleKeyframes.push(wobble);
    }
    
    return wobbleKeyframes;
  };

  // Static version for reduced motion
  if (prefersReducedMotion) {
    return null; // Hide animation for reduced motion
  }

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Telegram Signal Watermarks */}
      <AnimatePresence>
        {activeSignals.map((signal) => (
          <motion.div
            key={signal.id}
            className="absolute"
            style={{
              left: `${signal.x}%`,
              top: `${signal.y}%`,
              transform: "translate(0, -50%)", // Left align instead of center
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: opacity * 1.5, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 1,
              ease: "easeInOut",
            }}
          >
            <div
              className="text-xs font-mono text-gray-500 whitespace-pre-line text-left leading-tight"
              style={{
                textShadow: "0 0 10px rgba(255, 255, 255, 0.7)",
                opacity: opacity * 1.5,
              }}
            >
              {signal.text}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Multiple Paper Plane Animations - Top to Right */}
      <AnimatePresence>
        {activePlanes.map((plane) => {
          return (
            <motion.div
              key={plane.id}
              className="absolute"
              initial={{
                left: plane.leftKeyframes[0],
                top: plane.topKeyframes[0],
                opacity: 0,
              }}
              animate={{
                left: plane.leftKeyframes,
                top: plane.topKeyframes,
                opacity: [
                  0,                    // Entry fade in
                  0.8,                  // Fully visible
                  0,                    // Exit fade out
                ],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: plane.duration,
                times: [0, 0.08, 1.0], // Sync with keyframes count
                ease: "linear", // Constant speed, no stopping
              }}
            >
              {/* Rotation animation - always points in direction of travel */}
              <motion.div
                initial={{ rotate: plane.rotateKeyframes[0] }}
                animate={{
                  rotate: plane.rotateKeyframes,
                }}
                transition={{
                  duration: plane.duration,
                  times: [0, 0.5, 1.0], // Sync with position keyframes
                  ease: "linear", // Smooth consistent rotation
                }}
              >
                {/* Micro-wobble overlay for natural flight */}
                <motion.div
                  animate={{
                    rotate: generateMicroWobble(),
                  }}
                  transition={{
                    duration: plane.duration,
                    ease: "linear",
                  }}
                >
                  {/* Paper Plane SVG */}
                  <svg
                    width={plane.size}
                    height={plane.size}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: `drop-shadow(0 0 5px ${plane.color}80)`,
                    }}
                  >
                    <path
                      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                      fill={plane.color}
                      stroke={plane.color}
                      strokeWidth="0.8"
                    />
                  </svg>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}



