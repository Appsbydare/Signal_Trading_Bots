"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import {
    Environment,
    Lightformer,
    Html,
} from "@react-three/drei";
import {
    BallCollider,
    CuboidCollider,
    Physics,
    RigidBody,
    useRopeJoint,
    useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";

extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({
    position = [0, 0, 12], // Closer camera
    gravity = [0, -40, 0],
    fov = 30, // Wider view
    transparent = true,
}: {
    position?: [number, number, number];
    gravity?: [number, number, number];
    fov?: number;
    transparent?: boolean;
}) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="w-[300px] h-[500px] flex justify-center items-center pointer-events-none overflow-visible">
            <div className="w-full h-full">
                <Canvas
                    camera={{ position: position, fov: fov }}
                    dpr={[1, 2]}
                    gl={{ alpha: transparent }}
                    onCreated={({ gl }) =>
                        gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
                    }
                >
                    <ambientLight intensity={Math.PI} />
                    <Physics gravity={gravity as [number, number, number]} timeStep={1 / 60}>
                        <Band isMobile={isMobile} />
                    </Physics>
                    <Environment blur={0.75}>
                        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                    </Environment>
                </Canvas>
            </div>
        </div>
    );
}

function Band({ isMobile = false }) {
    const band = useRef<any>(null);
    const fixed = useRef<any>(null);
    const j1 = useRef<any>(null);
    const j2 = useRef<any>(null);
    const j3 = useRef<any>(null);
    const card = useRef<any>(null);

    const ang = new THREE.Vector3();
    const rot = new THREE.Vector3();

    const segmentProps = {
        type: "dynamic" as const,
        canSleep: false,
        colliders: false as any,
        angularDamping: 4,
        linearDamping: 2,
    };

    const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));

    const tagShape = useMemo(() => {
        const shape = new THREE.Shape();
        const w = 2.0;
        const h = 2.6;
        const clip = 0.5;
        shape.moveTo(-w / 2, -h / 2);
        shape.lineTo(w / 2, -h / 2);
        shape.lineTo(w / 2, h / 2 - clip);
        shape.lineTo(w / 2 - clip, h / 2);
        shape.lineTo(-w / 2 + clip, h / 2);
        shape.lineTo(-w / 2, h / 2 - clip);
        shape.closePath();

        const hole = new THREE.Path();
        hole.absarc(0, h / 2 - clip / 2 - 0.05, 0.1, 0, Math.PI * 2, true);
        shape.holes.push(hole);

        return shape;
    }, []);

    const extrudeSettings = useMemo(() => ({
        depth: 0.1,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 3
    }), []);

    // Significantly SHORTER rope
    const ropeLen = 0.12;
    useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], ropeLen]);
    useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], ropeLen]);
    useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], ropeLen]);
    useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.25, 0]]);

    useEffect(() => {
        if (card.current) {
            setTimeout(() => {
                card.current.applyImpulse({ x: 0.3, y: 0.5, z: 0.1 }, true);
            }, 1000);
        }
    }, []);

    useFrame((_state, delta) => {
        if (fixed.current && j1.current && j2.current && j3.current && card.current && band.current) {
            try {
                const t0 = j3.current.translation();
                const t1 = j2.current.translation();
                const t2 = j1.current.translation();
                const t3 = fixed.current.translation();

                if (isNaN(t0.x) || isNaN(t1.x) || isNaN(t2.x) || isNaN(t3.x)) return;

                if (!j1.current.lerped) j1.current.lerped = new THREE.Vector3().copy(t2);
                if (!j2.current.lerped) j2.current.lerped = new THREE.Vector3().copy(t1);

                j1.current.lerped.lerp(t2, delta * 20);
                j2.current.lerped.lerp(t1, delta * 20);

                curve.points[0].copy(t0);
                curve.points[1].copy(j2.current.lerped);
                curve.points[2].copy(j1.current.lerped);
                curve.points[3].copy(t3);

                const points = curve.getPoints(isMobile ? 12 : 20);
                band.current.geometry.setPoints(points);

                ang.copy(card.current.angvel());
                rot.copy(card.current.rotation());
                card.current.setAngvel({ x: ang.x * 0.95, y: ang.y - rot.y * 0.4, z: ang.z * 0.95 }, true);
            } catch (e) { }
        }
    });

    curve.curveType = "chordal";

    return (
        <>
            <group position={[0, 2.5, 0]}> {/* Lower point to fit in camera view */}
                <RigidBody ref={fixed} type="fixed" />
                <RigidBody position={[0, 0, 0]} ref={j1} {...segmentProps}><BallCollider args={[0.04]} /></RigidBody>
                <RigidBody position={[0, 0, 0]} ref={j2} {...segmentProps}><BallCollider args={[0.04]} /></RigidBody>
                <RigidBody position={[0, 0, 0]} ref={j3} {...segmentProps}><BallCollider args={[0.04]} /></RigidBody>
                <RigidBody position={[0, 0, 0]} ref={card} {...segmentProps}>
                    <CuboidCollider args={[1.0, 1.3, 0.05]} />
                    <group>
                        <mesh position={[0, 0, -0.05]}>
                            <extrudeGeometry args={[tagShape, extrudeSettings]} />
                            <meshPhysicalMaterial color="#5e17eb" clearcoat={1.0} clearcoatRoughness={0.05} roughness={0.2} metalness={0.1} />

                            <mesh position={[0, 1.0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
                                <torusGeometry args={[0.1, 0.02, 16, 32]} />
                                <meshStandardMaterial color="#c0c0c0" metalness={1} roughness={0.1} />
                            </mesh>

                            <Html
                                position={[0, -0.05, 0.12]}
                                transform
                                occlude="blending"
                                zIndexRange={[100, 0]}
                                style={{
                                    width: "180px",
                                    height: "240px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "transparent",
                                    color: "white",
                                    padding: "25px 15px 10px 15px",
                                    textAlign: "center",
                                    userSelect: "none",
                                    fontFamily: "'Outfit', sans-serif",
                                    pointerEvents: 'none'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.01em', textShadow: '0 2px 4px rgba(0,0,0,0.8)', margin: '0', lineHeight: 1.2, color: '#ffffff' }}>
                                        30 DAYS FREE!
                                    </div>
                                    <div style={{ height: '1.5px', width: '40px', background: 'white', opacity: 0.85 }}></div>
                                    <div style={{ fontSize: '10px', fontWeight: '600', opacity: 1, textShadow: '0 1px 3px rgba(0,0,0,0.8)', lineHeight: '1.4', margin: '0', color: '#ffffff' }}>
                                        $20 Discount<br />on first month
                                    </div>
                                </div>
                            </Html>
                        </mesh>
                    </group>
                </RigidBody>
            </group>
            <mesh ref={band}>
                {/* @ts-ignore */}
                <meshLineGeometry />
                {/* @ts-ignore */}
                <meshLineMaterial color="#8b6d4d" depthTest={false} resolution={[1000, 1000]} lineWidth={0.18} />
            </mesh>
        </>
    );
}
