import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';
import { BitcoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/bitcoin-web3-pure';
import { BitcoinWalletProviderCore } from 'src/core/sdk/models/wallet-provider';
import { OnChainStatusManager } from 'src/features/on-chain/status-manager/on-chain-status-manager';

import { Web3Private } from '../web3-private';
import { BitcoinPsbtEncodedConfig } from './models/bitcoin-psbt-encoded-config';
import { BitcoinTransferEncodedConfig } from './models/bitcoin-transfer-encoded-config';

export class BitcoinWeb3Private extends Web3Private {
    protected readonly Web3Pure = BitcoinWeb3Pure;

    public getBlockchainName(): Promise<BlockchainName> {
        return Promise.resolve(BLOCKCHAIN_NAME.BITCOIN);
    }

    public async transfer(
        txConfig: BitcoinTransferEncodedConfig,
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
                            recipient: txConfig.depositAddress,
                            amount: {
                                amount: txConfig.value,
                                decimals: 8
                            },
                            ...(txConfig.memo && { memo: txConfig.memo })
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
        txConfig: BitcoinPsbtEncodedConfig,
        options?: BasicTransactionOptions
    ) {
        const hashPromise = new Promise<string>((resolve, reject) => {
            this.wallet.core.request(
                {
                    method: 'sign_psbt',
                    params: {
                        psbt: txConfig.psbt,
                        signInputs: {
                            [this.address]: txConfig.signInputs
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

    public async getPublicKeyFromWallet(): Promise<string> {
        const res = await this.wallet.core.request<{ publicKey: string }[]>(
            {
                method: 'request_accounts_and_keys',
                params: {
                    purposes: ['payment']
                }
            },
            () => {}
        );

        if (res.error) {
            console.error(res.error);
            throw res.error;
        }

        return res.result[0]?.publicKey!;
    }
}
