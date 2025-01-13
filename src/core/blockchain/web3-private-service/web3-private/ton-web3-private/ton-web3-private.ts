import { Address, beginCell, toNano } from '@ton/core';
import { TonConnectUI } from '@tonconnect/ui';
import { RubicSdkError, UserRejectError } from 'src/common/errors';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { parseError } from 'src/common/utils/errors';
import { waitFor } from 'src/common/utils/waitFor';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TonApiService } from 'src/core/blockchain/services/ton/tonapi-service';
import { BasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';
import { TonWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/ton-web3-pure/ton-web3-pure';
import { TonWalletProviderCore } from 'src/core/sdk/models/wallet-provider';

import { Web3Private } from '../web3-private';
import { TonEncodedConfig, TonTransactionOptions } from './models/ton-types';

export class TonWeb3Private extends Web3Private {
    protected readonly Web3Pure = TonWeb3Pure;

    private readonly tonApi: TonApiService = new TonApiService();

    private readonly tonConnectUI: TonConnectUI;

    public getBlockchainName(): Promise<BlockchainName> {
        return Promise.resolve(BLOCKCHAIN_NAME.TON);
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
                throw new RubicSdkError('[BitcoinWeb3Private] TON transaction timeout expired!');
            }

            return boc;
        } catch (err) {
            console.error(`Send transaction error. ${err}`);
            if (err.message.includes('Reject request')) {
                throw new UserRejectError();
            }

            throw parseError(err);
        }
    }

    /**
     * Transfer asset from on wallet to another
     * @param tokenAddress Token address to transfer
     * @param walletAddress Wallet address to transfer from
     * @param receiver Receiver wallet address
     * @param amount Transfer amount
     * @param options Transaction options
     */
    public transferAsset(
        tokenAddress: string,
        walletAddress: string,
        receiver: string,
        amount: string,
        options?: BasicTransactionOptions
    ): Promise<string> {
        if (compareAddresses(nativeTokensList.TON.address, tokenAddress)) {
            return this.transferNative(receiver, amount, options);
        }
        return this.transferJetton(tokenAddress, walletAddress, receiver, amount, options);
    }

    private transferNative(
        receiver: string,
        amount: string,
        options?: BasicTransactionOptions
    ): Promise<string> {
        const transferAmount = BigInt(amount);
        const encodeConfig: TonEncodedConfig = {
            address: receiver,
            amount: transferAmount.toString()
        };

        return this.sendTransaction({ ...options, messages: [encodeConfig] });
    }

    private async transferJetton(
        tokenAddress: string,
        walletAddress: string,
        receiver: string,
        amount: string,
        options?: BasicTransactionOptions
    ): Promise<string> {
        const fromAddress = Address.parse(walletAddress);
        const contractAddress = Address.parse(tokenAddress);
        const transferAmount = BigInt(amount);
        const receiverAddress = Address.parse(receiver);

        const jettonWalletAddress = await TonWeb3Pure.getWalletAddress(
            fromAddress,
            contractAddress
        );

        const body = beginCell()
            .storeUint(0xf8a7ea5, 32)
            .storeUint(0, 64)
            .storeCoins(transferAmount)
            .storeAddress(receiverAddress)
            .storeAddress(receiverAddress)
            .storeBit(0)
            .storeCoins(toNano('0.02'))
            .storeBit(0)
            .endCell();

        const encodeConfig: TonEncodedConfig = {
            address: jettonWalletAddress.toRawString(),
            amount: toNano('0.05').toString(),
            payload: body.toBoc().toString('base64')
        };

        return this.sendTransaction({ ...options, messages: [encodeConfig] });
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
    }
}
