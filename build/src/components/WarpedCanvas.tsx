import React, { useEffect, useRef } from "react";

interface WarpCanvasProps {
    imgSrc?: string;
    canvasClass?: string;
    canvasId?: string;
}

const WarpedCanvas: React.FC<WarpCanvasProps> = ({ imgSrc, canvasClass }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null!);

    useEffect(() => {
        const imgSrcPath = `${imgSrc}`;
        const img = new Image();
        img.onload = start;

        // img.crossOrigin = "Anonymous";
        img.src = imgSrcPath;

        function start() {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            if (!canvas) {
                console.error("Could not get 2D context for canvas.");
                return;
            }

            function mix(a: number, b: number, l: number) {
                return a + (b - a) * l;
            }

            function upDown(v: number) {
                return Math.sin(v) * 0.5 + 0.5;
            }

            function render(time: number) {
                time *= 0.0007;

                resize(canvas);

                const t1 = time;
                const t2 = time * 0.37;

                // for each line in the canvas
                for (let dstY = 0; dstY < canvas.height; ++dstY) {
                    // v is value that goes 0 to 1 down the canvas
                    const v = dstY / canvas.height;

                    // compute some amount to offset the src
                    const off1 =
                        Math.sin((v + 0.5) * mix(3, 12, upDown(t1))) * 150;
                    const off2 =
                        Math.sin((v + 0.5) * mix(3, 12, upDown(t2))) * 150;
                    const off = off1 + off2;

                    // compute what line of the source image we want
                    // NOTE: if off = 0 then it would just be stretching
                    // the image down the canvas.
                    let srcY = (dstY * img.height) / canvas.height + off;

                    // clamp srcY to be inside the image
                    srcY = Math.max(0, Math.min(img.height - 1, srcY));

                    // draw a single line from the src to the canvas
                    ctx?.drawImage(
                        img,
                        2,
                        srcY,
                        img.height,
                        1,
                        0,
                        dstY,
                        canvas.width,
                        1
                    );
                }

                requestAnimationFrame(render);
            }
            requestAnimationFrame(render);

            function resize(canvas: HTMLCanvasElement) {
                const canvasSize = Math.max(
                    window.innerWidth,
                    window.innerHeight
                );

                canvas.width = canvasSize;
                canvas.height = canvasSize;
            }
        }
    }, [imgSrc, canvasClass]);

    return <canvas ref={canvasRef} className={canvasClass} />;
};

export default WarpedCanvas;
