import { UnsupportedReceiverAddressError } from 'src/common/errors';
import { compareAddresses } from 'src/common/utils/blockchain';

export function checkUnsupportedReceiverAddress(
    receiverAddress?: string,
    fromAddress?: string
): void | never {
    if (receiverAddress && (!fromAddress || !compareAddresses(receiverAddress, fromAddress))) {
        throw new UnsupportedReceiverAddressError();
    }
}
