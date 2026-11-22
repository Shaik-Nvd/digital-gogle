"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, RoundedBox } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

/**
 * "Gogle", the studio mascot, as a live 3D scene: a glossy lime robot whose goggle eyes follow
 * the cursor, blink, squint happily and spin when clicked, surrounded by floating props for what
 * the studio builds (a browser window, a cursor, a chat bubble, a growing chart). Built from
 * primitives (no model or HDR downloads), so it costs one JS chunk and no network requests.
 */

const LIME = "#c4f042";
const { damp, clamp } = THREE.MathUtils;
const easeOutBack = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

type Pointer = RefObject<{ x: number; y: number }>;
type Shared = RefObject<{ burst: number; happy: number }>;

/** Cursor position relative to the canvas centre, normalised by the viewport (so the robot
 *  still looks across at the headline when the cursor is over the text column). */
function usePointer(el: RefObject<HTMLDivElement | null>) {
  const p = useRef({ x: -0.4, y: 0.1 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      const r = el.current?.getBoundingClientRect();
      if (!r) return;
      p.current.x = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1.2, 1.2);
      p.current.y = clamp(-(e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2), -1.2, 1.2);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [el]);
  return p;
}

function Robot({ pointer, sharedRef, scroll, play, reduced }: { pointer: Pointer; sharedRef: Shared; scroll?: MotionValue<number>; play: boolean; reduced: boolean }) {
  const root = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const eyes = useRef<THREE.Group>(null!);
  const pupilL = useRef<THREE.Group>(null!);
  const pupilR = useRef<THREE.Group>(null!);
  const antenna = useRef<THREE.Group>(null!);
  const tip = useRef<THREE.MeshBasicMaterial>(null!);
  const visorLight = useRef<THREE.PointLight>(null!);
  const s = useRef({ intro: reduced ? 1 : 0, nextBlink: 2.5, blink: 1, spin: 0, spinTarget: 0 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "";
    return () => void (document.body.style.cursor = "");
  }, [hover]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const st = s.current;
    const sh = sharedRef.current!;
    const px = pointer.current!.x;
    const py = pointer.current!.y;
    const sc = scroll?.get() ?? 0;

    // Entrance: drop in from above with an overshoot once the preloader lifts
    if (play && st.intro < 1) st.intro = Math.min(1, st.intro + dt / 1.3);
    const k = easeOutBack(st.intro);
    root.current.position.y = (1 - k) * 5 + (reduced ? 0 : Math.sin(t * 1.4) * 0.07) + sc * 1.2;
    root.current.scale.setScalar(Math.max(0.001, easeOutCubic(st.intro)) * (1 - sc * 0.25));

    // Click: one full spin plus a happy squint that fades out
    st.spin = damp(st.spin, st.spinTarget, 4, dt);
    sh.happy = damp(sh.happy, 0, 1.6, dt);
    sh.burst = damp(sh.burst, 0, 2.2, dt);

    // Look at the cursor: head leads, body follows at half strength; scrolling tips it back
    const lookY = reduced ? -0.25 : px * 0.65;
    const lookX = reduced ? 0.05 : -py * 0.35;
    head.current.rotation.y = damp(head.current.rotation.y, lookY, 5, dt);
    head.current.rotation.x = damp(head.current.rotation.x, lookX + sc * 0.5, 5, dt);
    head.current.rotation.z = damp(head.current.rotation.z, reduced ? 0 : -px * 0.08 + Math.sin(t * 0.7) * 0.03, 3, dt);
    body.current.rotation.y = damp(body.current.rotation.y, lookY * 0.4, 3, dt);
    root.current.rotation.y = st.spin + (1 - k) * -1.2 + sc * 0.8;

    // Pupils drift inside the lenses
    const ox = clamp(px, -1, 1) * 0.09;
    const oy = clamp(py, -1, 1) * 0.07;
    pupilL.current.position.set(ox, oy, 0);
    pupilR.current.position.set(ox, oy, 0);

    // Blink every few seconds (a quick double now and then)
    if (!reduced && t > st.nextBlink) {
      st.blink = 0;
      st.nextBlink = t + (Math.random() < 0.2 ? 0.25 : 2.5 + Math.random() * 3);
    }
    st.blink = damp(st.blink, 1, 18, dt);
    eyes.current.scale.y = Math.max(0.08, st.blink * (1 - 0.65 * sh.happy));

    // Antenna wobble + pulsing tip
    antenna.current.rotation.z = Math.sin(t * 2.2) * 0.12 + (st.spinTarget - st.spin) * 0.08;
    const pulse = 0.55 + 0.45 * Math.sin(t * 3);
    tip.current.color.set(LIME).multiplyScalar(0.7 + pulse * 0.6 + sh.happy);
    visorLight.current.intensity = 1.4 + pulse * 0.6 + sh.happy * 4;
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    s.current.spinTarget += Math.PI * 2;
    sharedRef.current!.happy = 1;
    sharedRef.current!.burst = 1;
  };

  return (
    <group
      ref={root}
      onClick={onClick}
      onPointerOver={(e) => (e.stopPropagation(), setHover(true))}
      onPointerOut={() => setHover(false)}
    >
      <group ref={body} position={[0, -1.32, 0]}>
        {/* neck */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.3, 0.38, 0.5, 32]} />
          <meshStandardMaterial color="#1b1e23" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* torso */}
        <RoundedBox args={[1.7, 1.05, 1.15]} radius={0.42} smoothness={6} position={[0, 0, 0]}>
          <meshPhysicalMaterial color={LIME} roughness={0.28} clearcoat={1} clearcoatRoughness={0.12} />
        </RoundedBox>
        {/* chest screen with a live bar meter */}
        <RoundedBox args={[0.95, 0.5, 0.1]} radius={0.08} smoothness={4} position={[0, 0.02, 0.56]}>
          <meshPhysicalMaterial color="#0b0d10" roughness={0.1} clearcoat={1} />
        </RoundedBox>
        <ChestBars />
      </group>

      <group ref={head} position={[0, 0.25, 0]}>
        {/* head shell */}
        <RoundedBox args={[2.3, 1.75, 1.65]} radius={0.55} smoothness={8}>
          <meshPhysicalMaterial color={LIME} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} sheen={0.4} sheenColor="#ffffff" />
        </RoundedBox>
        {/* goggle strap wrapping the head */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} scale={[1.2, 1, 1]}>
          <torusGeometry args={[0.96, 0.1, 16, 64]} />
          <meshStandardMaterial color="#15171b" roughness={0.65} />
        </mesh>
        {/* visor */}
        <RoundedBox args={[1.85, 1.05, 0.3]} radius={0.28} smoothness={6} position={[0, 0.05, 0.72]}>
          <meshPhysicalMaterial color="#07080a" roughness={0.06} metalness={0.3} clearcoat={1} clearcoatRoughness={0.03} />
        </RoundedBox>
        <pointLight ref={visorLight} position={[0, -0.75, 1.5]} color={LIME} distance={2.6} intensity={2} />

        {/* goggles: chrome rims, glowing lenses, pupils that track the cursor */}
        <group ref={eyes} position={[0, 0.07, 0.9]}>
          {[-0.45, 0.45].map((x, i) => (
            <group key={x} position={[x, 0, 0]}>
              <mesh>
                <torusGeometry args={[0.3, 0.07, 20, 48]} />
                <meshStandardMaterial color="#e6e9ee" metalness={1} roughness={0.12} />
              </mesh>
              <mesh position={[0, 0, -0.02]}>
                <circleGeometry args={[0.28, 48]} />
                <meshBasicMaterial color="#1a2408" />
              </mesh>
              <group ref={i === 0 ? pupilL : pupilR}>
                <mesh position={[0, 0, 0.01]}>
                  <circleGeometry args={[0.15, 40]} />
                  <meshBasicMaterial color={LIME} toneMapped={false} />
                </mesh>
                <mesh position={[0.05, 0.05, 0.02]}>
                  <circleGeometry args={[0.045, 24]} />
                  <meshBasicMaterial color="#ffffff" toneMapped={false} />
                </mesh>
              </group>
            </group>
          ))}
          {/* bridge */}
          <mesh position={[0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.3, 12]} />
            <meshStandardMaterial color="#e6e9ee" metalness={1} roughness={0.15} />
          </mesh>
        </group>

        {/* ears */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 1.2, 0.05, 0]} rotation={[0, 0, (side * Math.PI) / 2]}>
            <mesh>
              <cylinderGeometry args={[0.3, 0.3, 0.16, 32]} />
              <meshStandardMaterial color="#1b1e23" roughness={0.4} metalness={0.5} />
            </mesh>
            <mesh position={[0, side * -0.09, 0]}>
              <torusGeometry args={[0.18, 0.04, 12, 32]} />
              <meshBasicMaterial color={LIME} toneMapped={false} />
            </mesh>
          </group>
        ))}

        {/* antenna */}
        <group ref={antenna} position={[0.35, 0.85, 0]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.035, 0.05, 0.6, 12]} />
            <meshStandardMaterial color="#1b1e23" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.66, 0]}>
            <sphereGeometry args={[0.13, 24, 24]} />
            <meshBasicMaterial ref={tip} color={LIME} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function ChestBars() {
  const bars = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    bars.current.children.forEach((b, i) => {
      b.scale.y = 0.35 + 0.65 * Math.abs(Math.sin(clock.elapsedTime * (1.6 + i * 0.35) + i));
    });
  });
  return (
    <group ref={bars} position={[-0.3, -0.13, 0.62]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[i * 0.15, 0.14, 0]}>
          <boxGeometry args={[0.08, 0.28, 0.02]} />
          <meshBasicMaterial color={LIME} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Floating props ─────────────────────────────────────────────────────────── */

function Orbiting({ base, sharedRef, pointer, depth = 1, children, delay = 0, play, reduced }: { base: [number, number, number]; sharedRef: Shared; pointer: Pointer; depth?: number; children: React.ReactNode; delay?: number; play: boolean; reduced: boolean }) {
  const g = useRef<THREE.Group>(null!);
  const intro = useRef(reduced ? 1 : 0);
  const startAt = useRef<number | null>(null);
  useFrame((state, dt) => {
    if (play && startAt.current === null) startAt.current = state.clock.elapsedTime + delay;
    if (startAt.current !== null && state.clock.elapsedTime > startAt.current) intro.current = Math.min(1, intro.current + dt / 0.9);
    const burst = sharedRef.current!.burst;
    const push = 1 + burst * 0.45;
    const px = reduced ? 0 : pointer.current!.x * 0.25 * depth;
    const py = reduced ? 0 : pointer.current!.y * 0.18 * depth;
    g.current.position.set(base[0] * push + px, base[1] * push + py, base[2]);
    g.current.scale.setScalar(Math.max(0.001, easeOutBack(intro.current)));
    g.current.rotation.z = burst * Math.sin(base[0] * 3) * 1.2;
  });
  return <group ref={g}>{children}</group>;
}

function CursorProp() {
  const geo = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(0, -1);
    sh.lineTo(0.27, -0.75);
    sh.lineTo(0.46, -1.13);
    sh.lineTo(0.62, -1.05);
    sh.lineTo(0.43, -0.68);
    sh.lineTo(0.78, -0.68);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.045, bevelSegments: 5 });
    g.center();
    return g;
  }, []);
  return (
    <mesh geometry={geo} rotation={[0.2, -0.4, 0.35]} scale={0.62}>
      <meshPhysicalMaterial color="#f4f5f2" roughness={0.18} clearcoat={1} />
    </mesh>
  );
}

function BrowserProp() {
  return (
    <group rotation={[0.1, -0.45, 0.06]} scale={0.78}>
      <RoundedBox args={[1.75, 1.2, 0.12]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial color="#f4f5f2" roughness={0.25} clearcoat={1} />
      </RoundedBox>
      <RoundedBox args={[1.75, 0.22, 0.13]} radius={0.06} smoothness={3} position={[0, 0.49, 0.005]}>
        <meshStandardMaterial color="#121418" roughness={0.4} />
      </RoundedBox>
      {["#ff5f57", "#febc2e", LIME].map((c, i) => (
        <mesh key={c} position={[-0.7 + i * 0.13, 0.49, 0.08]}>
          <circleGeometry args={[0.04, 16]} />
          <meshBasicMaterial color={c} toneMapped={false} />
        </mesh>
      ))}
      {[0.6, 0.85, 0.45].map((w, i) => (
        <mesh key={i} position={[-0.72 + w / 2, 0.15 - i * 0.2, 0.07]}>
          <planeGeometry args={[w, 0.09]} />
          <meshBasicMaterial color={i === 0 ? "#121418" : "#c8ccc4"} />
        </mesh>
      ))}
      <RoundedBox args={[0.5, 0.18, 0.05]} radius={0.06} smoothness={3} position={[-0.47, -0.42, 0.08]}>
        <meshBasicMaterial color={LIME} toneMapped={false} />
      </RoundedBox>
    </group>
  );
}

function ChatProp() {
  return (
    <group rotation={[0.15, 0.4, -0.08]} scale={0.8}>
      <RoundedBox args={[1.15, 0.72, 0.3]} radius={0.28} smoothness={6}>
        <meshPhysicalMaterial color="#14161a" roughness={0.2} clearcoat={1} />
      </RoundedBox>
      <mesh position={[-0.3, -0.42, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.14, 0.3, 4]} />
        <meshPhysicalMaterial color="#14161a" roughness={0.2} clearcoat={1} />
      </mesh>
      {[-0.27, 0, 0.27].map((x) => (
        <mesh key={x} position={[x, 0, 0.16]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color={LIME} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function ChartProp() {
  const g = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    g.current.children.forEach((b, i) => {
      const h = 0.45 + i * 0.35 + Math.sin(clock.elapsedTime * 1.3 + i) * 0.12;
      b.scale.y = h;
      b.position.y = h / 2;
    });
  });
  return (
    <group rotation={[0.25, -0.6, 0]} scale={0.75} position={[0, -0.5, 0]}>
      <group ref={g}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.36, 0, 0]}>
            <boxGeometry args={[0.26, 1, 0.26]} />
            <meshPhysicalMaterial color={i === 2 ? LIME : "#f4f5f2"} roughness={0.25} clearcoat={1} />
          </mesh>
        ))}
      </group>
      <RoundedBox args={[1.25, 0.08, 0.55]} radius={0.03} smoothness={2} position={[0, -0.04, 0]}>
        <meshStandardMaterial color="#121418" roughness={0.5} />
      </RoundedBox>
    </group>
  );
}

function Sparkle({ position, scale = 0.12 }: { position: [number, number, number]; scale?: number }) {
  const m = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    m.current.rotation.y = clock.elapsedTime * 1.2;
    m.current.scale.setScalar(scale * (0.75 + 0.25 * Math.sin(clock.elapsedTime * 2 + position[0])));
  });
  return (
    <mesh ref={m} position={position}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={LIME} toneMapped={false} />
    </mesh>
  );
}

function OrbitRing({ reduced }: { reduced: boolean }) {
  const r = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (!reduced) r.current.rotation.z += dt * 0.25;
  });
  return (
    <group rotation={[1.25, 0.1, 0]} position={[0, -0.35, 0]}>
      <group ref={r}>
        <mesh>
          <torusGeometry args={[2.35, 0.012, 8, 160]} />
          <meshBasicMaterial color={LIME} transparent opacity={0.55} toneMapped={false} />
        </mesh>
        <mesh position={[2.35, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color={LIME} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function F({ children, speed = 1.6, reduced }: { children: React.ReactNode; speed?: number; reduced: boolean }) {
  return reduced ? <>{children}</> : <Float speed={speed} rotationIntensity={0.6} floatIntensity={0.9}>{children}</Float>;
}

/** Fit the scene to the canvas: shrink on narrow (portrait) canvases so the props stay in frame. */
function Rig({ children }: { children: React.ReactNode }) {
  const { size } = useThree();
  const aspect = size.width / size.height;
  const fit = clamp(aspect / 1.3, 0.6, 1);
  return <group scale={fit}>{children}</group>;
}

function Scene({ pointer, scroll, play, reduced }: { pointer: Pointer; scroll?: MotionValue<number>; play: boolean; reduced: boolean }) {
  const sharedRef = useRef({ burst: 0, happy: 0 });
  const common = { sharedRef, pointer, play, reduced };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} castShadow={false} />
      <directionalLight position={[-5, 2, -3]} intensity={1.2} color={LIME} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="ring" intensity={2} color={LIME} position={[5, 0, -2]} scale={3} />
        <Lightformer form="rect" intensity={0.6} position={[0, -4, 1]} scale={[8, 1, 1]} />
      </Environment>

      <Rig>
        <group position={[0, 0.2, 0]} scale={1.12}>
          <OrbitRing reduced={reduced} />
          <Robot {...common} scroll={scroll} />

          <Orbiting {...common} base={[2.2, 1.2, -0.4]} depth={1.2} delay={0.35}>
            <F reduced={reduced} speed={1.4}><BrowserProp /></F>
          </Orbiting>
          <Orbiting {...common} base={[-2.2, 1.3, 0.4]} depth={1.6} delay={0.5}>
            <F reduced={reduced} speed={2}><CursorProp /></F>
          </Orbiting>
          <Orbiting {...common} base={[-2.15, -1.0, 0.3]} depth={1.3} delay={0.65}>
            <F reduced={reduced} speed={1.7}><ChatProp /></F>
          </Orbiting>
          <Orbiting {...common} base={[2.15, -1.05, 0.5]} depth={1.5} delay={0.8}>
            <F reduced={reduced} speed={1.5}><ChartProp /></F>
          </Orbiting>

          <Sparkle position={[-1.2, 1.9, -0.5]} />
          <Sparkle position={[1.45, 2.0, 0.3]} scale={0.09} />
          <Sparkle position={[-1.6, -1.95, 0.6]} scale={0.08} />
          <Sparkle position={[1.3, -2.1, -0.3]} scale={0.1} />
        </group>

        <ContactShadows position={[0, -2.5, 0]} opacity={0.45} scale={9} blur={2.6} far={3} color="#000000" />
      </Rig>
    </>
  );
}

export default function GogleBot({ scroll, play, reduced }: { scroll?: MotionValue<number>; play: boolean; reduced: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = usePointer(wrap);
  const [visible, setVisible] = useState(true);

  // Stop rendering entirely once the hero is scrolled out of view
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" role="img" aria-label="Gogle, the Digital Gogle Studio robot, looking around">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.2, 8.6], fov: 36 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={visible && !reduced ? "always" : "demand"}
        fallback={null}
      >
        <Scene pointer={pointer} scroll={scroll} play={play} reduced={reduced} />
      </Canvas>
    </div>
  );
}
