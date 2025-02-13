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
import { TeleSwapEstimateResponse } from '../models/teleswap-estimate-response';

export class TeleSwapUtilsService {
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

        // @TODO get thirdPartyId
        //  teleSwapSdk.setThirdPartyId(10);

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
        const estimation = (await sdk.wrapAndSwapEstimate(
            fromToken.tokenAmount.toFixed(),
            toToken.address,
            teleSwapNetworkTickers[toToken.blockchain] as SupportedNetwork
        )) as TeleSwapEstimateResponse;

        return new BigNumber(estimation.outputAmount);
    }

    private static async calculateBtcOutputWeiAmount(
        fromToken: PriceTokenAmount<TeleSwapCcrSupportedChain>,
        sdk: TeleswapSDK
    ): Promise<BigNumber> {
        const estimation = await sdk.swapAndUnwrapEstimate(
            {
                inputToken: fromToken.address,
                inputAmount: fromToken.stringWeiAmount
            },
            teleSwapNetworkTickers[fromToken.blockchain] as SupportedNetwork
        );

        return new BigNumber(Web3Pure.toWei(estimation.outputAmountBTC, 8));
    }
}
