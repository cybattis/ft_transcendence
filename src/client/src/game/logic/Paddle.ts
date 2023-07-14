import Vec2 from "../util/Vec2";

export default class Paddle {
  public readonly pos: Vec2;
  public readonly size: Vec2;

  private readonly canvasHeight: number;

  constructor(isLeft: boolean, canvasWidth: number, canvasHeight: number) {
    this.canvasHeight = canvasHeight;

    const primarySize = Math.min(canvasWidth / 2, canvasHeight);
    this.size = new Vec2(primarySize / 20, primarySize / 5);

    if (isLeft)
      this.pos = new Vec2(canvasWidth / 20 - this.size.x, canvasHeight / 2 - this.size.y / 2);
    else
      this.pos = new Vec2(canvasWidth - canvasWidth / 20, canvasHeight / 2 - this.size.y / 2);
  }

  public get centerX(): number {
    return this.pos.x + this.size.x / 2;
  }

  public get centerY(): number {
    return this.pos.y + this.size.y / 2;
  }

  goToCenter() {
    this.pos.y = this.canvasHeight / 2 - this.size.y / 2;
  }

  setPosition(newPosition: Vec2) {
    this.pos.x = newPosition.x;
    this.pos.y = newPosition.y;
  }

  move(dy: number) {
    this.pos.y += dy;
    if (this.pos.y < 0)
      this.pos.y = 0;
    else if (this.pos.y + this.size.y > this.canvasHeight)
      this.pos.y = this.canvasHeight - this.size.y;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  }
}
