import { BitcoinAdapter } from '@cryptorubic/web3';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';
import { BitcoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/bitcoin-web3-pure';
import { Injector } from 'src/core/injector/injector';
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

    protected get bitcoinAdapter(): BitcoinAdapter {
        return Injector.adapterFactory.getAdapter(BLOCKCHAIN_NAME.BITCOIN);
    }

    public async transfer(
        txConfig: BitcoinTransferEncodedConfig,
        options?: BasicTransactionOptions
    ): Promise<string> {
        try {
            const hash = await this.bitcoinAdapter.transfer(
                txConfig.to,
                txConfig.value,
                this.address,
                txConfig.data,
                options
            );
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
    ): Promise<string> {
        try {
            const hash = await this.bitcoinAdapter.sendPsbtTransaction(
                txConfig.psbt,
                this.address,
                txConfig.signInputs,
                options
            );
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
