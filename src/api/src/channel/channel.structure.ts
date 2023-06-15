export class ChannelStructure {
    public name: string;
    public users: string[];
    public owner: string;
    public operator: string[];
    public pswd: string;
    public ban: string[];
    public isPrivate: boolean;

    constructor(channelName: string, username: string, pass: string) {
        this.name = channelName;
        this.users = [];
        this.users.push(username);
        this.owner = username;
        this.operator = [];
        this.operator.push(username);
        this.ban = [];
        if (!pass)
            this.isPrivate = false;
        else {
            this.isPrivate = true;
            this.pswd = pass;
        }
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
            if (username === this.ban[index])
                return true;
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

}