import { Injector } from 'src/core/injector/injector';
import { nonEvmChainAddressCorrectResponse } from 'src/features/common/models/non-evm-chain-address-correct-response';

export const isChangenowReceiverAddressCorrect = async (
    address: string,
    chain: string,
    regEx: RegExp
): Promise<boolean> => {
    try {
        const response = await Injector.httpClient.get<nonEvmChainAddressCorrectResponse>(
            `https://api.changenow.io/v2/validate/address?currency=${chain}&address=${address}`
        );

        return response.result;
    } catch (error) {
        return regEx.test(address);
    }
};
