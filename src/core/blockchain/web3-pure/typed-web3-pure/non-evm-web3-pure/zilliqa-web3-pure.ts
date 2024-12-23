import { compareAddresses } from 'src/common/utils/blockchain';
import { staticImplements } from 'src/common/utils/decorators';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';

@staticImplements<TypedWeb3Pure>()
export class ZilliqaWeb3Pure {
    public static readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    public static get nativeTokenAddress(): string {
        return ZilliqaWeb3Pure.EMPTY_ADDRESS;
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, ZilliqaWeb3Pure.nativeTokenAddress);
    }

    public static isEmptyAddress(address?: string): boolean {
        return address === ZilliqaWeb3Pure.EMPTY_ADDRESS;
    }

    public static async isAddressCorrect(address: string): Promise<boolean> {
        return /^zil1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38}$/.test(address);
    }
}
