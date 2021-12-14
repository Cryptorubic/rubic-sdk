export function cloneObject<T extends object>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function notNull<T>(obj: T | null): obj is T {
    return obj !== null;
}

export function combineOptions<T extends object>(
    options: Partial<T> | undefined,
    defaultOptions: Required<T>
): Required<T> {
    return Object.fromEntries(
        Object.entries(defaultOptions).map(([key, value]) => [
            key,
            options?.[key as keyof T] ? options?.[key as keyof T] : value
        ])
    ) as Required<T>;
}
