import Paddle from "./Paddle";
import Vec2 from "../util/Vec2";

export default class Ball {
    public readonly pos: Vec2;
    public readonly vel: Vec2;
    public readonly radius: number;

    private serving: boolean;
    private canvasSize: Vec2;
    private speed: number;
    private readonly baseSpeed: number;
    private readonly maxSpeed: number;
    private readonly servingSpeed: number;

    constructor(x: number, y: number, canvasWidth: number, canvasHeight: number) {
        this.pos = new Vec2(x, y);

        const primarySize = Math.min(canvasWidth / 2, canvasHeight);
        this.radius = primarySize / 40;
        this.maxSpeed = primarySize / 40;
        this.speed = primarySize / 2;
        this.baseSpeed = primarySize / 2;
        this.servingSpeed = primarySize / 4;
        this.canvasSize = new Vec2(canvasWidth, canvasHeight);

        this.serving = true;
        this.vel = new Vec2(0, 0);

        if (Math.random() > 0.5)
            this.serveRight();
        else
            this.serveLeft();
    }

    setVelocity(newVelocity: Vec2) {
        this.vel.x = newVelocity.x;
        this.vel.y = newVelocity.y;
    }

    setPosition(newPosition: Vec2) {
        this.pos.x = newPosition.x;
        this.pos.y = newPosition.y;
    }

    serveRight() {
        this.goToCenter();
        const direction = Math.random() * Math.PI / 2 - Math.PI / 4;
        this.vel.x = Math.cos(direction) * this.servingSpeed;
        this.vel.y = -Math.sin(direction) * this.servingSpeed;
    }

    serveLeft() {
        this.goToCenter();
        const direction = Math.random() * Math.PI / 2 + Math.PI * 3 / 4;
        this.vel.x = Math.cos(direction) * this.servingSpeed;
        this.vel.y = -Math.sin(direction) * this.servingSpeed;
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    update(frameTime: DOMHighResTimeStamp) {
        const clampedVel = new Vec2(this.vel.x, this.vel.y);
        if (Math.pow(clampedVel.x, 2) + Math.pow(clampedVel.y, 2) > Math.pow(this.maxSpeed * 400, 2)) {
            const mag = Math.sqrt(Math.pow(clampedVel.x, 2) + Math.pow(clampedVel.y, 2));
            const coef = this.maxSpeed * 400 / mag;
            clampedVel.x *= coef;
            clampedVel.y *= coef;
        }

        this.pos.x += clampedVel.x * frameTime;
        this.pos.y += clampedVel.y * frameTime;

        if (this.pos.y - this.radius <= 0) {
            this.pos.y += 2 * -(this.pos.y - this.radius);
            this.vel.y *= -1;
        }

        if (this.pos.y + this.radius >= this.canvasSize.y) {
            this.pos.y -= 2 * (this.pos.y + this.radius - this.canvasSize.y);
            this.vel.y *= -1;
        }
    }

    checkCollision(paddle: Paddle) {
        const pBounds = {
            top: paddle.pos.y,
            bottom: paddle.pos.y + paddle.size.y,
            left: paddle.pos.x,
            right: paddle.pos.x + paddle.size.x
        }

        const bBounds = {
            top: this.pos.y - this.radius,
            bottom: this.pos.y + this.radius,
            left: this.pos.x - this.radius,
            right: this.pos.x + this.radius
        }

        if (bBounds.bottom >= pBounds.top && bBounds.top <= pBounds.bottom &&
            bBounds.left <= pBounds.right && bBounds.right >= pBounds.left) {
            if (this.pos.x > this.canvasSize.x / 2) {
                const offset = pBounds.left - bBounds.right;
                this.pos.x += 2 * offset;
            } else {
                const offset = pBounds.right - bBounds.left;
                this.pos.x += 2 * offset;
            }

            const impactVector = new Vec2(this.pos.x - paddle.centerX, this.pos.y - paddle.centerY);
            impactVector.normalize();
            const mag = Math.sqrt(Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2)) / 2;
            this.vel.normalize();
            this.vel.x = (-this.vel.x + impactVector.x) * mag;
            this.vel.y = (this.vel.y + impactVector.y) * mag;

            if (this.serving) {
                this.vel.x *= this.baseSpeed / this.servingSpeed;
                this.vel.y *= this.baseSpeed / this.servingSpeed;
                this.serving = false;
            } else {
                this.vel.x *= 1.1;
                this.vel.y *= 1.1;
            }
        }

        if (Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2) > Math.pow(this.maxSpeed * 400, 2)) {
            const mag = Math.sqrt(Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2));
            const coef = this.maxSpeed * 400 / mag;
            this.vel.x *= coef;
            this.vel.y *= coef;
        }
    }

    private goToCenter() {
        this.pos.x = this.canvasSize.x / 2;
        this.pos.y = this.canvasSize.y / 2;
        this.speed = this.baseSpeed;
    }
}