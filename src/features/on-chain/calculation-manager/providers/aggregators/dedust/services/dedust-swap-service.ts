import {
    Asset,
    Factory,
    JettonRoot,
    JettonWallet,
    MAINNET_FACTORY_ADDR,
    Pool,
    PoolType,
    ReadinessStatus,
    SwapStep,
    VaultJetton,
    VaultNative
} from '@dedust/sdk';
import { Address, beginCell, OpenedContract, Sender, toNano } from '@ton/core';
import BigNumber from 'bignumber.js';
import { LowSlippageError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { TonClientInstance } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-client/ton-client-instance';
import { Injector } from 'src/core/injector/injector';

import { DEDUST_GAS } from '../constants/dedust-gas';
import { DedustTxStep } from '../models/dedust-api-types';
import { DedustApiService } from './dedust-api-service';
import { DedustTxSender } from './dedust-sender-class';

export class DedustSwapService {
    private readonly factory: OpenedContract<Factory>;

    private readonly tonClient = TonClientInstance.getInstance();

    private txSteps: DedustTxStep[] = [];

    private get mainnetFactoryAddress(): Address {
        return MAINNET_FACTORY_ADDR;
    }

    constructor() {
        this.factory = this.tonClient.open(Factory.createFromAddress(this.mainnetFactoryAddress));
    }

    /**
     *     this.httpService
            .post(
                '',
                {
                    from: 'jetton:0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe',
                    to: 'jetton:0:c95e05ef7644c21b437af9ee81d7e7e5d54d4b9cf1cc629aa2a3750403d28067',
                    amount: '10000000'
                },
                'https://api.dedust.io/v2/routing/plan'
            )
            .pipe(delay(4000))
            .subscribe(val => console.log('DEDUST_SUB_RESULT ===> ', val));
     */

    /**
     * @returns string wei amount
     */
    public async calcOutputAmount(from: PriceTokenAmount, to: PriceToken): Promise<string> {
        if (this.maybeMultihopSwap(from, to)) {
            const pools = await DedustApiService.findBestPools(from, to);
            if (!pools.length) {
                throw new RubicSdkError(
                    '[DedustSwapService_calcOutputAmount] Pools are not found!'
                );
            }

            this.cacheStepsOnCalculation(pools);
            const outputWeiAmountString = pools.at(-1)!.amountOut;

            return outputWeiAmountString;
        }

        const fromAsset = this.getTokenAsset(from);
        const pool = await this.getPool(from, to);
        const { amountOut } = await pool.getEstimatedSwapOut({
            assetIn: fromAsset,
            amountIn: BigInt(from.stringWeiAmount)
        });

        this.cacheStepsOnCalculation([
            { amountOut: amountOut.toString(), poolAddress: pool.address }
        ]);

        return amountOut.toString();
    }

    public async sendTransaction(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        walletAddress: string,
        slippage: number,
        onHash: (hash: string) => void
    ): Promise<void> {
        const web3Private = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.TON);
        const sender: Sender = new DedustTxSender(walletAddress, web3Private, onHash);
        const minAmountOut = BigInt(to.weiAmount.multipliedBy(1 - slippage).toFixed(0));

        try {
            if (from.isNative) {
                await this.swapTonToJetton(from, sender, minAmountOut);
            } else if (to.isNative) {
                await this.swapJettonToTon(from, sender, minAmountOut);
            } else {
                if (slippage < 0.1) throw new LowSlippageError(0.1);
                await this.swapJettonToJetton(from, sender, slippage);
            }
        } catch (err) {
            throw err;
        }
    }

    /**
     * Stores found pools in calcOutputAmount method and reuses its in sendTransaction methods
     */
    private cacheStepsOnCalculation(steps: DedustTxStep[]): void {
        this.txSteps = steps;
    }

    /**
     * maybe uses more than 1 pool
     */
    private maybeMultihopSwap(from: Token, to: Token): boolean {
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
        sender: Sender,
        minAmountOut: bigint
    ): Promise<void> {
        const poolAddress = this.txSteps[0]!.poolAddress;
        const nativeVault = await this.getVault<VaultNative>(from);
        const fromAmount = toNano(from.tokenAmount.toFixed());

        await nativeVault.sendSwap(sender, {
            poolAddress,
            amount: fromAmount,
            limit: minAmountOut,
            gasAmount: toNano(DEDUST_GAS)
        });
    }

    private async swapJettonToTon(
        from: PriceTokenAmount,
        sender: Sender,
        minAmountOut: bigint
    ): Promise<void> {
        const poolAddress = this.txSteps[0]!.poolAddress;
        const jettonVault = await this.getVault<VaultJetton>(from);
        const parsedAddress = Address.parse(from.address);

        const result = await this.tonClient.runMethod(parsedAddress, 'get_wallet_address', [
            { type: 'slice', cell: beginCell().storeAddress(sender.address).endCell() }
        ]);
        const jettonWalletAddress = result.stack.readAddress();
        const jettonWallet = this.tonClient.open(
            JettonWallet.createFromAddress(jettonWalletAddress)
        );

        await jettonWallet.sendTransfer(sender, toNano(DEDUST_GAS), {
            amount: BigInt(from.stringWeiAmount),
            destination: jettonVault.address,
            responseAddress: sender.address,
            forwardAmount: toNano(0.15),
            forwardPayload: VaultJetton.createSwapPayload({
                poolAddress,
                limit: minAmountOut
            })
        });
    }

    private async swapJettonToJetton(
        from: PriceTokenAmount,
        sender: Sender,
        slippage: number
    ): Promise<void> {
        const jettonVault = await this.getVault<VaultJetton>(from);
        const parsedAddress = Address.parse(from.address);
        const jettonRoot = this.tonClient.open(JettonRoot.createFromAddress(parsedAddress));
        const jettonWallet = this.tonClient.open(await jettonRoot.getWallet(sender.address!));

        const initParams = {
            poolAddress: this.txSteps[0]!.poolAddress,
            limit: BigInt(this.txSteps[0]!.amountOut),
            next: {}
        } as SwapStep;

        const swapPayloadParams = this.makeSwapPayloadParams(
            initParams,
            initParams.next!,
            this.txSteps,
            slippage
        );

        await jettonWallet.sendTransfer(sender, toNano(DEDUST_GAS), {
            amount: BigInt(from.stringWeiAmount),
            destination: jettonVault.address,
            responseAddress: sender.address,
            forwardAmount: toNano(0.15),
            forwardPayload: VaultJetton.createSwapPayload(swapPayloadParams)
        });
    }

    private makeSwapPayloadParams(
        payloadParams: SwapStep,
        next: SwapStep,
        txSteps: DedustTxStep[],
        slippage: number
    ): SwapStep {
        if (!txSteps.length) return payloadParams;

        const step = txSteps[0]!;
        const isFirstStep = txSteps.length === this.txSteps.length;
        const minAmountOut = BigInt(
            new BigNumber(step.amountOut).multipliedBy(1 - slippage).toFixed(0)
        );

        if (isFirstStep) {
            payloadParams.poolAddress = step.poolAddress;
            payloadParams.limit = minAmountOut;
        } else {
            next.poolAddress = step.poolAddress;
            next.limit = minAmountOut;
        }

        const slicedSteps = txSteps.slice(1);
        if (slicedSteps.length && !isFirstStep) {
            next.next = {} as SwapStep;
            next = next.next;
        }

        return this.makeSwapPayloadParams(payloadParams, next, slicedSteps, slippage);
    }
}
