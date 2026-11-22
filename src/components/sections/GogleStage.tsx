"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Float, Lightformer, RoundedBox, Trail } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, type ChromaticAberrationEffect } from "postprocessing";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useLoading } from "@/components/providers/LoadingProvider";
import * as THREE from "three";

/**
 * "Gogle", the studio mascot, as a live 3D scene: a glossy lime robot whose goggle eyes follow
 * the cursor, blink, squint happily and spin when clicked, surrounded by floating props for what
 * the studio builds (a browser window, a cursor, a chat bubble, a growing chart). Built from
 * primitives (no model or HDR downloads), so it costs one JS chunk and no network requests.
 */

const LIME = "#c4f042";
/** Over-bright lime (values above 1): only these pixels cross the bloom threshold and glow. */
const HOT = new THREE.Color(LIME).multiplyScalar(2.4);
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** DOM elements Gogle docks into, in scroll order. Each section renders an empty positioned div
 *  with one of these ids; the stage reads its box every frame. */
const SLOT_IDS = ["gogle-slot-hero", "gogle-slot-statement", "gogle-slot-process"];
const { damp, clamp } = THREE.MathUtils;
const easeOutBack = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

type Pointer = RefObject<{ x: number; y: number }>;
type Shared = RefObject<{ burst: number; happy: number }>;
type Flight = RefObject<{ arc: number; dir: number; sx: number; sy: number }>;

/** Raw cursor position in client pixels; the robot works out its own look direction from it. */
function usePointer() {
  const p = useRef({ x: 0, y: 0 });
  useEffect(() => {
    p.current.x = window.innerWidth * 0.25;
    p.current.y = window.innerHeight * 0.45;
    const on = (e: PointerEvent) => {
      p.current.x = e.clientX;
      p.current.y = e.clientY;
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);
  return p;
}

function Robot({ pointer, sharedRef, flightRef, play, reduced }: { pointer: Pointer; sharedRef: Shared; flightRef: Flight; play: boolean; reduced: boolean }) {
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
    const fl = flightRef.current!;
    // Look direction: cursor relative to where the robot currently is on screen
    const px = clamp((pointer.current!.x - fl.sx) / (state.size.width / 2), -1.2, 1.2);
    const py = clamp(-(pointer.current!.y - fl.sy) / (state.size.height / 2), -1.2, 1.2);

    // Entrance: drop in from above with an overshoot once the preloader lifts
    if (play && st.intro < 1) st.intro = Math.min(1, st.intro + dt / 1.3);
    const k = easeOutBack(st.intro);
    root.current.position.y = (1 - k) * 5 + (reduced ? 0 : Math.sin(t * 1.4) * 0.07);
    root.current.scale.setScalar(Math.max(0.001, easeOutCubic(st.intro)));

    // Click: one full spin plus a happy squint that fades out
    st.spin = damp(st.spin, st.spinTarget, 4, dt);
    sh.happy = damp(sh.happy, 0, 1.6, dt);
    sh.burst = damp(sh.burst, 0, 2.2, dt);

    // Look at the cursor: head leads, body follows at half strength; scrolling tips it back
    // mid-flight it looks where it is going
    const lookY = reduced ? -0.25 : px * 0.65 * (1 - fl.arc) + fl.dir * fl.arc * 0.9;
    const lookX = reduced ? 0.05 : -py * 0.35;
    head.current.rotation.y = damp(head.current.rotation.y, lookY, 5, dt);
    head.current.rotation.x = damp(head.current.rotation.x, lookX, 5, dt);
    head.current.rotation.z = damp(head.current.rotation.z, reduced ? 0 : -px * 0.08 + Math.sin(t * 0.7) * 0.03, 3, dt);
    body.current.rotation.y = damp(body.current.rotation.y, lookY * 0.4, 3, dt);
    root.current.rotation.y = st.spin + (1 - k) * -1.2;

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
    eyes.current.scale.y = Math.max(0.08, st.blink * (1 - 0.65 * Math.max(sh.happy, fl.arc)));

    // Antenna wobble + pulsing tip
    antenna.current.rotation.z = Math.sin(t * 2.2) * 0.12 + (st.spinTarget - st.spin) * 0.08;
    const pulse = 0.55 + 0.45 * Math.sin(t * 3);
    tip.current.color.set(LIME).multiplyScalar(1.4 + pulse * 1.6 + sh.happy * 3 + fl.arc * 3);
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
                  <meshBasicMaterial color={HOT} toneMapped={false} />
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
              <meshBasicMaterial color={HOT} toneMapped={false} />
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
            <meshBasicMaterial ref={tip} color={HOT} toneMapped={false} />
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
          <meshBasicMaterial color={HOT} toneMapped={false} />
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
    const nx = (pointer.current!.x / state.size.width) * 2 - 1;
    const ny = 1 - (pointer.current!.y / state.size.height) * 2;
    const px = reduced ? 0 : nx * 0.25 * depth;
    const py = reduced ? 0 : ny * 0.18 * depth;
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
        <meshBasicMaterial color={HOT} toneMapped={false} />
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
          <meshBasicMaterial color={HOT} toneMapped={false} />
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
      <meshBasicMaterial color={HOT} toneMapped={false} />
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
          <meshBasicMaterial color={HOT} transparent opacity={0.55} toneMapped={false} />
        </mesh>
        <mesh position={[2.35, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color={HOT} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function F({ children, speed = 1.6, reduced }: { children: React.ReactNode; speed?: number; reduced: boolean }) {
  return reduced ? <>{children}</> : <Float speed={speed} rotationIntensity={0.6} floatIntensity={0.9}>{children}</Float>;
}

type Placement = { x: number; y: number; s: number };

/** Where a slot sits in world space (z = 0 plane) and how big the robot should be inside it. */
function place(r: DOMRect, vw: number, vh: number, halfW: number, halfH: number, clampY: boolean): Placement {
  const cx = r.left + r.width / 2;
  let cy = r.top + r.height / 2;
  if (clampY) cy = clamp(cy, vh * 0.38, vh * 0.62);
  const fit = clamp(r.width / r.height / 1.3, 0.6, 1);
  return { x: (cx / vw) * 2 * halfW - halfW, y: halfH - (cy / vh) * 2 * halfH, s: (r.height / vh) * fit * 1.12 };
}

function Scene({ play, reduced }: { play: boolean; reduced: boolean }) {
  const { camera } = useThree();
  const pointer = usePointer();
  const sharedRef = useRef({ burst: 0, happy: 0 });
  const flightRef = useRef({ arc: 0, dir: 1, sx: 0, sy: 0 });
  const flyer = useRef<THREE.Group>(null!);
  const propsG = useRef<THREE.Group>(null!);
  const caRef = useRef<ChromaticAberrationEffect>(null);
  const last = useRef(new THREE.Vector3());
  const speed = useRef(0);
  const caOffset = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame((state, dt) => {
    const vw = state.size.width;
    const vh = state.size.height;
    const halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2));
    const halfW = (halfH * vw) / vh;

    // Slots that are actually laid out (a slot hidden on mobile has no box and is skipped)
    const rects: DOMRect[] = [];
    for (const id of reduced ? SLOT_IDS.slice(0, 1) : SLOT_IDS) {
      const el = document.getElementById(id);
      const r = el?.getBoundingClientRect();
      if (r && r.width > 0 && r.height > 0) rects.push(r);
    }
    if (!rects.length) return;

    // Flight progress: a hop to the next slot starts as its box enters the bottom of the screen and
    // lands when it reaches the upper third. While parked, the robot simply rides along with its slot.
    let i0 = 0;
    let i1 = 0;
    let t = 0;
    for (let i = 1; i < rects.length; i++) {
      const p = clamp((vh * 0.95 - rects[i].top) / (vh * 0.6), 0, 1);
      if (p > 0) {
        i0 = i - 1;
        i1 = i;
        t = p;
      }
    }
    const A = place(rects[i0], vw, vh, halfW, halfH, t > 0);
    const B = place(rects[i1], vw, vh, halfW, halfH, false);
    const e = easeInOutCubic(t);
    const arc = Math.sin(Math.PI * t);
    const dir = Math.sign(B.x - A.x) || 1;

    const g = flyer.current;
    g.position.set(
      THREE.MathUtils.lerp(A.x, B.x, e),
      THREE.MathUtils.lerp(A.y, B.y, e) + arc * 0.5,
      arc * 1.4, // swoops toward the camera mid-flight
    );
    g.scale.setScalar(THREE.MathUtils.lerp(A.s, B.s, e) * (1 - arc * 0.22));
    g.rotation.set(-arc * 0.25, arc * dir * 0.5, -dir * e * Math.PI * 2 * (t < 1 ? 1 : 0));

    const fl = flightRef.current;
    fl.arc = arc;
    fl.dir = dir;
    fl.sx = ((g.position.x + halfW) / (2 * halfW)) * vw;
    fl.sy = ((halfH - g.position.y) / (2 * halfH)) * vh;

    // Props live in the hero: they ride with the hero slot and scatter away on the first hop
    const hero = place(rects[0], vw, vh, halfW, halfH, false);
    const leaving = i1 === 0 ? 0 : i1 === 1 ? e : 1;
    propsG.current.position.set(hero.x, hero.y, leaving * 1.5);
    propsG.current.scale.setScalar(Math.max(0.0001, hero.s * (1 + leaving * 0.6)));
    propsG.current.visible = leaving < 0.98;
    propsG.current.children.forEach((c) => {
      c.visible = leaving < 0.98;
    });

    // Speed-driven colour split: the faster Gogle moves, the more the image tears
    const moved = last.current.distanceTo(g.position) / Math.max(dt, 1 / 120);
    last.current.copy(g.position);
    speed.current = damp(speed.current, Math.min(moved, 20), 6, dt);
    if (caRef.current) {
      const k = reduced ? 0 : Math.min(0.006, speed.current * 0.0004);
      caOffset.set(k, k * 0.6);
      caRef.current.offset = caOffset;
    }
  });

  const common = { sharedRef, pointer, play, reduced };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <directionalLight position={[-5, 2, -3]} intensity={1.2} color={LIME} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="ring" intensity={2} color={LIME} position={[5, 0, -2]} scale={3} />
        <Lightformer form="rect" intensity={0.6} position={[0, -4, 1]} scale={[8, 1, 1]} />
      </Environment>

      {/* Props stay behind in the hero */}
      <group ref={propsG}>
        <group position={[0, 0.2, 0]} scale={1.12}>
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
      </group>

      {/* Gogle himself: docks into each slot and flies between them */}
      <group ref={flyer}>
        <group position={[0, 0.2, 0]} scale={1.12}>
          <OrbitRing reduced={reduced} />
          <Robot {...common} flightRef={flightRef} />
          {/* Jet trails from the ear lights — they streak whenever Gogle moves */}
          {!reduced &&
            [-1.35, 1.35].map((x) => (
              <Trail key={x} width={1.4} length={5} color={HOT} attenuation={(w) => w * w} decay={1.4}>
                <mesh position={[x, 0.3, 0]}>
                  <sphereGeometry args={[0.001, 4, 4]} />
                  <meshBasicMaterial transparent opacity={0} />
                </mesh>
              </Trail>
            ))}
        </group>
      </group>

      {!reduced && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.15} luminanceThreshold={1} luminanceSmoothing={0.2} radius={0.75} />
          <ChromaticAberration ref={caRef} blendFunction={BlendFunction.NORMAL} offset={caOffset} radialModulation={false} modulationOffset={0} />
        </EffectComposer>
      )}
    </>
  );
}

/** Re-render on scroll/resize when the frame loop is idle (reduced motion), so the robot
 *  still tracks its slot without running a continuous animation. */
function DemandOnScroll() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const on = () => invalidate();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [invalidate]);
  return null;
}

/**
 * Full-screen, click-through WebGL layer that sits above the page sections. Events are read from
 * the document (eventSource), so the page underneath stays fully interactive while Gogle can still
 * be clicked. Rendering stops once the last slot has scrolled away.
 */
export default function GogleStage() {
  const { isLoading } = useLoading();
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const check = () => {
      const lastSlot = [...SLOT_IDS].reverse().map((id) => document.getElementById(id)).find((el) => el && el.getBoundingClientRect().height > 0);
      setActive(!lastSlot || lastSlot.getBoundingClientRect().bottom > -window.innerHeight * 0.3);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500"
      style={{ opacity: active ? 1 : 0 }}
    >
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 10], fov: 36 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        eventSource={document.body}
        eventPrefix="client"
        frameloop={!active ? "never" : reduced ? "demand" : "always"}
        fallback={null}
      >
        {reduced && <DemandOnScroll />}
        <Scene play={!isLoading} reduced={reduced} />
      </Canvas>
    </div>
  );
}
