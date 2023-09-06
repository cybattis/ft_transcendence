export namespace UserData {
  let paddleColor: string = 'ffffff';
  let backgroundColor: string = '000000';
  let nickname: string = '';

  export function getPaddleColor(): string {
    return paddleColor;
  }

  export function updatePaddleColor(color: string): void {
    paddleColor = color;
  }

  export function getBackgroundColor(): string {
    return backgroundColor;
  }

  export function updateBackgroundColor(color: string): void {
    backgroundColor = color;
  }

  export function getNickname(): string {
    return nickname;
  }

  export function updateNickname(name: string): void {
    nickname = name;
  }
}