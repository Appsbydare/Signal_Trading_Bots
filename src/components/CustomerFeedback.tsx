"use client";
import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";

interface Testimonial {
    id: number;
    name: string;
    country: string;
    flag: string;
    quote: string;
    image: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "John M.",
        country: "Forex Trader (Demo to Live)",
        flag: "",
        quote: "The keyword mapping is genius. Signals come in and the bot instantly executes the trade in MetaTrader5 without me lifting a finger. It's like autopilot for my portfolio.",
        image: "/customerfeedback/1.jpeg"
    },
    {
        id: 2,
        name: "Alicia R.",
        country: "Signal Follower",
        flag: "",
        quote: "Risk management is what sold me. The app makes sure I don't overexpose my account while firing trades automatically. I can finally relax knowing everything is under control.",
        image: "/customerfeedback/2.jpeg"
    },
    {
        id: 3,
        name: "Carlos D.",
        country: "Automated Trading Enthusiast",
        flag: "",
        quote: "Honestly, I just love the simplicity. It runs smoothly in the background while MetaTrader5 stays perfectly synced. Support was a huge help with the initial setup.",
        image: "/customerfeedback/3.jpeg"
    },
    {
        id: 4,
        name: "Eric G.",
        country: "Gold & Indices Specialist",
        flag: "",
        quote: "The auditing is super clear. Every triggered trade is logged so I can review my history anytime. It makes reporting and compliance completely stress-free.",
        image: "/customerfeedback/4.jpeg"
    },
    {
        id: 5,
        name: "David P.",
        country: "Professional Signal Provider",
        flag: "",
        quote: "I love the strategy creation feature. I can customize my own TP and SL rules and they apply automatically to my MetaTrader5 setups. Flexible and very reliable.",
        image: "/customerfeedback/5.jpeg"
    },
    {
        id: 6,
        name: "Thabo Mokoena",
        country: "Scalping Expert",
        flag: "",
        quote: "Support fixed my setup issues quickly, and now everything flows perfectly. Great team and very fast execution. Highly recommended!",
        image: "/customerfeedback/6.jpeg"
    },
    {
        id: 7,
        name: "Omar A.",
        country: "Long-term Swing Trader",
        flag: "",
        quote: "It just works. Everything happens automatically and I don't have to babysit the charts anymore. Smooth, reliable, and very easy to use.",
        image: "/customerfeedback/7.jpeg"
    },
    {
        id: 8,
        name: "Ruwan S.",
        country: "Risk Management Focused",
        flag: "",
        quote: "Spot on balance between automation and control. I run in autopilot mode but can still tweak my strategies when I want. Definitely the best of both worlds.",
        image: "/customerfeedback/8.jpeg"
    }
];

// Double the items for seamless loop
const displayItems = [...testimonials, ...testimonials];

export const CustomerFeedback: React.FC = () => {
    const [index, setIndex] = useState(0);
    const controls = useAnimation();

    // Optimized for 4-card layout (further 15% reduction)
    const gap = 16;
    const cardWidth = 238;

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => prev + 1);
        }, 10000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const updatePosition = async () => {
            const travel = (cardWidth + gap) * index;

            await controls.start({
                x: -travel,
                transition: { duration: 1, ease: "easeInOut" }
            });

            if (index >= testimonials.length) {
                setIndex(0);
                controls.set({ x: 0 });
            }
        };

        updatePosition();
    }, [index, controls]);

    return (
        <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-slate-50 py-10 md:py-12 overflow-hidden border-y border-slate-100/50">
            <div className="relative z-10 mx-auto px-6" style={{ maxWidth: (cardWidth * 4) + (gap * 3) + 48 }}>
                {/* Compact Section Header */}
                <div className="text-center mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight mb-2 uppercase">
                        Traders testing and using the bot
                    </h2>
                    <div className="w-10 h-0.5 bg-blue-600/40 mx-auto rounded-full" />
                </div>

                {/* Carousel Viewport - 4 Cards View */}
                <div className="relative overflow-hidden w-full">
                    <motion.div
                        className="flex"
                        style={{ gap: `${gap}px` }}
                        animate={controls}
                    >
                        {displayItems.map((testimonial, idx) => (
                            <div
                                key={`${testimonial.id}-${idx}`}
                                style={{ width: `${cardWidth}px` }}
                                className="flex-shrink-0"
                            >
                                <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-md group">
                                    {/* Slim Portrait Image */}
                                    <div className="relative h-[240px] overflow-hidden bg-slate-50">
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                            sizes="238px"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                                        {/* Tiny User Info Overlay */}
                                        <div className="absolute bottom-3 left-4 text-white">
                                            <h4 className="font-bold text-sm leading-tight">{testimonial.name}</h4>
                                            <p className="text-[9px] text-blue-200 flex items-center gap-1 mt-0.5 font-medium opacity-90">
                                                {testimonial.country}
                                            </p>
                                        </div>

                                        {/* Removed flag overlay */}
                                    </div>

                                    {/* Tiny Content Area */}
                                    <div className="p-4 flex-grow flex flex-col justify-between">
                                        <div>
                                            <p className="text-slate-600 text-[12px] leading-relaxed italic">
                                                "{testimonial.quote}"
                                            </p>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <svg key={s} className="w-2 h-2 text-amber-400 fill-current" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-[7px] font-bold text-blue-500/80 uppercase tracking-widest">Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Minimal Navigation Dots */}
                <div className="flex justify-center gap-1 mt-6">
                    {testimonials.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setIndex(idx)}
                            className={`h-0.5 transition-all duration-300 rounded-full ${idx === (index % testimonials.length)
                                ? "w-4 bg-blue-600/60"
                                : "w-1 bg-slate-200 hover:bg-slate-300"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
