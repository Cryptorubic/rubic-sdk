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

export function deadlineMinutesTimestamp(deadlineMinutes: number): number {
    return Math.floor(Date.now() / 1000 + 60 * deadlineMinutes);
}
