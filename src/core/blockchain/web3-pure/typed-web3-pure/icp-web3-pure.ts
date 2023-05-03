import * as CRC32 from 'crc-32';
import { compareAddresses } from 'src/common/utils/blockchain';
import { staticImplements } from 'src/common/utils/decorators';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';

@staticImplements<TypedWeb3Pure>()
export class IcpWeb3Pure {
    public static readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    public static get nativeTokenAddress(): string {
        return IcpWeb3Pure.EMPTY_ADDRESS;
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, IcpWeb3Pure.nativeTokenAddress);
    }

    public static isEmptyAddress(address?: string): boolean {
        return address === IcpWeb3Pure.EMPTY_ADDRESS;
    }

    public static async isAddressCorrect(address: string): Promise<boolean> {
        if (address?.length !== 64) {
            return false;
        }
        const buffer = this.base16Decode(address);
        const hash = CRC32.buf(buffer.slice(4));
        return hash === ((buffer[0]! << 24) | (buffer[1]! << 16) | (buffer[2]! << 8) | buffer[3]!);
    }

    private static base16Decode(str: string): number[] {
        const buffer = [];
        for (let i = 0; i < str.length / 2; ++i) {
            const hi = parseInt(str.substring(i * 2, i * 2 + 1), 16);
            const lo = parseInt(str.substring(i * 2 + 1, i * 2 + 2), 16);
            buffer.push((hi << 4) | lo);
        }
        return buffer;
    }
}
