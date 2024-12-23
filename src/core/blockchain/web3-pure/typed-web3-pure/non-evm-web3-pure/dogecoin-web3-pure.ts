import { compareAddresses } from 'src/common/utils/blockchain';
import { staticImplements } from 'src/common/utils/decorators';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';

@staticImplements<TypedWeb3Pure>()
export class DogecoinWeb3Pure {
    public static readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    public static get nativeTokenAddress(): string {
        return DogecoinWeb3Pure.EMPTY_ADDRESS;
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, DogecoinWeb3Pure.nativeTokenAddress);
    }

    public static isEmptyAddress(address?: string): boolean {
        return address === DogecoinWeb3Pure.EMPTY_ADDRESS;
    }

    public static async isAddressCorrect(address: string): Promise<boolean> {
        return /^[X|7][0-9A-Za-z]{33}$/.test(address);
    }
}
