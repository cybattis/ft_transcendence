export class GlobalService{
    static emails: string[] = [];
    static codes: string[] = [];
    static confirmationLinks = new Map<string, number>();
}