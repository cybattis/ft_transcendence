export class UsersSocketStructure {
  public username: string;
  public id: number;
  public socket: string;

  constructor(username: string, socket: string, id: number) {
    this.username = username;
    this.id = id;
    this.socket = socket;
  }
}
