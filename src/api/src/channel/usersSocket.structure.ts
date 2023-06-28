export class UsersSocketStructure {
    public username: string;
    public socket: string;

    constructor(username: string, socket: string) {
        this.username = username;
        this.socket = socket;
    }
}