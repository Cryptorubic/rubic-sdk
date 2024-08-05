import { compareAddresses } from 'src/common/utils/blockchain';
import { staticImplements } from 'src/common/utils/decorators';
import { isMulticoinReceiverAddressCorrect } from 'src/core/blockchain/utils/multicoin-receiver-address-validator';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';
import { changenowApiBlockchain } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/constants/changenow-api-blockchain';

@staticImplements<TypedWeb3Pure>()
export class NeoWeb3Pure {
    public static readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    public static get nativeTokenAddress(): string {
        return NeoWeb3Pure.EMPTY_ADDRESS;
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, NeoWeb3Pure.nativeTokenAddress);
    }

    public static isEmptyAddress(address?: string): boolean {
        return address === NeoWeb3Pure.EMPTY_ADDRESS;
    }

    public static async isAddressCorrect(address: string): Promise<boolean> {
        return isMulticoinReceiverAddressCorrect(
            address,
            changenowApiBlockchain.NEO,
            /^(A)[A-Za-z0-9]{33}$/
        );
    }
}
