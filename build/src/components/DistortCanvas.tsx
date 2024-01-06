import React, { useEffect, useRef } from "react";
import {
    Renderer,
    Mesh,
    Program,
    Vec2,
    Vec4,
    Flowmap,
    Texture,
    Geometry,
} from "ogl";
import { fragment, vertex } from "./shaders/distortionShader";

interface DistortCanvasProps {
    divClass: string;
    imgSrc: string;
    vertexShader?: string;
    fragmentShader?: string;
    divId?: string;
}

interface CustomVec2 extends Vec2 {
    needsUpdate: boolean;
}

const DistortedCanvas: React.FC<DistortCanvasProps> = React.memo(
    ({
        divClass,
        imgSrc,
        vertexShader,
        fragmentShader,
        divId,
    }: DistortCanvasProps) => {
        const canvasRef = useRef<HTMLDivElement>(null);
        const imgSize: [number, number] = [2500, 2500];
        const rendererRef = useRef<Renderer | null>(null);
        const mouse = new Vec2(-1);

        useEffect(() => {
            let aspect = 1;

            function createRenderer() {
                // Dispose of the existing renderer if it exists
                if (rendererRef.current) {
                    // Clear the canvas from the DOM
                    const canvas = rendererRef.current.gl.canvas;
                    canvas.parentNode?.removeChild(canvas);
                }

                const renderer = new Renderer({
                    dpr: 2,
                    alpha: true,
                    premultipliedAlpha: true,
                });
                rendererRef.current = renderer;

                const gl = rendererRef.current?.gl;
                // const mouse = new Vec2(-1);
                let velocity: CustomVec2 = Object.assign(new Vec2(), {
                    needsUpdate: false,
                });

                // gl.canvas.style.transform = `translateX${window.innerWidth}`;
                // gl.canvas.style.transform = `translateX(${window.scrollX}px) translateY(${window.scrollY}px)`;

                // console.log("Canvas size:", gl.canvas.width, gl.canvas.height);
                canvasRef.current?.appendChild(gl.canvas);
                const isTouchCapable = "ontouchstart" in window;

                const flowmap = new Flowmap(gl, {
                    falloff: 0.25,
                    dissipation: 0.99,
                    alpha: 0.5,
                });

                const geometry = new Geometry(gl, {
                    position: {
                        size: 2,
                        data: new Float32Array([-1, -1, 3, -1, -1, 3]),
                    },
                    uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
                });

                const texture = new Texture(gl, {
                    minFilter: gl.LINEAR,
                    magFilter: gl.LINEAR,
                    premultiplyAlpha: true,
                });

                // Load the initial image based on touch capability
                const imgSrcPath = `${imgSrc}`;
                const img = new Image();

                img.onload = () => (
                    console.log("Image loaded successfully", imgSrcPath),
                    (texture.image = img)
                );
                img.onerror = () => {
                    console.error("Failed to load image:", imgSrcPath);
                };
                // img.crossOrigin = "Anonymous";
                img.src = imgSrcPath;

                // Set up aspect ratio based on imageAspect
                let a1, a2;
                let imageAspect = imgSize[1] / imgSize[0];
                if (window.innerHeight > window.innerWidth) {
                    a1 = 1;
                    a2 = window.innerHeight / window.innerWidth / imageAspect;
                } else {
                    a1 = (window.innerWidth / window.innerHeight) * imageAspect;
                    a2 = 1;
                }

                const program = new Program(gl, {
                    vertex,
                    fragment,
                    uniforms: {
                        uTime: { value: 0 },
                        tWater: { value: texture },
                        res: {
                            value: new Vec4(
                                window.innerWidth,
                                window.innerHeight,
                                a1,
                                a2
                            ),
                        },
                        img: { value: new Vec2(imgSize[0], imgSize[1]) },
                        tFlow: flowmap.uniform,
                    },
                });

                if (!program.program) {
                    const infoLog = gl.getProgramInfoLog(program.program);
                    console.error("Program linking error:", infoLog);
                }

                const mesh = new Mesh(gl, { geometry, program });
                const lastMouse = new Vec2();
                let lastTime: number | undefined;
                function updateMouse(e: TouchEvent | MouseEvent) {
                    // e.preventDefault();
                    let x, y;

                    if ("changedTouches" in e) {
                        x = e.changedTouches[0]?.pageX;
                        y = e.changedTouches[0]?.pageY;
                    }

                    if (x === undefined && "pageX" in e) {
                        x = e.pageX;
                        y = e.pageY;
                    }

                    if (x !== undefined && y !== undefined) {
                        const rect = gl.canvas.getBoundingClientRect();
                        mouse.set(
                            (x - rect.left) / rect.width,
                            1.0 - (y - rect.top) / rect.height
                        );

                        if (lastTime === undefined) {
                            lastTime = performance.now();
                            lastMouse.set(x, y);
                        }

                        const deltaX = x - lastMouse.x;
                        const deltaY = y - lastMouse.y;

                        lastMouse.set(x, y);
                        let time = performance.now();
                        let delta = Math.max(10.4, time - lastTime);
                        lastTime = time;
                        velocity.x = deltaX / delta;
                        velocity.y = deltaY / delta;
                        velocity.needsUpdate = true;
                    }
                }

                // Set up mouse/touch event listeners
                if (isTouchCapable) {
                    window.addEventListener("touchstart", updateMouse, false);
                    window.addEventListener("touchmove", updateMouse, {
                        passive: false,
                    });
                } else {
                    window.addEventListener("mousemove", updateMouse, false);
                }

                // Animation loop
                function update(t: any) {
                    requestAnimationFrame(update);

                    // Check if the context is lost and attempt to restore it
                    if (gl.isContextLost()) {
                        console.log(
                            "WebGL context lost. Attempting to restore..."
                        );

                        // Dispose of existing resources, recreate WebGL context, and restore state
                        createRenderer();
                        return;
                    }

                    if (!velocity.needsUpdate) {
                        mouse.set(-1);
                        velocity.set(0);
                    }

                    velocity.needsUpdate = false;

                    flowmap.aspect = aspect;
                    flowmap.mouse.copy(mouse);
                    flowmap.velocity.lerp(
                        velocity,
                        velocity.len() ? 0.15 : 0.1
                    );
                    flowmap.update();
                    program.uniforms.uTime.value = t * 0.01;
                    renderer.render({ scene: mesh });
                }

                // Set up window resize event listener
                const resize = (isTouchCapable: boolean) => {
                    const canvasHeight = window.innerHeight;
                    let canvasWidth;

                    if (!isTouchCapable) {
                        canvasWidth = window.innerWidth;
                    } else {
                        canvasWidth = canvasHeight;
                    }

                    let imageAspect = imgSize[0] / imgSize[1];

                    // Adjusting aspect ratio based on imageAspect
                    if (canvasHeight > canvasWidth * imageAspect) {
                        a1 = 1;
                        a2 = (canvasHeight / window.innerWidth) * imageAspect;
                    } else {
                        a1 =
                            (window.innerWidth / window.innerHeight) *
                            imageAspect;
                        a2 = 1;
                    }

                    // Check if mesh.program and mesh.program.uniforms are defined
                    if (mesh?.program && mesh.program.uniforms) {
                        mesh.program.uniforms.res.value = new Vec4(
                            window.innerWidth,
                            window.innerHeight,
                            a1,
                            a2
                        );
                    }

                    // Check if renderer is defined before calling setSize
                    if (renderer) {
                        renderer.setSize(window.innerWidth, window.innerHeight);
                    }

                    aspect = window.innerWidth / window.innerHeight;
                };

                window.addEventListener(
                    "resize",
                    () => createRenderer(),
                    false
                );

                resize(isTouchCapable); // Call resize initially
                // Request animation frame for the first time
                requestAnimationFrame(update);

                // Cleanup function
                return () => {
                    // Remove event listeners or clean up resources if needed
                    window.removeEventListener("touchstart", updateMouse);
                    window.removeEventListener("touchmove", updateMouse);
                    window.removeEventListener("mousemove", updateMouse);
                    window.removeEventListener("resize", () =>
                        resize(isTouchCapable)
                    );
                };
            }

            createRenderer();
        }, [imgSrc, vertexShader, fragmentShader]);

        return <div ref={canvasRef} id={divId} className={divClass}></div>;
    }
);
export default DistortedCanvas;
