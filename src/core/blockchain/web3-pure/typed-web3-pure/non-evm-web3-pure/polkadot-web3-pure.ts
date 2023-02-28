import { compareAddresses } from 'src/common/utils/blockchain';
import { staticImplements } from 'src/common/utils/decorators';
import { isChangenowReceiverAddressCorrect } from 'src/core/blockchain/utils/changenow-receiver-address-validator';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';
import { changenowApiBlockchain } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/constants/changenow-api-blockchain';

@staticImplements<TypedWeb3Pure>()
export class PolkadotWeb3Pure {
    public static readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    public static get nativeTokenAddress(): string {
        return PolkadotWeb3Pure.EMPTY_ADDRESS;
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, PolkadotWeb3Pure.nativeTokenAddress);
    }

    public static isEmptyAddress(address?: string): boolean {
        return address === PolkadotWeb3Pure.EMPTY_ADDRESS;
    }

    public static async isAddressCorrect(address: string): Promise<boolean> {
        return isChangenowReceiverAddressCorrect(
            address,
            changenowApiBlockchain.POLKADOT,
            /^1[0-9a-z-A-Z]{44,49}$/
        );
    }
}
