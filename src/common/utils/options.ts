export function combineOptions<T extends object>(
    options: Partial<T> | undefined,
    defaultOptions: Required<T>
): Required<T> {
    return {
        ...defaultOptions,
        ...options
    };
}

export function deadlineMinutesTimestamp(deadlineMinutes: number): number {
    return Math.floor(Date.now() / 1000 + 60 * deadlineMinutes);
}
