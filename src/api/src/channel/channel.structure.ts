export class banStructure {
    public name: string;
    public date: Date;

    constructor(username: string, time: number) {
        this.name = username;
        this.date = new Date();
        console.log(`date before : ${this.date}`);
        this.date = this.addMinutes(this.date, time);
        console.log(`date after : ${this.date}`);
    }

    public addMinutes(date: Date, minutes: number) {
        if (minutes === 0)
            date.setMinutes(date.getMinutes() + 100000000);
        else
            date.setMinutes(date.getMinutes() + minutes)
        return date;
    }
}

export class ChannelStructure {
    public name: string;
    public users: string[];
    public owner: string;
    public operator: string[];
    public pswd: string;
    public ban: banStructure[];

    constructor (channelName: string, username: string, pass: string) {
        this.name = channelName;
        this.users = [];
        this.users.push(username);
        this.owner = username;
        this.operator = [];
        this.operator.push(username);
        this.ban = [];
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
            if (username === this.ban[index].name)
            {
                const actualDate: Date = new Date();
                if (this.ban[index].date < actualDate){
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