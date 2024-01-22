import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';

import {
    OdosBestRouteRequestBody,
    OdosInputTokenRequest,
    OdosOutputTokenRequest
} from '../models/odos-api-best-route-types';
import { GetBestRouteBodyType } from '../models/odos-on-chain-parser-types';

export class OdosOnChainParser {
    public static getBestRouteBody({
        from,
        toToken,
        options,
        swappersBlacklist = [],
        swappersWhitelist = []
    }: GetBestRouteBodyType): OdosBestRouteRequestBody {
        const chainId = blockchainId[from.blockchain];
        const userAddr =
            options.fromAddress ??
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(from.blockchain).address;

        const inputTokens = [
            { tokenAddress: from.address, amount: Web3Pure.toWei(from.tokenAmount, from.decimals) }
        ] as OdosInputTokenRequest[];
        const outputTokens = [
            { proportion: 1, tokenAddress: toToken.address }
        ] as OdosOutputTokenRequest[];

        return {
            inputTokens,
            outputTokens,
            chainId,
            userAddr,
            slippageLimitPercent: options.slippageTolerance * 100,
            sourceBlacklist: swappersBlacklist,
            sourceWhitelist: swappersWhitelist,
            simple: true
        };
    }
}
