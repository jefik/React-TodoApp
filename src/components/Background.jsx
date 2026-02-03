import { useEffect, useRef } from "react";
import * as THREE from "three";
import CLOUDS2 from "vanta/dist/vanta.clouds2.min";

export default function Background() {
  const vantaRef = useRef(null);
  const effectRef = useRef(null);

  useEffect(() => {
    if (!effectRef.current) {
      effectRef.current = CLOUDS2({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        skyColor: 0xfafafa,
        cloudColor: 0xbd8ac5,
        lightColor: 0xd7d7d7,
        speed: 0.8,
        texturePath: "/images/noise.png",
      });
    }

    return () => {
      if (effectRef.current) {
        effectRef.current.destroy();
        effectRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className="cloud-overlay"
      ref={vantaRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
      }}
    />
  );
}
