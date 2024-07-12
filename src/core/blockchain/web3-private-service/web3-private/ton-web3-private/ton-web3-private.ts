import { TonConnectUI } from '@tonconnect/ui';
import { waitFor } from 'src/common/utils/waitFor';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    TONAPI_STATUS_ERROR_MAP,
    TONAPI_TX_STATUS,
    TonApiTxStatus
} from 'src/core/blockchain/models/ton/tonapi-statuses';
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
            options.onTransactionHash?.(boc);
            const txStatus = await this.waitForTransactionReceipt(boc);
            if (txStatus !== TONAPI_TX_STATUS.SUCCESS) {
                throw TONAPI_STATUS_ERROR_MAP[txStatus];
            }
            return boc;
        } catch (err) {
            console.error(`Send transaction error. ${err}`);
            throw EvmWeb3Private.parseError(err as Web3Error);
        }
    }

    private async waitForTransactionReceipt(
        boc: string
    ): Promise<Exclude<TonApiTxStatus, 'PENDING'>> {
        let status: TonApiTxStatus = TONAPI_TX_STATUS.PENDING;
        let durationInSecs = 0;
        const durationLimit = 180;
        const intervalId = setInterval(() => durationInSecs++, 3_000);
        while (true) {
            if (durationInSecs > durationLimit) {
                clearInterval(intervalId);
                return TONAPI_TX_STATUS.TIMEOUT;
            }
            if (status !== TONAPI_TX_STATUS.PENDING) {
                clearInterval(intervalId);
                return status;
            }
            await waitFor(5_000);
            status = await this.tonApi.getTxStatus(boc);
        }
    }

    constructor(private readonly tonProviderCore: TonWalletProviderCore) {
        super(tonProviderCore.address);
        this.tonConnectUI = tonProviderCore.core;
    }
}
