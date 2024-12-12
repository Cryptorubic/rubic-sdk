import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';
import { BitcoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/bitcoin-web3-pure';
import { BitcoinWalletProviderCore } from 'src/core/sdk/models/wallet-provider';

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
        const request = new Promise((resolve, reject) => {
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
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        options?.onTransactionHash?.('hz');
                        resolve([result]);
                    }
                }
            );
        });

        return request as Promise<string>;
    }

    constructor(private readonly wallet: BitcoinWalletProviderCore) {
        super(wallet.address);
    }
}
