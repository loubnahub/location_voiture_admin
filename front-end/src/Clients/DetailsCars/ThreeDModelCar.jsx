import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

function SpinningModel({ url, spinning, color }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  // Apply color to all mesh materials
  useEffect(() => {
    if (ref.current && color) {
      ref.current.traverse((child) => {
        if (child.isMesh && child.material && child.material.color) {
          child.material.color.set(color);
        }
      });
    }
  }, [color, scene]); // Added scene to dependencies as GLTF loading is async

  useFrame(() => {
    if (ref.current && spinning) {
      ref.current.rotation.y += 0.005;
    }
  });

  return <primitive ref={ref} object={scene} scale={1.2} />;
}

const ThreeDModelViewer = ({ src, alt = "3D Model", style, color }) => {
  const [spinning, setSpinning] = useState(true);

  if (!src) {
    return (
      <div
        
        className="tw-flex tw-items-center tw-justify-center tw-text-gray-500 three-d-placeholder"
        style={style} // This prop allows external dynamic styling
      >
        {alt} {/* Using alt prop for the message */}
      </div>
    );
  }

  return (
    // The `style` prop is kept for external dynamic styling (e.g., height, width)
    <div style={style}>
      <Suspense
        fallback={
          <div className="tw-text-white tw-text-center tw-p-8"> {/* 2rem padding */}
            Loading 3D model...
          </div>
        }
      >
        <Canvas camera={{ position: [0, 0, 1] }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 2, 2]} />
          <SpinningModel url={src} spinning={spinning} color={color} />
          <Environment preset="city" />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            onStart={() => setSpinning(false)}
            onEnd={() => setSpinning(true)}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default ThreeDModelViewer;  