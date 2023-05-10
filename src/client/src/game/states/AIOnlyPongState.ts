import {PongState} from "../logic/PongState";
import {AIDifficulty} from "../PongManager";

export default class AIOnlyPongState {
    public state: PongState;

    private canvas: HTMLCanvasElement;
    private timeSinceGameOver: DOMHighResTimeStamp;

    private leftSpeed: number;
    private rightSpeed: number;

    constructor(name: string, canvas: HTMLCanvasElement, leftDifficulty: AIDifficulty, rightDifficulty: AIDifficulty) {
        this.canvas = canvas;
        this.state = new PongState(name, canvas, "Left AI", "Right AI");
        this.state.restartGame();
        this.timeSinceGameOver = 0;

        if (leftDifficulty === "Easy")
            this.leftSpeed = canvas.height / 6;
        else if (leftDifficulty === "Medium")
            this.leftSpeed = canvas.height / 4;
        else
            this.leftSpeed = canvas.height / 2;

        if (rightDifficulty === "Easy")
            this.rightSpeed = canvas.height / 6;
        else if (rightDifficulty === "Medium")
            this.rightSpeed = canvas.height / 4;
        else
            this.rightSpeed = canvas.height / 2;
    }

    update(frameTime: DOMHighResTimeStamp) {
        if (this.state.isPlaying()) {
            this.state.moveLeftPaddleAI(this.leftSpeed, frameTime);
            this.state.moveRightPaddleAI(this.rightSpeed, frameTime);
            this.state.update(frameTime);
        } else
            this.updateGameOver(frameTime);
    }

    updateGameOver(frameTime: DOMHighResTimeStamp) {
        this.timeSinceGameOver += frameTime;

        if (this.timeSinceGameOver > 3) {
            this.state.restartGame();
            this.timeSinceGameOver = 0;
        }
    }

    render() {
        this.state.render();
    }
}