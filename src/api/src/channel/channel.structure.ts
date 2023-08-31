export type BanType = [string, Date];

export class ChannelStructure {
    public name: string;
    public users: string[];
    public owner: string;
    public operator: string[];
    public pswd: string;
    public ban: BanType[];
    public mute: string[];

    constructor (channelName: string, username: string, pass: string) {
        this.name = channelName;
        this.users = [];
        this.users.push(username);
        this.owner = username;
        this.operator = [];
        this.operator.push(username);
        this.ban = [];
        this.mute= [];
        this.pswd = "";
    }

    public isUser(username: string) :boolean{
        let index = 0;
        for(index; index < this.users.length; ++index){
            if(this.users[index] === username)
                return true;
        }
        return false;
    }

    public newUser(username: string){
        this.users.push(username);
    }

    public getName(): string{
        return (this.name);
    }

    public isBan(username: string): boolean{
        for (let index = 0; index < this.ban.length; index++){
            if (username === this.ban[index][0])
            {
                const actualDate: Date = new Date();
                if (this.ban[index][1] < actualDate){
                    console.log(`ban ttrop grand`);
                    this.ban.splice(index, 1);
                    return false;
                } else
                    return true;
            }
        }
        return false;
    }

    public isOpe(username: string): boolean{
        for (let index = 0; index < this.operator.length; index++){
            if (username === this.operator[index])
                return true;
        }
        return false;
    }

    public isOwner(username: string): boolean{
        return (username === this.owner);
    }

    public nbUsersInChannel(): number{
        return this.users.length;
    }
}