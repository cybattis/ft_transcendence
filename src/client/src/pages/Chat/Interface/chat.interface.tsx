export interface ChatInterface{
    event: string
    username: string;
    channel: string;
    message: string;
}

export interface MessagesInterface{
    id: number;
    channelName: string;
    content: string;
    emitter: string
}