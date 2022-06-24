export function cloneObject<T extends object>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Filters object, that can possible be `null`.
 */
export function notNull<T>(obj: T | null): obj is T {
    return obj !== null;
}
