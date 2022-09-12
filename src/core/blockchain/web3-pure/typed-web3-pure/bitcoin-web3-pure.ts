import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';
import { staticImplements } from 'src/common/utils/decorators';
import { Network, validate } from 'bitcoin-address-validation';
import { compareAddresses } from 'src/common/utils/blockchain';

@staticImplements<TypedWeb3Pure>()
export class BitcoinWeb3Pure {
    static get nativeTokenAddress(): string {
        return '';
    }

    static isNativeAddress(address: string): boolean {
        return compareAddresses(address, this.nativeTokenAddress);
    }

    static isAddressCorrect(address: string): boolean {
        return validate(address, Network.mainnet);
    }
}
