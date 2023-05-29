export class ChannelStructure {
    public name: string;
    public players: string[];

    constructor(property1: string, property2: string) {
        this.name = property1;
        let tabPlayer: string[] =[];
        tabPlayer.push(property2);
        this.players = tabPlayer;
    }

    public isUser(username: string) :boolean{
        let index = 0;
        for(index; index < this.players.length; index++){
            if(this.players[index] === username)
                return false;
        }
        return true;
    }

    public newUser(userName: string){
        this.players.push(userName);
    }
}