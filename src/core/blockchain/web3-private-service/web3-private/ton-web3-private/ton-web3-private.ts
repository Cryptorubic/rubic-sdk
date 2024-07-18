import { TonConnectUI } from '@tonconnect/ui';
import { RubicSdkError } from 'src/common/errors';
import { waitFor } from 'src/common/utils/waitFor';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TonUtils } from 'src/core/blockchain/services/ton/ton-utils';
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

    public async getBlockchainName(): Promise<BlockchainName> {
        return BLOCKCHAIN_NAME.TON;
    }

    public async sendTransaction(options: TonTransactionOptions): Promise<string> {
        try {
            const { boc } = await this.tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 360,
                messages: options.messages
            });
            const txHash = TonUtils.fromBocToBase64Hash(boc);
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

    private async waitForTransactionReceipt(boc: string): Promise<boolean> {
        let isCompleted = false;
        let durationInSecs = 0;
        const durationLimitInSecs = 600;
        const intervalId = setInterval(() => durationInSecs++, 1_000);

        while (true) {
            if (durationInSecs > durationLimitInSecs) {
                clearInterval(intervalId);
                return false;
            }
            if (isCompleted) {
                clearInterval(intervalId);
                return true;
            }
            await waitFor(30_000);
            isCompleted = await this.tonApi.checkIsTxCompleted(boc);
        }
    }

    constructor(tonProviderCore: TonWalletProviderCore) {
        super(tonProviderCore.address);
        this.tonConnectUI = tonProviderCore.core;
    }
}
