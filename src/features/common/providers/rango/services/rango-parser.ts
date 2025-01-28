import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';

import { RangoBestRouteRequestOptions } from '../models/rango-api-best-route-types';
import { RangoSwapRequestOptions } from '../models/rango-api-swap-types';
import { RangoTradeType, RUBIC_TO_RANGO_PROVIDERS } from '../models/rango-api-trade-types';
import {
    RangoBestRouteQueryParams,
    RangoSwapQueryParams,
    RangoTxStatusQueryParams
} from '../models/rango-parser-types';
import { RangoUtils } from '../utils/rango-utils';

export class RangoCommonParser {
    /**
     * @description Transform parameters to required view for rango-api
     */
    public static async getBestRouteQueryParams(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RangoBestRouteRequestOptions
    ): Promise<RangoBestRouteQueryParams> {
        const fromParam = await RangoUtils.getFromToQueryParam(from);
        const toParam = await RangoUtils.getFromToQueryParam(toToken);
        const disabledProviders = this.getRangoDisabledProviders(from, options.swapperGroups || []);
        const amountParam = Web3Pure.toWei(from.tokenAmount, from.decimals);
        const swapperGroups = disabledProviders?.join(',');
        const fromBlockchainType = BlockchainsInfo.getChainType(from.blockchain);

        return {
            from: fromParam,
            to: toParam,
            amount: amountParam,
            ...(options.slippageTolerance && { slippage: options.slippageTolerance * 100 }),
            ...(options.swapperGroups?.length && { swapperGroups }),
            swappersGroupsExclude: options?.swappersGroupsExclude ?? true,
            contractCall: fromBlockchainType === CHAIN_TYPE.EVM
        };
    }

    public static async getSwapQueryParams(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RangoSwapRequestOptions
    ): Promise<RangoSwapQueryParams> {
        const amount = Web3Pure.toWei(fromToken.tokenAmount, fromToken.decimals);

        const from = await RangoUtils.getFromToQueryParam(fromToken);
        const to = await RangoUtils.getFromToQueryParam(toToken);

        const walletAddress = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
            fromToken.blockchain
        ).address;
        const disabledProviders = this.getRangoDisabledProviders(
            fromToken,
            options.swapperGroups || []
        );
        const fromAddress = options.fromAddress || walletAddress;
        const toAddress = options?.receiverAddress || walletAddress || FAKE_WALLET_ADDRESS;
        const slippage = options.slippageTolerance * 100;
        const swapperGroups = disabledProviders?.join(',');
        const fromBlockchainType = BlockchainsInfo.getChainType(fromToken.blockchain);

        return {
            amount,
            from,
            to,
            fromAddress,
            slippage,
            toAddress,
            ...(options.swapperGroups?.length && { swapperGroups }),
            swappersGroupsExclude: options?.swappersGroupsExclude ?? true,
            contractCall: fromBlockchainType === CHAIN_TYPE.EVM
        };
    }

    public static getTxStatusQueryParams(
        srcTxHash: string,
        requestId: string
    ): RangoTxStatusQueryParams {
        return { requestId, txId: srcTxHash };
    }

    private static getRangoDisabledProviders(
        fromToken: PriceTokenAmount,
        disabledProviders: RangoTradeType[]
    ): RangoTradeType[] {
        if (!disabledProviders?.length) {
            return [];
        }

        if (fromToken.blockchain === BLOCKCHAIN_NAME.BITCOIN) {
            const mayaProtocol = RUBIC_TO_RANGO_PROVIDERS[BRIDGE_TYPE.MAYA_PROTOCOL];

            return disabledProviders.filter(provider => provider !== mayaProtocol);
        }

        return disabledProviders;
    }
}
