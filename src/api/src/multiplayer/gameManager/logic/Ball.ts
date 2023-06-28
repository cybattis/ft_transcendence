import Paddle from "./Paddle";
import Vec2 from "../util/Vec2";

export default class Ball {
  public readonly pos: Vec2;
  public readonly vel: Vec2;
  public readonly radius: number;

  private serving: boolean;
  private canvasSize: Vec2;
  private readonly servingSpeed: number;
  private readonly baseSpeed: number;
  private readonly maxSpeed: number;
  private readonly maxStepSize: number;

  constructor(x: number, y: number, canvasWidth: number, canvasHeight: number, paddleWidth: number) {
    this.pos = new Vec2(x, y);

    const primarySize = Math.min(canvasWidth / 2, canvasHeight);
    this.radius = primarySize / 40;

    this.maxSpeed = canvasWidth / 0.25;            // 0.5 seconds to cross the screen
    this.baseSpeed = canvasWidth / 2;             // 2 seconds to cross the screen
    this.servingSpeed = this.baseSpeed / 2;       // 4 seconds to cross the screen

    const maxStepSizeX = Math.min(paddleWidth / 2, canvasWidth / 5);
    const maxStepSizeY = canvasHeight / 5;
    this.maxStepSize = Math.min(maxStepSizeX, maxStepSizeY);

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
    const direction = Math.random() * Math.PI / 2 + Math.PI * 3 / 4;
    this.serve(direction);
  }

  serveLeft() {
    const direction = Math.random() * Math.PI / 2 + Math.PI * 3 / 4;
    this.serve(direction);
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  update(frameTime: DOMHighResTimeStamp) {
    this.pos.x += this.vel.x * frameTime;
    this.pos.y += this.vel.y * frameTime;

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

    // Check if the ball is near a paddle
    if (Math.abs(this.pos.x - paddle.centerX) > this.maxStepSize * 5) {
      return;
    }

    // Compute the bounds of the paddle
    const pBounds = {
      top: paddle.pos.y,
      bottom: paddle.pos.y + paddle.size.y,
      left: paddle.pos.x,
      right: paddle.pos.x + paddle.size.x
    }

    // Compute the bounds (square box) of the ball
    const bBounds = {
      top: this.pos.y - this.radius,
      bottom: this.pos.y + this.radius,
      left: this.pos.x - this.radius,
      right: this.pos.x + this.radius
    }

    // Check if the ball is colliding with the paddle
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
      const mag = Math.sqrt(Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2));
      this.vel.normalize();
      const resultVector = new Vec2(-this.vel.x + impactVector.x, this.vel.y + impactVector.y);
      resultVector.normalize();
      this.vel.x = resultVector.x * mag;
      this.vel.y = resultVector.y * mag;

      if (this.serving) {
        // Increase the speed of the ball to its normal speed after the first hit
        this.vel.x *= this.baseSpeed / this.servingSpeed;
        this.vel.y *= this.baseSpeed / this.servingSpeed;
        this.serving = false;
      } else {
        // Increase the speed of the ball after each hit
        this.vel.x *= 1.1;
        this.vel.y *= 1.1;
      }
    }

    // Limit the speed of the ball
    // Working with the squared magnitudes is faster than the actual magnitudes (no sqrt)
    const magSquared = Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2);
    const maxSpeedSquared = Math.pow(this.maxSpeed, 2);
    if (magSquared > maxSpeedSquared) {
      const coef = Math.sqrt(maxSpeedSquared / magSquared);
      this.vel.x *= coef;
      this.vel.y *= coef;
    }
  }

  calculateStepTime(ballMaxStepSize: number, frameTime: DOMHighResTimeStamp): number {
    // Compute the distance the ball will travel in this frame
    const step = new Vec2(Math.abs(this.vel.x) * frameTime, Math.abs(this.vel.y) * frameTime);

    let stepTime = frameTime;

    if (step.x > ballMaxStepSize) {
      stepTime = frameTime * (ballMaxStepSize / step.x);
    }
    if (step.y > ballMaxStepSize) {
      stepTime = Math.min(stepTime, frameTime * (ballMaxStepSize / step.y));
    }

    return stepTime;
  }

  private serve(direction: number) {
    this.goToCenter();
    this.vel.x = Math.cos(direction) * this.servingSpeed;
    this.vel.y = -Math.sin(direction) * this.servingSpeed;
    this.serving = true;
  }

  private goToCenter() {
    this.pos.x = this.canvasSize.x / 2;
    this.pos.y = this.canvasSize.y / 2;
  }
}