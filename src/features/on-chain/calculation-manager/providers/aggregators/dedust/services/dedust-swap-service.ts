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
import { TonClient } from '@ton/ton';
import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { TonClientInstance } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-client/ton-client';
import { Injector } from 'src/core/injector/injector';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

import { ON_CHAIN_TRADE_TYPE } from '../../../common/models/on-chain-trade-type';
import { DEDUST_GAS_NON_WEI, RUBIC_REF_NAME_FOR_DEDUST } from '../constants/dedust-consts';
import { DedustTxStep } from '../models/dedust-api-types';
import { DedustApiService } from './dedust-api-service';
import { DedustTxSender } from './dedust-sender-class';

export class DedustSwapService {
    private readonly factory: OpenedContract<Factory>;

    private readonly tonClient: TonClient;

    private txSteps: DedustTxStep[] = [];

    private get mainnetFactoryAddress(): Address {
        return MAINNET_FACTORY_ADDR;
    }

    constructor() {
        this.tonClient = TonClientInstance.getInstance();
        this.factory = this.tonClient.open(Factory.createFromAddress(this.mainnetFactoryAddress));
    }

    /**
     * @returns string wei amount
     */
    public async calcOutputAmount(from: PriceTokenAmount, to: PriceToken): Promise<string> {
        if (this.maybeMultistepSwap(from, to)) {
            const pools = await DedustApiService.findBestPools(from, to);
            if (!pools.length) {
                throw new RubicSdkError(
                    '[DedustSwapService_calcOutputAmount] Pools are not found!'
                );
            }

            this.cacheStepsOnCalculation(pools);
            console.log(
                '%cDedust_TransitTokensCount',
                'color: blue; font-size: 20px;',
                pools.length - 1
            );
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
            {
                amountOut: amountOut.toString(),
                poolAddress: pool.address,
                srcTokenAddress: from.address,
                dstTokenAddress: to.address
            }
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
                await this.swapJettonToJetton(from, sender, slippage);
            }
        } catch (err) {
            throw err;
        }
    }

    public isMultistepSwap(): boolean {
        return this.txSteps.length > 1;
    }

    public async getRoutePath(): Promise<RubicStep[]> {
        const promises = this.txSteps.map(async step => {
            const srcToken = Token.createToken({
                address: step.srcTokenAddress,
                blockchain: BLOCKCHAIN_NAME.TON
            });
            const dstToken = Token.createToken({
                address: step.dstTokenAddress,
                blockchain: BLOCKCHAIN_NAME.TON
            });
            return {
                provider: ON_CHAIN_TRADE_TYPE.DEDUST,
                type: 'on-chain',
                path: await Promise.all([srcToken, dstToken])
            };
        });

        const path = await Promise.all(promises);

        return path as RubicStep[];
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
    private maybeMultistepSwap(from: Token, to: Token): boolean {
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
            const status = await pool.getReadinessStatus();

            if (status !== ReadinessStatus.READY) {
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
            const status = await nativeVault.getReadinessStatus();
            if (status !== ReadinessStatus.READY) {
                throw new RubicSdkError('Vault (TON) does not exist.');
            }

            return nativeVault as OpenedContract<T>;
        }

        const parsedAddress = Address.parse(token.address);
        const jettonVault = this.tonClient.open(await this.factory.getJettonVault(parsedAddress));
        const status = await jettonVault.getReadinessStatus();

        if (status !== ReadinessStatus.READY) {
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
            gasAmount: toNano(DEDUST_GAS_NON_WEI),
            queryId: RUBIC_REF_NAME_FOR_DEDUST
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

        await jettonWallet.sendTransfer(sender, toNano(DEDUST_GAS_NON_WEI), {
            amount: BigInt(from.stringWeiAmount),
            destination: jettonVault.address,
            responseAddress: sender.address,
            forwardAmount: toNano(0.15),
            queryId: RUBIC_REF_NAME_FOR_DEDUST,
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

        const payloadParams = {} as SwapStep;
        this.fillPayloadParams(this.txSteps, slippage, payloadParams);
        console.log('%cDedust_Params', 'color: green; font-size: 20px;', payloadParams);

        if (!this.checkSwapPayloadValid(payloadParams)) {
            console.log(
                '%cInvalid_swapPayloadParams',
                'color: red; font-size: 20px;',
                payloadParams
            );
            throw new RubicSdkError(
                'Swap payload for dedust has empty `next` property or undefined `poolAddress`.'
            );
        }

        await jettonWallet.sendTransfer(sender, toNano(DEDUST_GAS_NON_WEI), {
            amount: BigInt(from.stringWeiAmount),
            destination: jettonVault.address,
            responseAddress: sender.address,
            forwardAmount: toNano(0.15),
            queryId: RUBIC_REF_NAME_FOR_DEDUST,
            forwardPayload: VaultJetton.createSwapPayload(payloadParams)
        });
    }

    /**
     * @param next on first iteration - it's payloadParams, then .next
     * @param payloadParams
     * @returns
     */
    private fillPayloadParams(steps: DedustTxStep[], slippage: number, next: SwapStep): void {
        if (!steps.length) return;

        const step = steps[0]!;
        const minAmountOut = BigInt(
            new BigNumber(step.amountOut).multipliedBy(1 - slippage).toFixed(0)
        );

        next.poolAddress = step.poolAddress;
        next.limit = minAmountOut;

        steps.shift();
        if (steps.length) {
            next.next = {} as SwapStep;
            next = next.next;
        }

        return this.fillPayloadParams(steps, slippage, next);
    }

    public checkSwapPayloadValid(payloadParams: SwapStep): boolean {
        let next: SwapStep | undefined = payloadParams;
        while (next) {
            if (!next.poolAddress) return false;
            if (next.next && !Object.keys(next.next).length) return false;
            next = next.next;
        }

        return true;
    }
}
