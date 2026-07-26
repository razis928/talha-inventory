// src/components/LightFollowingDiv.jsx

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function LightFollowingDiv() {
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [webglSupported, setWebglSupported] = useState(true);

    useEffect(() => {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!context) {
                throw new Error('WebGL not supported');
            }
        } catch (e) {
            setWebglSupported(false);
        }
    }, []);

    const handleMouseMove = (e) => {
        setMouse({
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: -(e.clientY / window.innerHeight) * 2 + 1,
        });
    };

    return (
        <div style={{ width: '100vw', height: '100vh' }} onMouseMove={handleMouseMove}>
            {webglSupported ? (
                <Canvas>
                    <ambientLight intensity={0.5} />
                    <pointLight
                        position={[mouse.x * 5, mouse.y * 5, 5]}
                        color={0xffffff}
                        intensity={1}
                    />
                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="orange" />
                    </mesh>
                    <OrbitControls />
                </Canvas>
            ) : (
                <div style={{ color: 'red', textAlign: 'center', paddingTop: '20%' }}>
                    WebGL is not supported on this device. Please update your browser or graphics drivers.
                </div>
            )}
        </div>
    );
}

export default LightFollowingDiv;
