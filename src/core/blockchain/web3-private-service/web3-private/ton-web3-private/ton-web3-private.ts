import { beginCell, toNano } from '@ton/ton';
import { TonConnectUI } from '@tonconnect/ui';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TonWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/ton-web3-pure/ton-web3-pure';
import { TonWalletProviderCore } from 'src/core/sdk/models/wallet-provider';

import { EvmWeb3Private } from '../evm-web3-private/evm-web3-private';
import { Web3Error } from '../models/web3.error';
import { Web3Private } from '../web3-private';
import { TonTransactionOptions } from './models/ton-types';

export class TonWeb3Private extends Web3Private {
    protected readonly Web3Pure = TonWeb3Pure;

    private readonly tonConnectUI: TonConnectUI;

    public async getBlockchainName(): Promise<BlockchainName> {
        return BLOCKCHAIN_NAME.TON;
    }

    public async sendTransaction(options: TonTransactionOptions): Promise<string> {
        try {
            const body = beginCell()
                .storeUint(0, 32) // write 32 zero bits to indicate that a text comment will follow
                .storeStringTail('Hello, TON!') // write our text comment
                .storeDict()
                .endCell();

            const { boc } = await this.tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 360,
                messages: [
                    {
                        address: options.to || this.address,
                        amount: options.transferAmount || toNano(0.05).toString(),
                        payload: body.toBoc().toString('base64') // payload with comment in body
                    }
                ]
            });
            options.onTransactionHash?.(boc);
            return boc;
        } catch (err) {
            console.error(`Send transaction error. ${err}`);
            throw EvmWeb3Private.parseError(err as Web3Error);
        }
    }

    constructor(private readonly tonProviderCore: TonWalletProviderCore) {
        super(tonProviderCore.address);
        this.tonConnectUI = tonProviderCore.core;
    }
}
