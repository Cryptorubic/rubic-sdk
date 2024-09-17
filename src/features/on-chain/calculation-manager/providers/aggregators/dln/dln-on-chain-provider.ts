import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { DlnApiService } from 'src/features/common/providers/dln/dln-api-service';
import { DlnUtils } from 'src/features/common/providers/dln/dln-utils';
import {
    DlnOnChainSupportedBlockchain,
    dlnOnChainSupportedBlockchains
} from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/constants/dln-on-chain-supported-blockchains';
import { DlnOnChainFactory } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/dln-on-chain-factory';
import { DlnOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-on-chain-calculation-options';
import { DlnOnChainSwapRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-on-chain-swap-request';
import { DlnTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-trade-struct';
import { RequiredLifiCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/aggregators/lifi/models/lifi-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { OnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { deBridgeReferralCode } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/constants/debridge-code';

export class DlnOnChainProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.DLN;

    private readonly defaultOptions: Omit<RequiredLifiCalculationOptions, 'disabledProviders'> = {
        ...evmProviderDefaultOptions,
        gasCalculation: 'calculate'
    };

    protected isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return dlnOnChainSupportedBlockchains.some(
            supportedNetwork => supportedNetwork === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<DlnOnChainSupportedBlockchain>,
        toToken: PriceToken<DlnOnChainSupportedBlockchain>,
        options: DlnOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        if (!this.isSupportedBlockchain(from.blockchain)) {
            throw new RubicSdkError('Blockchain is not supported');
        }

        if (options.withDeflation.from.isDeflation || options.withDeflation.to.isDeflation) {
            throw new RubicSdkError('[RUBIC_SDK] DLN does not work if source token is deflation.');
        }

        const fullOptions = combineOptions(options, {
            ...this.defaultOptions,
            disabledProviders: [...options.disabledProviders, ON_CHAIN_TRADE_TYPE.DODO]
        });

        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, fullOptions);

        const fromChainId = blockchainId[from.blockchain];
        const fakeReceiver = DlnUtils.getFakeReceiver(toToken.blockchain);

        const slippage = new BigNumber(options.slippageTolerance).multipliedBy(100).toNumber();
        const requestParams: DlnOnChainSwapRequest = {
            ...this.getAffiliateFee(from.blockchain),
            chainId: fromChainId,
            tokenIn: DlnUtils.getSupportedAddress(from),
            tokenInAmount: fromWithoutFee.stringWeiAmount,
            slippage,
            tokenOut: DlnUtils.getSupportedAddress(toToken),
            tokenOutRecipient: fakeReceiver,
            referralCode: deBridgeReferralCode
        };

        const debridgeResponse = await DlnApiService.fetchOnChainSwapData(requestParams);

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            tokenAmount: Web3Pure.fromWei(
                debridgeResponse.tokenOut.amount,
                debridgeResponse.tokenOut.decimals
            )
        });

        const toTokenAmountMin = Web3Pure.fromWei(
            debridgeResponse.tokenOut.minAmount,
            debridgeResponse.tokenOut.decimals
        );

        const path = this.getRoutePath(from, to);

        const tradeStruct: DlnTradeStruct<DlnOnChainSupportedBlockchain> = {
            from,
            to,
            gasFeeInfo: null,
            slippageTolerance: fullOptions.slippageTolerance!,
            type: this.tradeType,
            path,
            toTokenWeiAmountMin: toTokenAmountMin,
            useProxy: fullOptions.useProxy!,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation!,
            transactionRequest: requestParams,
            providerGateway: debridgeResponse.tx.to || ''
        };
        if (fullOptions.gasCalculation === 'calculate') {
            tradeStruct.gasFeeInfo = await this.getGasFeeInfo(tradeStruct);
        }

        return DlnOnChainFactory.createTrade(from.blockchain, tradeStruct, options.providerAddress);
    }

    protected async getGasFeeInfo(
        _tradeStruct: OnChainTradeStruct<BlockchainName>,
        _providerGateway?: string
    ): Promise<GasFeeInfo | null> {
        return null;
    }

    private getAffiliateFee(
        fromBlockchain: DlnOnChainSupportedBlockchain
    ): Partial<Pick<DlnOnChainSwapRequest, 'affiliateFeePercent' | 'affiliateFeeRecipient'>> {
        if (fromBlockchain === BLOCKCHAIN_NAME.SOLANA) {
            return {
                affiliateFeeRecipient: '6pvJfh73w1HT3b9eKRMX3EfrKH5AihVqRhasyhN5qtfP',
                affiliateFeePercent: 0.1
            };
        }
        return {};
    }
}
