import { TonClient4 } from '@ton/ton';
import { TonConnectUI } from '@tonconnect/ui';
import { RubicSdkError } from 'src/common/errors';
import { waitFor } from 'src/common/utils/waitFor';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TonApiService } from 'src/core/blockchain/services/ton/tonapi-service';
import { TonWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/ton-web3-pure/ton-web3-pure';
import { TonWalletProviderCore } from 'src/core/sdk/models/wallet-provider';

import { EvmWeb3Private } from '../evm-web3-private/evm-web3-private';
import { Web3Error } from '../models/web3.error';
import { Web3Private } from '../web3-private';
import { TonTransactionOptions } from './models/ton-types';

export class TonWeb3Private extends Web3Private {
    protected readonly Web3Pure = TonWeb3Pure;

    private readonly tonApi: TonApiService = new TonApiService();

    private readonly tonConnectUI: TonConnectUI;

    private readonly _tonClient: TonClient4;

    public get tonClient(): TonClient4 {
        return this._tonClient;
    }

    public async getBlockchainName(): Promise<BlockchainName> {
        return BLOCKCHAIN_NAME.TON;
    }

    public async sendTransaction(options: TonTransactionOptions): Promise<string> {
        try {
            const { boc } = await this.tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 360,
                messages: options.messages
            });
            const txHash = TonWeb3Pure.fromBocToBase64Hash(boc);
            options.onTransactionHash?.(txHash);
            const isCompleted = await this.waitForTransactionReceipt(txHash);
            if (!isCompleted) {
                throw new RubicSdkError('[TonWeb3Private] TON transaction timeout expired!');
            }
            return boc;
        } catch (err) {
            console.error(`Send transaction error. ${err}`);
            throw EvmWeb3Private.parseError(err as Web3Error);
        }
    }

    private async waitForTransactionReceipt(txHash: string): Promise<boolean> {
        let isCompleted = false;
        const startTimeMS = Date.now();
        const timeLimitMS = 600 * 1000;

        while (true) {
            const currentTimeMS = Date.now();
            if (currentTimeMS > startTimeMS + timeLimitMS) {
                return false;
            }
            if (isCompleted) {
                return true;
            }
            await waitFor(30_000);
            isCompleted = await this.tonApi.checkIsTxCompleted(txHash);
        }
    }

    constructor(tonProviderCore: TonWalletProviderCore) {
        super(tonProviderCore.address);
        this.tonConnectUI = tonProviderCore.core;
        this._tonClient = new TonClient4({
            endpoint: 'https://mainnet-v4.tonhubapi.com'
        });
    }
}
