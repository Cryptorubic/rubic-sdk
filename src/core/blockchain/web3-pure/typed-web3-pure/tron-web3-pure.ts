import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';
import { staticImplements } from 'src/common/utils/decorators';
import { compareAddresses } from 'src/common/utils/blockchain';
import { TronWeb } from 'src/core/blockchain/constants/tron-web';

@staticImplements<TypedWeb3Pure>()
export class TronWeb3Pure {
    public static get nativeTokenAddress(): string {
        return '0x0000000000000000000000000000000000000000';
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, TronWeb3Pure.nativeTokenAddress);
    }

    public static isAddressCorrect(address: string): boolean {
        return TronWeb.isAddress(address);
    }
}
