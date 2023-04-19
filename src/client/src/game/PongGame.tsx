import {useEffect, useRef} from "react";

export type PongProps = {
    width: number;
    height: number;
    color: string;
}

export function PongGame({ width, height, color } : PongProps) {

    let canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.log("canvas couldn't be retrieved");
            return;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            console.log("context couldn't be retrieved");
            return;
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fillRect(0, 0, 500, 500);
        ctx.fillStyle = color;
        ctx.strokeStyle = "rgba(0, 0, 0, 255)";
        ctx.strokeRect(0, 0, width, height);
        ctx.fillRect(10, 10, width - 20, height - 20);

    }, [color, height, width]);

    return (
        <canvas ref={canvasRef} width={width} height={height}>A pong game</canvas>
    );
}