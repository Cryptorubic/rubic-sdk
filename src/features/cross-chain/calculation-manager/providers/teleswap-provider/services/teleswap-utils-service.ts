import { TeleswapSDK } from '@teleportdao/teleswap-sdk';
import { SupportedNetwork } from '@teleportdao/teleswap-sdk/dist/types';
import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

import { TeleSwapCcrSupportedChain } from '../constants/teleswap-ccr-supported-chains';
import { teleSwapNetworkTickers } from '../constants/teleswap-network-tickers';
import {
    TeleSwapEstimateNativeResponse,
    TeleSwapEstimateResponse
} from '../models/teleswap-estimate-response';

export class TeleSwapUtilsService {
    private static readonly bitcoinFeePercent = 0.02;

    public static async calculateOutputWeiAmount(
        fromToken: PriceTokenAmount<TeleSwapCcrSupportedChain>,
        toToken: PriceToken<TeleSwapCcrSupportedChain>,
        teleSwapSdk: TeleswapSDK
    ): Promise<BigNumber> {
        const fromChainType = BlockchainsInfo.getChainType(fromToken.blockchain);

        if (fromChainType === CHAIN_TYPE.EVM) {
            return TeleSwapUtilsService.calculateBtcOutputWeiAmount(fromToken, teleSwapSdk);
        }

        return TeleSwapUtilsService.calculateEvmOutputWeiAmount(fromToken, toToken, teleSwapSdk);
    }

    private static async calculateEvmOutputWeiAmount(
        fromToken: PriceTokenAmount,
        toToken: PriceToken<TeleSwapCcrSupportedChain>,
        sdk: TeleswapSDK
    ): Promise<BigNumber> {
        const toTokenAddress = TeleSwapUtilsService.getTokenAddress(toToken);

        const estimation = (await sdk.wrapAndSwapEstimate(
            fromToken.tokenAmount.toFixed(),
            teleSwapNetworkTickers[toToken.blockchain] as SupportedNetwork,
            toTokenAddress!
        )) as TeleSwapEstimateResponse | TeleSwapEstimateNativeResponse;

        const toAmount = new BigNumber(
            'outputAmount' in estimation ? estimation.outputAmount : estimation.outputAmountBTC
        );

        // const feeWeiAmount = toAmount.multipliedBy(TeleSwapUtilsService.bitcoinFeePercent);

        return toAmount;
    }

    private static async calculateBtcOutputWeiAmount(
        fromToken: PriceTokenAmount<TeleSwapCcrSupportedChain>,
        sdk: TeleswapSDK
    ): Promise<BigNumber> {
        const fromTokenAddress = TeleSwapUtilsService.getTokenAddress(fromToken);
        const estimation = await sdk.swapAndUnwrapEstimate(
            {
                inputAmount: fromToken.stringWeiAmount,
                ...(fromTokenAddress && { inputToken: fromTokenAddress })
            },
            teleSwapNetworkTickers[fromToken.blockchain] as SupportedNetwork
        );

        return new BigNumber(Web3Pure.toWei(estimation.outputAmountBTC, 8));
    }

    public static getTokenAddress(token: PriceToken): string | null {
        if (token.isNative) {
            return null;
        }

        return token.address;
    }
}
