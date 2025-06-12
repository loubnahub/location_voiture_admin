// src/pages/ThreeDModelViewer.jsx
import React, { useRef, Suspense, useImperativeHandle } from 'react';
import { Canvas } from '@react-three/fiber';
// [CHANGE] Import the Bounds component
import { OrbitControls, useGLTF, Environment, Html, Bounds } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

function Loader() {
    return (
        <Html center>
            <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-2 tw-text-neutral-400">
                <Loader2 className="tw-animate-spin" size={32} />
                <p>Loading ...</p>
            </div>
        </Html>
    );
}

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

const ThreeDModelViewer = React.forwardRef(({ src, style, alt, isSpinning, environmentPreset }, ref) => {
  const controlsRef = useRef();

  useImperativeHandle(ref, () => ({
    resetCamera() {
      // This will reset the camera to the nice view Bounds sets up
      controlsRef.current?.reset();
    }
  }));

  if (!src) {
    return (
      <div
        className="tw-flex tw-items-center tw-justify-center tw-w-full tw-h-full tw-bg-gray-200 tw-rounded-lg"
        style={style}
      >
        <p className="tw-text-sm tw-text-gray-500">{alt || "3D Model not available"}</p>
      </div>
    );
  }

  return (
    <div style={style}>
      {/* 
        [CHANGE] The camera position is removed from here. 
        We let the <Bounds> component control it automatically.
      */}
      <Canvas shadows camera={{ fov: 50 }}>
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} />
          
          {/* 
            [CHANGE] The Model is wrapped in the Bounds component.
            - fit:  Zooms the camera to fit the model.
            - clip: Ensures the camera doesn't go inside the model.
            - margin: Adds a nice 20% padding around the model.
          */}
          <Bounds fit clip margin={0.9}>
            <Model url={src} />
          </Bounds>

          <Environment preset={environmentPreset} />
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          autoRotate={isSpinning}
          // [CHANGE] Increased rotation speed from 0.5 to 2.5 for a faster spin.
          autoRotateSpeed={2.5}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          makeDefault // Important when using <Bounds>
        />
      </Canvas>
    </div>
  );
});

export default ThreeDModelViewer;