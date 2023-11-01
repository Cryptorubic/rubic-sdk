export const errorCode = {
    DEFAULT: 'DEFAULT',
    NO_ROUTE: 'NO_ROUTE',
    AMOUNT_TOO_LOW: 'AMOUNT_TOO_LOW',
    AMOUNT_TOO_HIGH: 'AMOUNT_TOO_HIGH',
    AMOUNT_LESS_THAN_FEE: 'AMOUNT_LESS_THAN_FEE',
    NO_TRANSIT_TOKEN: 'NO_TRANSIT_TOKEN',
    NO_TRANSIT_POO: 'NO_TRANSIT_POO'
} as const;

export interface SymbiosisError {
    code: keyof typeof errorCode | number;
    message?: string;
}
