import { ethers } from 'ethers';
import { Any } from 'src/common/utils/types';
import { waitFor } from 'src/common/utils/waitFor';

import { OneinchCcrApiService } from './oneinch-ccr-api-service';

type SecretIndex = number;
type SecretHash = string;
export class OneinchCcrUtils {
    /**
     * submits each ready secret created in createSecretHashes array untill all secrets will be submitted
     */
    public static listenForSecretsReadiness(orderHash: string, secrets: string[]): void {
        const submittedSecrets = {} as Record<SecretIndex, SecretHash>;
        const deadlineMS = Date.now() + 1_000 * 900; // 15 minutes

        (async () => {
            External: while (true) {
                await waitFor(30_000);

                const isAllSecretsSubmitted = secrets.every(
                    (hash, ind) => submittedSecrets[ind] && submittedSecrets[ind] === hash
                );
                if (isAllSecretsSubmitted || Date.now() > deadlineMS) break;

                const readySecrets = await OneinchCcrApiService.fetchReadySecrets(orderHash).catch(
                    () => null
                );
                if (!readySecrets) continue;

                Internal: for (const secret of readySecrets) {
                    const isAlreadySubmitted = !!submittedSecrets[secret.idx];
                    if (isAlreadySubmitted) continue Internal;

                    submittedSecrets[secret.idx] = secrets[secret.idx] as string;
                }
            }

            await Promise.all(
                secrets.map(secret =>
                    OneinchCcrApiService.submitSecretForSwapOrder(orderHash, secret)
                )
            );
        })();
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
