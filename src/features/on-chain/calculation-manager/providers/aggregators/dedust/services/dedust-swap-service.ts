import {
    Asset,
    Factory,
    JettonRoot,
    Pool,
    PoolType,
    ReadinessStatus,
    VaultJetton,
    VaultNative
} from '@dedust/sdk';
import { Address, OpenedContract, Sender, toNano } from '@ton/core';
import { TonClient } from '@ton/ton';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { DEDUST_GAS } from '../constants/dedust-gas';
import { DedustTxSender } from './dedust-sender-class';

export class DedustSwapService {
    private readonly factory: OpenedContract<Factory>;

    private readonly tonClient: TonClient;

    private get mainnetFactoryAddress(): Address {
        return Address.parse('EQBfBWT7X2BHg9tXAxzhz2aKiNTU1tpt5NsiK0uSDW_YAJ67');
    }

    constructor() {
        this.tonClient = new TonClient({
            endpoint: 'https://toncenter.com/api/v2/jsonRPC',
            apiKey: '44176ed3735504c6fb1ed3b91715ba5272cdd2bbb304f78d1ae6de6aed47d284'
        });
        this.factory = this.tonClient.open(Factory.createFromAddress(this.mainnetFactoryAddress));
    }

    /**
     * @returns weiAmount in BigNumber format
     */
    public async calcOutputAmount(from: PriceTokenAmount, to: PriceToken): Promise<string> {
        if (this.isMultihopSwap(from, to)) {
            const ton = nativeTokensList[BLOCKCHAIN_NAME.TON];
            const firstPoolSrcAsset = this.getTokenAsset(from);
            const secondPoolSrcAsset = this.getTokenAsset(ton);

            const firstPool = await this.getPool(from, ton);
            const secondPool = await this.getPool(ton, to);

            const { amountOut: firstPoolAmountOut } = await firstPool.getEstimatedSwapOut({
                assetIn: firstPoolSrcAsset,
                amountIn: toNano(from.tokenAmount.toFixed())
            });

            const { amountOut } = await secondPool.getEstimatedSwapOut({
                assetIn: secondPoolSrcAsset,
                amountIn: firstPoolAmountOut
            });

            return amountOut.toString();
        }

        const fromAsset = this.getTokenAsset(from);
        const pool = await this.getPool(from, to);
        const { amountOut } = await pool.getEstimatedSwapOut({
            assetIn: fromAsset,
            amountIn: toNano(from.tokenAmount.toFixed())
        });

        return amountOut.toString();
    }

    public async sendTransaction(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        walletAddress: string,
        slippage: number,
        onHash: (hash: string) => void
    ): Promise<void> {
        const sender: Sender = new DedustTxSender(walletAddress, onHash);
        const minAmountOut = BigInt(to.tokenAmount.multipliedBy(1 - slippage).toFixed());

        if (from.isNative) {
            await this.swapTonToJetton(from, to, sender, minAmountOut);
        } else if (to.isNative) {
            await this.swapJettonToTon(from, to, sender, minAmountOut);
        } else {
            await this.swapJettonsWithMultihop(from, to, sender, minAmountOut);
        }
    }

    /**
     * uses more than 1 pool
     */
    private isMultihopSwap(from: Token, to: Token): boolean {
        return !from.isNative && !to.isNative;
    }

    private async getPool(from: Token, to: Token): Promise<OpenedContract<Pool>> {
        try {
            const fromAsset = this.getTokenAsset(from);
            const toAsset = this.getTokenAsset(to);

            const poolAddress = await this.factory.getPoolAddress({
                poolType: PoolType.VOLATILE,
                assets: [fromAsset, toAsset]
            });
            const pool = this.tonClient.open(Pool.createFromAddress(poolAddress));

            if ((await pool.getReadinessStatus()) !== ReadinessStatus.READY) {
                throw new Error(`[DedustSwapService_getPool] Pool does not exist.`);
            }

            return pool;
        } catch (err) {
            throw err;
        }
    }

    private getTokenAsset(token: Token): Asset {
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

    private async swapTonToJetton(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        sender: Sender,
        minAmountOut: bigint
    ): Promise<void> {
        const pool = await this.getPool(from, to);
        const nativeVault = await this.getVault<VaultNative>(from);
        const fromAmount = toNano(from.tokenAmount.toFixed());

        await nativeVault.sendSwap(sender, {
            poolAddress: pool.address,
            amount: fromAmount,
            limit: minAmountOut,
            gasAmount: toNano(DEDUST_GAS)
        });
    }

    private async swapJettonToTon(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        sender: Sender,
        minAmountOut: bigint
    ): Promise<void> {
        const pool = await this.getPool(from, to);
        const jettonVault = await this.getVault<VaultJetton>(from);
        const parsedAddress = Address.parse(from.address);
        const jettonRoot = this.tonClient.open(JettonRoot.createFromAddress(parsedAddress));
        const jettonWallet = this.tonClient.open(await jettonRoot.getWallet(sender.address!));

        await jettonWallet.sendTransfer(sender, toNano(0.3), {
            amount: toNano(from.tokenAmount.toFixed()),
            destination: jettonVault.address,
            responseAddress: sender.address,
            forwardAmount: toNano(0.25),
            forwardPayload: VaultJetton.createSwapPayload({
                poolAddress: pool.address,
                limit: minAmountOut
            })
        });
    }

    private async swapJettonsWithMultihop(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        sender: Sender,
        minAmountOut: bigint
    ): Promise<void> {
        const ton = nativeTokensList[BLOCKCHAIN_NAME.TON];
        const firstPool = await this.getPool(from, ton);
        const secondPool = await this.getPool(ton, to);

        const jettonVault = await this.getVault<VaultJetton>(from);
        const parsedAddress = Address.parse(from.address);
        const jettonRoot = this.tonClient.open(JettonRoot.createFromAddress(parsedAddress));
        const jettonWallet = this.tonClient.open(await jettonRoot.getWallet(sender.address!));

        await jettonWallet.sendTransfer(sender, toNano('0.3'), {
            amount: toNano(from.tokenAmount.toFixed()),
            destination: jettonVault.address,
            responseAddress: sender.address,
            forwardAmount: toNano('0.25'),
            forwardPayload: VaultJetton.createSwapPayload({
                poolAddress: firstPool.address,
                limit: minAmountOut,
                next: {
                    poolAddress: secondPool.address
                }
            })
        });
    }
}
