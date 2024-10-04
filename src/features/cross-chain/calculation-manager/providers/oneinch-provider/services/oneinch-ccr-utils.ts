import { ethers } from 'ethers';
import { Any } from 'src/common/utils/types';

export class OneinchCcrUtils {
    /**
     * @returns signature of signed calldata
     */
    public static async signTypedData(typedData: object, walletAddress: string): Promise<string> {
        const signature = await (window as Any).ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [walletAddress, typedData]
        });

        return signature;
    }

    public static createSecretHashes(secretsCount: number): string[] {
        const secretHashes = Array.from({ length: secretsCount })
            .map(() => this.getRandom32BitHex())
            .map(secret => ethers.utils.keccak256(secret));

        return secretHashes;
    }

    private static getRandom32BitHex(): string {
        return (
            '0x' +
            [...ethers.utils.randomBytes(32)].map(i => i.toString(16).padStart(2, '0')).join('')
        );
    }
}
