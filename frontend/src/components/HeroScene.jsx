import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Icosahedron, Torus, Sphere, Float, MeshDistortMaterial } from "@react-three/drei";
import { useTheme } from "@/context/ThemeContext";

function Blob({ position, scale, speed, color, opacity = 1, wireframe = false }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.12 * speed;
    ref.current.rotation.y = state.clock.elapsedTime * 0.16 * speed;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.35} floatIntensity={1.2}>
      <Icosahedron ref={ref} args={[1, 1]} position={position} scale={scale}>
        {wireframe ? (
          <meshBasicMaterial color={color} wireframe transparent opacity={opacity} />
        ) : (
          <MeshDistortMaterial color={color} distort={0.35} speed={1.6} roughness={0.35} metalness={0.6} transparent opacity={opacity} />
        )}
      </Icosahedron>
    </Float>
  );
}

function Ring({ position, rotation, color, opacity }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.15;
  });
  return (
    <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.6}>
      <Torus ref={ref} args={[1.7, 0.012, 32, 128]} position={position} rotation={rotation}>
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </Torus>
    </Float>
  );
}

function Dot({ position, scale, color }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + position[0]) * 0.15;
  });
  return (
    <Sphere ref={ref} args={[scale, 16, 16]} position={position}>
      <meshBasicMaterial color={color} />
    </Sphere>
  );
}

function MouseParallax({ children }) {
  const group = useRef();
  const { viewport } = useThree();
  useFrame(({ mouse }) => {
    if (!group.current) return;
    group.current.rotation.y += (mouse.x * 0.25 - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (-mouse.y * 0.15 - group.current.rotation.x) * 0.04;
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const primary = dark ? "#F5F5F3" : "#111111";
  const accent = dark ? "#7C9CFF" : "#2451FF";

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 42 }} dpr={[1, 1.5]} style={{ background: "transparent" }}>
      <ambientLight intensity={dark ? 0.5 : 0.9} />
      <directionalLight position={[5, 5, 5]} intensity={0.9} color={accent} />
      <directionalLight position={[-5, -3, -2]} intensity={0.4} color={primary} />
      <MouseParallax>
        <Blob position={[1.6, 0.6, 0]} scale={1.05} speed={1} color={primary} opacity={0.9} />
        <Blob position={[-1.9, -0.8, -1]} scale={0.4} speed={1.5} color={accent} opacity={0.85} />
        <Ring position={[1.6, 0.6, 0]} rotation={[Math.PI / 2.4, 0, 0]} color={primary} opacity={0.25} />
        <Ring position={[1.6, 0.6, 0]} rotation={[0, Math.PI / 3, Math.PI / 5]} color={accent} opacity={0.2} />
        <Dot position={[-2.6, 1.3, -0.5]} scale={0.05} color={accent} />
        <Dot position={[2.6, -1.4, -0.8]} scale={0.04} color={primary} />
      </MouseParallax>
    </Canvas>
  );
}
