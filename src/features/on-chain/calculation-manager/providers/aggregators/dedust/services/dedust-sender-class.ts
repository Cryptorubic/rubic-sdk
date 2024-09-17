import { Address, beginCell, Sender, SenderArguments, storeStateInit } from '@ton/core';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { TonWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-web3-private';
import { Injector } from 'src/core/injector/injector';

export class DedustTxSender implements Sender {
    public readonly address: Address;

    private get web3Private(): TonWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(BLOCKCHAIN_NAME.TON);
    }

    constructor(walletAddress: string, private readonly onHash: (hash: string) => void) {
        this.address = Address.parse(walletAddress);
    }

    public async send(args: SenderArguments): Promise<void> {
        const { to, value, body, init } = args;

        const stateInit = init
            ? beginCell().storeWritable(storeStateInit(init)).endCell().toBoc().toString('base64')
            : undefined;

        const message = {
            address: to.toString(),
            amount: value.toString(),
            payload: body?.toBoc().toString('base64'),
            stateInit
        };

        try {
            await this.web3Private.sendTransaction({
                messages: [message],
                onTransactionHash: this.onHash
            });
        } catch (_) {}
    }
}
