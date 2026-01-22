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
                                <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 p-5 h-full flex flex-col transition-all duration-300 hover:shadow-lg group">
                                    {/* Card Header: Avatar + User Info */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="relative w-12 h-12 flex-shrink-0">
                                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-50 shadow-sm">
                                                <Image
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                />
                                            </div>
                                            {/* Optional Badge on Avatar like in example */}
                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
                                                <svg className="w-3 h-3 text-orange-500 fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-bold text-slate-800 text-sm truncate">{testimonial.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-medium truncate">{testimonial.country}</p>
                                        </div>
                                        <div className="flex-shrink-0 opacity-20 transition-opacity group-hover:opacity-40">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12.48 10.92v3.28h4.69c-.19 1.02-.78 1.88-1.66 2.46l2.6 1.99c2.19-2.02 3.45-5 3.45-8.45 0-.58-.05-1.14-.15-1.68H12.48z" />
                                                <path d="M12.48 24c3.24 0 5.95-1.08 7.93-2.91l-2.6-2.02c-.72.48-1.65.77-2.65.77-2.04 0-3.77-1.38-4.38-3.24H2.43v2.08C4.38 20.44 8.13 24 12.48 24z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Star Rating + Verified Badge */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <svg key={s} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <div className="bg-blue-500 rounded-full p-0.5">
                                            <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 20 20">
                                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Review Text */}
                                    <div className="flex-grow">
                                        <p className="text-slate-600 text-[13px] leading-relaxed">
                                            {testimonial.quote}
                                        </p>
                                    </div>

                                    {/* Footer: Read More */}
                                    <div className="mt-4">
                                        <button className="text-slate-400 font-bold text-xs hover:text-blue-600 transition-colors">
                                            Read more
                                        </button>
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
