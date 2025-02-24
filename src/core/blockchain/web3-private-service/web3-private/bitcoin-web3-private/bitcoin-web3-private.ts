import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';
import { BitcoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/bitcoin-web3-pure';
import { BitcoinWalletProviderCore } from 'src/core/sdk/models/wallet-provider';
import { OnChainStatusManager } from 'src/features/on-chain/status-manager/on-chain-status-manager';

import { Web3Private } from '../web3-private';

export class BitcoinWeb3Private extends Web3Private {
    protected readonly Web3Pure = BitcoinWeb3Pure;

    public getBlockchainName(): Promise<BlockchainName> {
        return Promise.resolve(BLOCKCHAIN_NAME.BITCOIN);
    }

    public async transfer(
        recipient: string,
        amount: string,
        memo?: string,
        options?: BasicTransactionOptions
    ): Promise<string> {
        const hashPromise = new Promise<string>((resolve, reject) => {
            this.wallet.core.request(
                {
                    method: 'transfer',
                    params: [
                        {
                            feeRate: 10,
                            from: this.wallet.address,
                            recipient,
                            amount: {
                                amount,
                                decimals: 8
                            },
                            ...(memo && { memo })
                        }
                    ]
                },
                (error, txHash) => {
                    if (error) {
                        reject(error);
                    } else {
                        const hash = txHash as string;
                        options?.onTransactionHash?.(hash);
                        resolve(hash);
                    }
                }
            );
        });
        try {
            const hash = await hashPromise;
            if (typeof hash === 'string') {
                const statusData = await OnChainStatusManager.getBitcoinTransaction(hash);
                return statusData.hash!;
            }
            throw new Error();
        } catch {
            throw new Error('Failed to transfer funds');
        }
    }

    public async sendPsbtTransaction(
        psbt: string,
        userAddress: string,
        inputIndexes: number[],
        options?: BasicTransactionOptions
    ) {
        const hashPromise = new Promise<string>((resolve, reject) => {
            this.wallet.core.request(
                {
                    method: 'sign_psbt',
                    params: {
                        psbt,
                        signInputs: {
                            [userAddress]: inputIndexes
                        },
                        allowedSignHash: 1,
                        broadcast: true
                    }
                },
                (error, txHash) => {
                    if (error) {
                        reject(error);
                    } else {
                        const txData = txHash as { result: { psbt: string; txId: string } };
                        options?.onTransactionHash?.(txData.result.txId);
                        resolve(txData.result.txId);
                    }
                }
            );
        });
        try {
            const hash = await hashPromise;
            if (typeof hash === 'string') {
                const statusData = await OnChainStatusManager.getBitcoinTransaction(hash);
                return statusData.hash!;
            }
            throw new Error();
        } catch {
            throw new Error('Failed to sign psbt transaction');
        }
    }

    constructor(private readonly wallet: BitcoinWalletProviderCore) {
        super(wallet.address);
    }
}
