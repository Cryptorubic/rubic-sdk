import { Address } from '@ton/core';
import {
    computePoolAddress,
    PoolMessageManager,
    PoolV3Contract,
    ROUTER,
    SwapType,
    TickMath
} from '@toncodex/sdk';
import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { TonClientInstance } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-client/ton-client';
import { Injector } from 'src/core/injector/injector';

import { ToncoCommonParams } from '../models/tonco-facade-types';

export class ToncoSdkFacade {
    public static async calculateAmountOut(
        params: ToncoCommonParams,
        srcToken: PriceTokenAmount
    ): Promise<BigNumber> {
        const poolV3Contract = TonClientInstance.getInstance().open(
            new PoolV3Contract(params.poolAddress)
        );

        const amountIn = BigInt(srcToken.stringWeiAmount);

        if (params.zeroToOne) {
            const estimate = await poolV3Contract.getSwapEstimate(
                params.zeroToOne,
                amountIn,
                BigInt(TickMath.MIN_SQRT_RATIO.toString()) + BigInt(1)
            );

            return new BigNumber(-estimate.amount1.toString());
        } else {
            const estimate = await poolV3Contract.getSwapEstimate(
                params.zeroToOne,
                amountIn,
                BigInt(TickMath.MAX_SQRT_RATIO.toString()) - BigInt(1)
            );

            return new BigNumber(-estimate.amount0.toString());
        }
    }

    public static async createTxParams(): Promise<void> {}

    public static async estimateGas(
        params: ToncoCommonParams,
        fromAmountWei: BigNumber,
        toMinAmountWei: BigNumber
    ): Promise<BigNumber> {
        const web3Private = Injector.web3PrivateService.getWeb3Private(BLOCKCHAIN_NAME.TON);
        const walletAddress = web3Private.address;
        const parsedWalletAddress = Address.parse(walletAddress);

        const priceLimitSqrt = params.zeroToOne
            ? BigInt(TickMath.MIN_SQRT_RATIO.toString()) + 1n
            : BigInt(TickMath.MAX_SQRT_RATIO.toString()) - 1n;

        const emulation = await PoolMessageManager.createEmulatedSwapExactInMessage(
            params.jettonWallets.srcUserJettonWallet,
            params.jettonWallets.dstRouterJettonWallet,
            parsedWalletAddress,
            BigInt(fromAmountWei.toFixed()),
            BigInt(toMinAmountWei.toFixed()),
            priceLimitSqrt,
            params.swapType
        );

        return new BigNumber(emulation.gasLimit.toString());
    }

    public static async fetchCommonParams(
        srcToken: PriceTokenAmount,
        dstToken: PriceToken
    ): Promise<ToncoCommonParams> {
        const web3Private = Injector.web3PrivateService.getWeb3Private(BLOCKCHAIN_NAME.TON);
        const walletAddress = web3Private.address;

        const parsedRouterAddress = Address.parse(ROUTER);
        const parsedWalletAddress = Address.parse(walletAddress);
        const parsedSrcAddress = Address.parse(srcToken.address);
        const parsedDstAddress = Address.parse(dstToken.address);

        const [srcRouterJettonWallet, dstRouterJettonWallet, srcUserJettonWallet] =
            await Promise.all([
                web3Private.getWalletAddress(parsedRouterAddress, parsedSrcAddress),
                web3Private.getWalletAddress(parsedRouterAddress, parsedDstAddress),
                web3Private.getWalletAddress(parsedWalletAddress, parsedSrcAddress)
            ]);

        const poolAddress = computePoolAddress(srcRouterJettonWallet, dstRouterJettonWallet);
        const poolV3Contract = TonClientInstance.getInstance().open(
            new PoolV3Contract(poolAddress)
        );

        const { jetton0_minter } = await poolV3Contract.getPoolStateAndConfiguration();
        const zeroToOne = Address.parse(srcToken.address).equals(jetton0_minter);
        const swapType = this.getSwapType(srcToken, dstToken);

        return {
            jettonWallets: { srcRouterJettonWallet, dstRouterJettonWallet, srcUserJettonWallet },
            zeroToOne,
            swapType,
            poolAddress
        };
    }

    private static getSwapType(srcToken: Token, dstToken: Token): SwapType {
        if (srcToken.isNative) return SwapType.TON_TO_JETTON;
        if (dstToken.isNative) return SwapType.JETTON_TO_TON;
        return SwapType.JETTON_TO_JETTON;
    }
}
