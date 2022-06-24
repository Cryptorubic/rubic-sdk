/**
 * Compares provided addresses case insensitive.
 */
export function compareAddresses(address0: string, address1: string): boolean {
    return address0.toLowerCase() === address1.toLowerCase();
}
