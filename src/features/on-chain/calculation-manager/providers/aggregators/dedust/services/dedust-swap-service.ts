import {
    Asset,
    Factory,
    JettonRoot,
    MAINNET_FACTORY_ADDR,
    Pool,
    PoolType,
    ReadinessStatus
} from '@dedust/sdk';
import { Address, OpenedContract, Sender, toNano } from '@ton/core';
import { TonClient4 } from '@ton/ton';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { Injector } from 'src/core/injector/injector';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

import { DEDUST_GAS } from '../constants/dedust-gas';

export class DedustSwapService {
    private readonly factory: OpenedContract<Factory>;

    private readonly tonClient: TonClient4;

    constructor() {
        this.tonClient = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.TON).tonClient;
        this.factory = this.tonClient.open(Factory.createFromAddress(MAINNET_FACTORY_ADDR));
    }

    public getFactory(): OpenedContract<Factory> {
        return this.factory;
    }

    public getTonClient(): TonClient4 {
        return this.tonClient;
    }

    public async getPool(fromAsset: Asset, toAsset: Asset): Promise<OpenedContract<Pool>> {
        const pool = this.tonClient.open(
            Pool.createFromAddress(
                await this.factory.getPoolAddress({
                    poolType: PoolType.VOLATILE,
                    assets: [fromAsset, toAsset]
                })
            )
        );

        if ((await pool.getReadinessStatus()) !== ReadinessStatus.READY) {
            throw new Error(`[DedustOnChainProvider_getPool] Pool does not exist.`);
        }

        return pool;
    }

    public getTokenAsset(token: PriceToken): Asset {
        if (token.isNative) return Asset.native();

        const parsedAddress = Address.parse(token.address);
        const openedTokenContract = this.tonClient.open(
            JettonRoot.createFromAddress(parsedAddress)
        );

        return Asset.jetton(openedTokenContract.address);
    }

    public async sendTransaction(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        walletAddress: string,
        options: SwapTransactionOptions
    ): Promise<void> {
        const fromAsset = this.getTokenAsset(from);
        const toAsset = this.getTokenAsset(to);
        const pool = await this.getPool(fromAsset, toAsset);
        const fromAmount = toNano(from.tokenAmount.toFixed());
        const sender: Sender = {
            address: Address.parse(walletAddress),
            send: async () => {}
        };

        const { amountOut: expectedAmountOut } = await pool.getEstimatedSwapOut({
            assetIn: Asset.native(),
            amountIn: fromAmount
        });

        const minAmountOut = (expectedAmountOut * 99n) / 100n;

        if (from.isNative) {
            const nativeVault = this.tonClient.open(await this.factory.getNativeVault());

            await nativeVault.sendSwap(sender, {
                poolAddress: pool.address,
                amount: fromAmount,
                limit: minAmountOut,
                gasAmount: toNano(DEDUST_GAS)
            });
        } else {
        }
    }
}
