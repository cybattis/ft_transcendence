export class ChannelStructure {
    public name: string;
    public players: string[];
    public owner: string;
    public operator: string[];

    constructor(channelName: string, username: string) {
        this.name = channelName;
        let tabPlayer: string[] =[];
        tabPlayer.push(username);
        this.players = tabPlayer;
        this.owner = username;
        this.operator = tabPlayer;
    }

    public isUser(username: string) :boolean{
        let index = 0;
        for(index; index < this.players.length; ++index){
            if(this.players[index] === username)
                return false;
        }
        return true;
    }

    public newUser(userName: string){
        this.players.push(userName);
    }

    public getName(): string{
        return (this.name);
    }

}