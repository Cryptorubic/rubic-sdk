import {
    Asset,
    Factory,
    JettonRoot,
    MAINNET_FACTORY_ADDR,
    Pool,
    PoolType,
    ReadinessStatus,
    VaultJetton,
    VaultNative
} from '@dedust/sdk';
import { Address, OpenedContract, Sender, toNano } from '@ton/core';
import { TonClient4 } from '@ton/ton';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { Injector } from 'src/core/injector/injector';

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

    private async getVault<T extends VaultNative | VaultJetton>(
        token: PriceToken
    ): Promise<OpenedContract<T>> {
        if (token.isNative) {
            const nativeVault = this.tonClient.open(await this.factory.getNativeVault());
            if ((await nativeVault.getReadinessStatus()) !== ReadinessStatus.READY) {
                throw new RubicSdkError('Vault (TON) does not exist.');
            }

            return nativeVault as OpenedContract<T>;
        }

        const parsedAddress = Address.parse(token.address);
        const jettonVault = this.tonClient.open(await this.factory.getJettonVault(parsedAddress));

        if ((await jettonVault.getReadinessStatus()) !== ReadinessStatus.READY) {
            throw new Error(`Vault (${token.symbol}) does not exist.`);
        }

        return jettonVault as OpenedContract<T>;
    }

    public async sendTransaction(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        walletAddress: string,
        onHash: (hash: string) => void
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
            const nativeVault = await this.getVault<VaultNative>(from);
            // const nativeVault = this.tonClient.open(await this.factory.getNativeVault());

            await nativeVault.sendSwap(sender, {
                poolAddress: pool.address,
                amount: fromAmount,
                limit: minAmountOut,
                gasAmount: toNano(DEDUST_GAS)
            });
            // @TODO set correct Hash;
            onHash('');
        } else {
            const jettonVault = await this.getVault<VaultJetton>(from);
            const parsedAddress = Address.parse(from.address);
            const jettonRoot = this.tonClient.open(JettonRoot.createFromAddress(parsedAddress));
            const jettonWallet = this.tonClient.open(await jettonRoot.getWallet(sender.address!));

            await jettonWallet.sendTransfer(sender);
            // @TODO set correct Hash;
            onHash('');
        }
    }
}
