export class OwlToUtils {
    public static getAmountWithCode(stringWeiAmount: string, code: string): string {
        const validCode = code.padStart(4, '0');
        const amount = stringWeiAmount.replace(/\d{4}$/g, validCode);
        return amount;
    }
}
