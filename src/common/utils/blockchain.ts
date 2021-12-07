import { Cache } from '@common/decorators/cache.decorator';

export function compareAddresses(address0: string, address1: string): boolean {
    return address0.toLowerCase() === address1.toLowerCase();
}

export class Utils {
    @Cache
    public static deadlineMinutesTimestamp(deadlineMinutes: number): number {
        return Math.floor(Date.now() / 1000 + 60 * deadlineMinutes);
    }
}
