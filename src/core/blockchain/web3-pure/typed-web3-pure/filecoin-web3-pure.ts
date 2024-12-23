import { compareAddresses } from 'src/common/utils/blockchain';
import { staticImplements } from 'src/common/utils/decorators';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';

@staticImplements<TypedWeb3Pure>()
export class FilecoinWeb3Pure {
    public static readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    public static get nativeTokenAddress(): string {
        return FilecoinWeb3Pure.EMPTY_ADDRESS;
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, FilecoinWeb3Pure.nativeTokenAddress);
    }

    public static isEmptyAddress(address?: string): boolean {
        return address === FilecoinWeb3Pure.EMPTY_ADDRESS;
    }

    public static async isAddressCorrect(address: string): Promise<boolean> {
        return /[a-z0-9]{41}$|[a-z0-9]{86}$/.test(address);
    }
}
