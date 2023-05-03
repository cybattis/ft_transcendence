import {AIDifficulty, createNewPracticeGame, removePracticeGame} from "../PongManager";
import PracticePongState from "../states/PracticePongState"
import {useEffect, useRef} from "react";

export type PracticePongProps = {
	name: string;
	width: number;
	height: number;
	aiDifficulty: AIDifficulty;
}

export function PracticePong({ name, width, height, aiDifficulty } : PracticePongProps) {
	let canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!canvasRef || !canvasRef.current) return;
		const canvas = canvasRef.current;
		createNewPracticeGame(new PracticePongState(name, canvas, aiDifficulty));

		return () => removePracticeGame(name);
	}, [name, height, aiDifficulty, width]);

	return (
		<canvas ref={canvasRef} width={width} height={height}>A pong game</canvas>
	);
}
