import React, { useRef, useEffect } from "react";

interface BasicCanvasProps {
    imageSrc?: string;
}

const BasicCanvas: React.FC<BasicCanvasProps> = ({ imageSrc }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        // Initialize
        if (canvasRef.current) {
            canvasCtxRef.current = canvasRef.current.getContext("2d");
            let ctx = canvasCtxRef.current;

            // Draw image if imageSrc is provided
            if (imageSrc) {
                const img = new Image();
                img.src = imageSrc;
                img.onload = () => {
                    ctx?.drawImage(img, 0, 0, img.width, img.height);
                };
            }
        }
    }, [imageSrc]);

    return <canvas ref={canvasRef}></canvas>;
};

export default BasicCanvas;
