import { CrossChainIsUnavailableError } from 'src/common/errors';
import { PriceTokenAmount, PriceToken } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
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
import { chaingeUtils } from './constants/ethers';
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
            fromToken: from.symbol,
            toChain: toToken.blockchain,
            toToken: toToken.symbol,
            feeLevel: 0
        };
        const rawTxRequest = {
            amount: from.tokenAmount.toNumber(),
            chain: from.blockchain,
            evmAddress: Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM).address,
            fromAddress: Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM).address,
            token: from.symbol
        };

        const aggregateQuoteHeaders = getChaingeRequestHeaders(
            quoteRequest as unknown as Record<string, string | number>
        );
        const aggregateQuoteResponse = await Injector.httpClient.post(
            `${chaingeApiBaseUrl}open/v1/order/getAggregateQuote`,
            quoteRequest,
            aggregateQuoteHeaders
        );
        console.log(chaingeUtils);
        const rawTxHeaders = getChaingeRequestHeaders(rawTxRequest);
        const rawTxResponse: { data: { raw: string } } = await Injector.httpClient.post(
            `${chaingeApiBaseUrl}open/v1/order/getTransferToMinterRaw`,
            rawTxRequest,
            rawTxHeaders
        );

        console.log({
            aggregateQuoteResponse,
            rawTxResponse,
            decode: chaingeUtils.decodeRaw(`0x${rawTxResponse.data.raw.split('_')[0]}`)
        });

        throw new CrossChainIsUnavailableError();
    }
}
