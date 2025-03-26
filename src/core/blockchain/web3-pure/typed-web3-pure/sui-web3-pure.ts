import { compareAddresses } from '@cryptorubic/core';
import { staticImplements } from 'src/common/utils/decorators';

import { TypedWeb3Pure } from './typed-web3-pure';

@staticImplements<TypedWeb3Pure>()
export class SuiWeb3Pure {
    public static readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    public static get nativeTokenAddress(): string {
        return SuiWeb3Pure.EMPTY_ADDRESS;
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, SuiWeb3Pure.nativeTokenAddress);
    }

    public static isEmptyAddress(address?: string): boolean {
        return address === SuiWeb3Pure.EMPTY_ADDRESS;
    }

    public static async isAddressCorrect(_address: string): Promise<boolean> {
        return true;
    }
}
