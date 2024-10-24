import { ethers } from 'ethers';
import { Any } from 'src/common/utils/types';
import { waitFor } from 'src/common/utils/waitFor';

import { OneinchSecret } from '../models/oneinch-api-types';
import { OneinchCcrApiService } from './oneinch-ccr-api-service';

type SecretIndex = number;
type Secret = string;
type SrcTxHash = string;
export class OneinchCcrUtils {
    /**
     * submits each ready secret created in createSecretHashes array untill all secrets will be submitted
     * @warning used only for orders with more than 1 secrets
     */
    public static async listenForSecretsReadiness(
        orderHash: string,
        secrets: string[]
    ): Promise<void> {
        const submittedSecrets = {} as Record<SecretIndex, Secret>;
        const deadlineMS = Date.now() + 1_000 * 900; // 15 minutes

        (async () => {
            while (Date.now() < deadlineMS) {
                await waitFor(30_000);

                const isAllSecretsSubmitted = secrets.every(
                    (hash, ind) => submittedSecrets[ind] === hash
                );
                if (isAllSecretsSubmitted) break;

                const readySecrets = await OneinchCcrApiService.fetchReadySecrets(orderHash).catch(
                    () => null
                );
                if (!readySecrets || !readySecrets.fills.length) continue;

                for (const secret of readySecrets.fills) {
                    const isSubmitted = !!submittedSecrets[secret.idx];
                    if (!isSubmitted) {
                        await OneinchCcrApiService.submitSecretForSwapOrder(
                            orderHash,
                            secrets[secret.idx] as string
                        );
                        submittedSecrets[secret.idx] = secrets[secret.idx] as string;
                    }
                    // if (secret.idx === 0) {
                    //     srcTxHash = secret.srcEscrowDeployTxHash;
                    // }
                }
            }
        })();
    }

    public static async listenForSrcTxCompleted(orderHash: string): Promise<SrcTxHash> {
        const deadlineMS = Date.now() + 1_000 * 600; // 10 minutes
        let srcTxHash: string | null = null;

        while (Date.now() < deadlineMS && !srcTxHash) {
            await waitFor(10_000);
            srcTxHash = await OneinchCcrApiService.fetchSrcTxHash(orderHash);
        }

        return srcTxHash!;
    }

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

    public static createSecretHashes(secretsCount: number): OneinchSecret[] {
        const secretHashes = Array.from({ length: secretsCount })
            .map(() => this.getRandom32BitHex())
            .map(secret => ({ hashedSecret: ethers.utils.keccak256(secret), secret }));

        return secretHashes;
    }

    private static getRandom32BitHex(): string {
        return (
            '0x' +
            [...ethers.utils.randomBytes(32)].map(i => i.toString(16).padStart(2, '0')).join('')
        );
    }
}
