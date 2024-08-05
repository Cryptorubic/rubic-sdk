import { validate } from 'multicoin-address-validator';

export const isMulticoinReceiverAddressCorrect = async (
    address: string,
    chain: string,
    regEx: RegExp
): Promise<boolean> => {
    try {
        return validate(address, chain);
    } catch (error) {
        return regEx.test(address);
    }
};
