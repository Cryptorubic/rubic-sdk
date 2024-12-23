import { compareAddresses } from 'src/common/utils/blockchain';
import { staticImplements } from 'src/common/utils/decorators';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';

@staticImplements<TypedWeb3Pure>()
export class CardanoWeb3Pure {
    public static readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    public static get nativeTokenAddress(): string {
        return CardanoWeb3Pure.EMPTY_ADDRESS;
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, CardanoWeb3Pure.nativeTokenAddress);
    }

    public static isEmptyAddress(address?: string): boolean {
        return address === CardanoWeb3Pure.EMPTY_ADDRESS;
    }

    public static async isAddressCorrect(address: string): Promise<boolean> {
        return /^([1-9A-HJ-NP-Za-km-z]{59,104})|([0-9A-Za-z]{58,104})$/.test(address);
    }
}
