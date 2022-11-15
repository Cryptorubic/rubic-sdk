import { CrossChainIsUnavailableError } from 'src/common/errors';
import { PriceTokenAmount, PriceToken } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { chaingeApiBaseUrl } from './constants/chainge-api-base-url';
import {
    ChaingeCrossChainSupportedBlockchain,
    chaingeCrossChainSupportedBlockchains
} from './constants/chainge-cross-chain-supported-blockchain';
import { ChaingeQuoteRequest } from './models/chainge-quote-request';
import { getChaingeRequestHeaders } from './utils/get-chainge-request-parameters';

export class ChaingeCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.CHAINGE;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is ChaingeCrossChainSupportedBlockchain {
        return chaingeCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        _options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const quoteRequest: ChaingeQuoteRequest = {
            fromAmount: from.tokenAmount.toNumber(),
            fromChain: from.blockchain,
            fromToken: from.address,
            toChain: toToken.blockchain,
            toToken: toToken.address,
            feeLevel: 0
        };
        const headers = getChaingeRequestHeaders<ChaingeQuoteRequest>(quoteRequest);
        const response = await Injector.httpClient.post(
            `${chaingeApiBaseUrl}open/v1/order/getAggregateQuote`,
            quoteRequest,
            { headers }
        );

        console.log(response);

        throw new CrossChainIsUnavailableError();
    }
}
