import { compareAddresses } from 'src/common/utils/blockchain';
import { staticImplements } from 'src/common/utils/decorators';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';

@staticImplements<TypedWeb3Pure>()
export class AionWeb3Pure {
    public static readonly EMPTY_ADDRESS = '';

    public static get nativeTokenAddress(): string {
        return '';
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, AionWeb3Pure.nativeTokenAddress);
    }

    public static isEmptyAddress(address?: string): boolean {
        return address === AionWeb3Pure.EMPTY_ADDRESS;
    }

    // @TODO make correct validation
    public static isAddressCorrect(address: string): boolean {
        return !!address;
    }
}
