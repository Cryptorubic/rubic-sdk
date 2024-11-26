import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { SquidrouterTransactionRequest } from 'src/features/common/providers/squidrouter/models/transaction-request';
import { SquidrouterTransactionResponse } from 'src/features/common/providers/squidrouter/models/transaction-response';
import { SquidRouterApiService } from 'src/features/common/providers/squidrouter/services/squidrouter-api-service';
import {
    SquidrouterCrossChainSupportedBlockchain,
    squidrouterCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/constants/squidrouter-cross-chain-supported-blockchain';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { getGasFeeInfo } from '../../common/utils/get-gas-fee-info';
import { getGasPriceInfo } from '../../common/utils/get-gas-price-info';
import { SquidRouterOnChainTradeStruct } from './models/squidrouter-on-chain-trade-struct';
import { SquidRouterOnChainTrade } from './squidrouter-on-chain-trade';

export class SquidRouterOnChainProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.SQUIDROUTER;

    private readonly nativeAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return squidrouterCrossChainSupportedBlockchains.some(item => item === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        const fromBlockchain = from.blockchain as SquidrouterCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as SquidrouterCrossChainSupportedBlockchain;
        try {
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);

            const fakeAddress = '0xe388Ed184958062a2ea29B7fD049ca21244AE02e';
            const fromAddress = options?.fromAddress || fakeAddress;

            const receiver = fromAddress;
            const requestParams: SquidrouterTransactionRequest = {
                fromAddress,
                fromChain: blockchainId[fromBlockchain].toString(),
                fromToken: from.isNative ? this.nativeAddress : from.address,
                fromAmount: fromWithoutFee.stringWeiAmount,
                toChain: blockchainId[toBlockchain].toString(),
                toToken: toToken.isNative ? this.nativeAddress : toToken.address,
                toAddress: receiver,
                slippage: Number(options.slippageTolerance * 100)
            };

            const { route } = await SquidRouterApiService.getRoute(requestParams);

            const providerGateway = route.transactionRequest.target;

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(route.estimate.toAmount, toToken.decimals)
            });

            const routePath = this.getRoutePath(from, to);

            const tradeStruct: SquidRouterOnChainTradeStruct = {
                from,
                to,
                path: routePath,
                proxyFeeInfo,
                transactionRequest: requestParams,
                slippageTolerance: options.slippageTolerance,
                useProxy: options.useProxy,
                usedForCrossChain: options.usedForCrossChain,
                withDeflation: options.withDeflation,
                fromWithoutFee,
                gasFeeInfo: await this.getGasFeeInfo(from, route)
            };

            return new SquidRouterOnChainTrade(
                tradeStruct,
                options.providerAddress,
                providerGateway
            );
        } catch (err) {
            return {
                type: this.tradeType,
                error: err
            };
        }
    }

    protected override async getGasFeeInfo(
        from: PriceTokenAmount<EvmBlockchainName>,
        route: SquidrouterTransactionResponse['route']
    ): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(from.blockchain);
            const gasLimit = new BigNumber(route.transactionRequest.gasLimit);

            return getGasFeeInfo(gasPriceInfo, { gasLimit });
        } catch {
            return null;
        }
    }
}
