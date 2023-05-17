export class ChannelService {
    constructor(private name: string) {}

    getName(): string {
        return this.name;
    }
}