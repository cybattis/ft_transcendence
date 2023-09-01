export interface GameChatInterface{
    id: number;
    sender: string;
    opponent: string;
    msg: string;
    channel: string;
    blockedUsers: any;
}
