/**
 * Used for {@link Cache} decorator.
 * User `notSave` field to define whether to cache calculated result.
 */
export type ConditionalResult<T> = {
    notSave: boolean;
    value: T;
};
