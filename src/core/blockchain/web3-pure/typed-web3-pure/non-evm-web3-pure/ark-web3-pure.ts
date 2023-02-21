import { compareAddresses } from 'src/common/utils/blockchain';
import { staticImplements } from 'src/common/utils/decorators';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { nonEvmChainAddressCorrectResponse } from 'src/features/common/models/non-evm-chain-address-correct-response';
import { changenowApiBlockchain } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/constants/changenow-api-blockchain';

@staticImplements<TypedWeb3Pure>()
export class ArkWeb3Pure {
    public static readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    public static get nativeTokenAddress(): string {
        return ArkWeb3Pure.EMPTY_ADDRESS;
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, ArkWeb3Pure.nativeTokenAddress);
    }

    public static isEmptyAddress(address?: string): boolean {
        return address === ArkWeb3Pure.EMPTY_ADDRESS;
    }

    public static async isAddressCorrect(address: string): Promise<boolean> {
        const response = await Injector.httpClient.get<nonEvmChainAddressCorrectResponse>(
            `https://api.changenow.io/v2/validate/address?currency=${changenowApiBlockchain.ARK}&address=${address}`
        );
        return response.result;
    }
}
