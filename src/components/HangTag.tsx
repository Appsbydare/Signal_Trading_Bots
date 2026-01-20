"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HangTag() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after component mounts
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    return (
        <div className="absolute top-0 right-1/2 translate-x-1/2 pointer-events-none" style={{ zIndex: -1, width: '240px', height: '400px' }}>
            {/* Hang Tag with Animation - positioned so rope starts at button bottom */}
            <Link href="/payment?plan=starter">
                <div
                    className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'} cursor-pointer hover:scale-105`}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        animation: isVisible ? 'swing 3s ease-in-out infinite' : 'none',
                        transformOrigin: 'top center',
                        width: '192px',
                        height: '288px',
                        pointerEvents: 'auto'
                    }}
                >
                    <img
                        src="/hang-tag.png"
                        alt="30 Day Free Trial - Click to get started"
                        width="192"
                        height="288"
                        className="drop-shadow-lg transition-all hover:drop-shadow-2xl"
                        style={{
                            width: '192px',
                            height: '288px',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            </Link>

            <style jsx>{`
                @keyframes swing {
                    0%, 100% {
                        transform: translateX(-50%) rotate(-5deg);
                    }
                    50% {
                        transform: translateX(-50%) rotate(5deg);
                    }
                }
            `}</style>
        </div>
    );
}
