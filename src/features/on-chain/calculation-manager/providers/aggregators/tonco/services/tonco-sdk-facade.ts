import { Address } from '@ton/core';
import {
    computePoolAddress,
    PoolMessageManager,
    PoolV3Contract,
    pTON_ROUTER_WALLET,
    ROUTER,
    SwapType,
    TickMath
} from '@toncodex/sdk';
import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { TonClientInstance } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-client/ton-client';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';

import { FAKE_TON_ADDRESS } from '../../coffee-swap/constants/fake-ton-wallet';
import { STONFI_REFERRAL_ADDRESS } from '../../stonfi/constants/addresses';
import { convertTxParamsToTonConfig } from '../../stonfi/utils/convert-params-to-ton-config';
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

    public static async createTonConfig(
        params: ToncoCommonParams,
        fromAmountWei: BigNumber,
        toMinAmountWei: BigNumber
    ): Promise<TonEncodedConfig> {
        try {
            const web3Private = Injector.web3PrivateService.getWeb3Private(BLOCKCHAIN_NAME.TON);
            const walletAddress = web3Private.address;
            const parsedWalletAddress = Address.parse(walletAddress);

            const priceLimitSqrt = params.zeroToOne
                ? BigInt(TickMath.MIN_SQRT_RATIO.toString()) + 1n
                : BigInt(TickMath.MAX_SQRT_RATIO.toString()) - 1n;

            const txParams = await PoolMessageManager.createSwapExactInMessage(
                params.jettonWallets.srcUserJettonWallet,
                params.jettonWallets.dstRouterJettonWallet,
                parsedWalletAddress,
                BigInt(fromAmountWei.toFixed(0)),
                BigInt(toMinAmountWei.toFixed(0)),
                priceLimitSqrt,
                params.swapType
            );

            return convertTxParamsToTonConfig(txParams);
        } catch (err) {
            throw err;
        }
    }

    /**
     * @returns gasLimit non wei
     */
    public static async estimateGas(
        params: ToncoCommonParams,
        fromAmountWei: BigNumber,
        toMinAmountWei: BigNumber
    ): Promise<BigNumber> {
        const web3Private = Injector.web3PrivateService.getWeb3Private(BLOCKCHAIN_NAME.TON);
        const walletAddress = web3Private.address ?? FAKE_TON_ADDRESS;
        const parsedWalletAddress = Address.parse(walletAddress);

        const priceLimitSqrt = params.zeroToOne
            ? BigInt(TickMath.MIN_SQRT_RATIO.toString()) + 1n
            : BigInt(TickMath.MAX_SQRT_RATIO.toString()) - 1n;

        const emulation = await PoolMessageManager.createEmulatedSwapExactInMessage(
            params.jettonWallets.srcUserJettonWallet,
            params.jettonWallets.dstRouterJettonWallet,
            parsedWalletAddress,
            BigInt(fromAmountWei.toFixed(0)),
            BigInt(toMinAmountWei.toFixed(0)),
            priceLimitSqrt,
            params.swapType
        );

        const nativeTon = nativeTokensList[BLOCKCHAIN_NAME.TON];
        const gasLimit = Web3Pure.fromWei(emulation.gasLimit.toString(), nativeTon.decimals);

        return gasLimit;
    }

    public static async fetchCommonParams(
        srcToken: PriceTokenAmount,
        dstToken: PriceToken
    ): Promise<ToncoCommonParams> {
        const web3Private = Injector.web3PrivateService.getWeb3Private(BLOCKCHAIN_NAME.TON);
        const walletAddress = web3Private.address ?? FAKE_TON_ADDRESS;

        const parsedRouterAddress = Address.parse(ROUTER);
        const parsedWalletAddress = Address.parse(walletAddress);

        let srcRouterJettonWallet: Address;
        let dstRouterJettonWallet: Address;
        let srcUserJettonWallet: Address;

        if (srcToken.isNative) {
            const parsedDstAddress = Address.parse(dstToken.address);

            [srcRouterJettonWallet, dstRouterJettonWallet, srcUserJettonWallet] = await Promise.all(
                [
                    Promise.resolve(Address.parse(pTON_ROUTER_WALLET)),
                    web3Private.getWalletAddress(parsedRouterAddress, parsedDstAddress),
                    // tonco-sdk internally echanges userJettonWallet if src token is native
                    Promise.resolve(Address.parse(STONFI_REFERRAL_ADDRESS))
                ]
            );
        } else if (dstToken.isNative) {
            const parsedSrcAddress = Address.parse(srcToken.address);

            [srcRouterJettonWallet, dstRouterJettonWallet, srcUserJettonWallet] = await Promise.all(
                [
                    web3Private.getWalletAddress(parsedRouterAddress, parsedSrcAddress),
                    Promise.resolve(Address.parse(pTON_ROUTER_WALLET)),
                    web3Private.getWalletAddress(parsedWalletAddress, parsedSrcAddress)
                ]
            );
        } else {
            const parsedSrcAddress = Address.parse(srcToken.address);
            const parsedDstAddress = Address.parse(dstToken.address);

            [srcRouterJettonWallet, dstRouterJettonWallet, srcUserJettonWallet] = await Promise.all(
                [
                    web3Private.getWalletAddress(parsedRouterAddress, parsedSrcAddress),
                    web3Private.getWalletAddress(parsedRouterAddress, parsedDstAddress),
                    web3Private.getWalletAddress(parsedWalletAddress, parsedSrcAddress)
                ]
            );
        }

        const poolAddress = computePoolAddress(srcRouterJettonWallet, dstRouterJettonWallet);

        console.log('%c walletAddresses', 'color: pink; font-size: 24px;', {
            srcRouterJettonWallet: {
                rawString: srcRouterJettonWallet.toRawString(),
                string: srcRouterJettonWallet.toString()
            },
            dstRouterJettonWallet: {
                rawString: dstRouterJettonWallet.toRawString(),
                string: dstRouterJettonWallet.toString()
            },
            srcUserJettonWallet: {
                rawString: srcUserJettonWallet.toRawString(),
                string: srcUserJettonWallet.toString()
            }
        });

        const poolV3Contract = TonClientInstance.getInstance().open(
            new PoolV3Contract(poolAddress)
        );

        const { jetton0_minter } = await poolV3Contract.getPoolStateAndConfiguration();

        // @TODO zeroToOne for scrToken native
        const zeroToOne = srcToken.isNative
            ? Address.parse(pTON_ROUTER_WALLET).equals(jetton0_minter)
            : Address.parse(srcToken.address).equals(jetton0_minter);
        const swapType = this.getSwapType(srcToken, dstToken);

        return {
            jettonWallets: { srcRouterJettonWallet, dstRouterJettonWallet, srcUserJettonWallet },
            zeroToOne,
            swapType,
            poolAddress: poolAddress
        };
    }

    private static getSwapType(srcToken: Token, dstToken: Token): SwapType {
        if (srcToken.isNative) return SwapType.TON_TO_JETTON;
        if (dstToken.isNative) return SwapType.JETTON_TO_TON;
        return SwapType.JETTON_TO_JETTON;
    }
}
