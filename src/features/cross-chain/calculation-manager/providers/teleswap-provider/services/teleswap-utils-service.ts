import { TeleswapSDK } from '@teleportdao/teleswap-sdk';
import { SupportedNetwork } from '@teleportdao/teleswap-sdk/dist/types';
import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';

import { TeleSwapCcrSupportedChain } from '../constants/teleswap-ccr-supported-chains';
import { teleSwapNetworkTickers } from '../constants/teleswap-network-tickers';
import { TELESWAP_REF_CODE } from '../constants/teleswap-ref-code';
import { TeleSwapEstimateResponse } from '../models/teleswap-estimate-response';

export class TeleSwapUtilsService {
    private static bitcoinFeePercent = 0.02;

    public static async createTeleSwapSdkConnection(): Promise<TeleswapSDK> {
        const teleSwapSdk = new TeleswapSDK(false);

        teleSwapSdk.setDefaultNetwork({
            networkName: teleSwapNetworkTickers[BLOCKCHAIN_NAME.POLYGON] as SupportedNetwork,
            web3: {
                url: Injector.web3PublicService.rpcProvider[BLOCKCHAIN_NAME.POLYGON]?.rpcList[0]!
            },
            web3Eth: Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.POLYGON).web3Provider
                .eth
        });

        await teleSwapSdk.initNetworksConnection();

        teleSwapSdk.setThirdPartyId(TELESWAP_REF_CODE);

        return teleSwapSdk;
    }

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
        )) as TeleSwapEstimateResponse;

        const toAmount = new BigNumber(estimation.outputAmount);

        const feeWeiAmount = toAmount.multipliedBy(TeleSwapUtilsService.bitcoinFeePercent);

        return toAmount.minus(feeWeiAmount);
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
