export function compareAddresses(address0: string, address1: string): boolean {
    return address0.toLowerCase() === address1.toLowerCase();
}
export function deadlineMinutesTimestamp(deadlineMinutes: number): number {
    return Math.floor(Date.now() / 1000 + 60 * deadlineMinutes);
}
