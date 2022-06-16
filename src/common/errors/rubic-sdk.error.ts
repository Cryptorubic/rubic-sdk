export class RubicSdkError extends Error {
    constructor(message?: string, errorPotions?: ErrorOptions) {
        super(message, errorPotions);
        Object.setPrototypeOf(this, RubicSdkError.prototype);
    }
}
