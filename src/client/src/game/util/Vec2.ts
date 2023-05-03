export default class Vec2 {
    public x: number;
    public y: number;

    constructor(x: number, y?: number) {
        this.x = x;
        this.y = y ?? x;
    }

    normalize() {
        const mag = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        this.x /= mag;
        this.y /= mag;
    }
}