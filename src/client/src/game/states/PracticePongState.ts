import {PongState} from "../logic/PongState";
import {drawText} from "../util/Utils";
import {AIDifficulty} from "../PongManager";

export default class PracticePongState {
    public readonly state: PongState;

    private readonly canvas: HTMLCanvasElement;
    private readonly aiSpeed: number;
    private readonly playerSpeed: number;

    constructor(name: string, canvas: HTMLCanvasElement, aiDifficulty: AIDifficulty) {
        this.canvas = canvas;
        this.state = new PongState(name, canvas, "AI", "Player");

        if (aiDifficulty === "Easy")
            this.aiSpeed = canvas.height / 6;
        else if (aiDifficulty === "Medium")
            this.aiSpeed = canvas.height / 4;
        else
            this.aiSpeed = canvas.height / 2;

        this.playerSpeed = canvas.height / 2;
    }

    start() {
        if (!this.state.isPlaying())
            this.state.restartGame();
    }

    update(frameTime: DOMHighResTimeStamp, upArrow: boolean, downArrow: boolean) {
        if (!this.state.isPlaying())
            return;

        this.state.moveLeftPaddleAI(this.aiSpeed, frameTime);
        this.handlePlayerMovement(frameTime, upArrow, downArrow);
        this.state.update(frameTime);
    }

    handlePlayerMovement(frameTime: DOMHighResTimeStamp, upArrowPressed: boolean, downArrowPressed: boolean) {
        if (upArrowPressed)
            this.state.moveRightPaddle(-this.playerSpeed * frameTime);
        else if (downArrowPressed)
            this.state.moveRightPaddle(this.playerSpeed * frameTime);
    }

    render() {
        this.state.render();

        if (!this.state.isPlaying()) {
            if (!this.canvas) return;
            if (!this.canvas.getContext) return;

            const ctx = this.canvas.getContext("2d");
            if (!ctx) return;

            drawText(ctx, "Press space to start...", "middle", this.canvas.width / 2, this.canvas.height / 2 + this.state.getFontSize() * 2, this.state.getFont());
        }
    }
}