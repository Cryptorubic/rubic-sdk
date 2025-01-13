import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { OrbiterEvmBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/networks/orbiter-evm-bridge-trade';
import { OrbiterTronBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/networks/orbiter-tron-bridge-trade';
import { OrbiterBridgeFactory } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/orbiter-bridge-factory';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { OrbiterQuoteConfig } from './models/orbiter-api-quote-types';
import {
    OrbiterSupportedBlockchain,
    orbiterSupportedBlockchains
} from './models/orbiter-supported-blockchains';
import { OrbiterApiService } from './services/orbiter-api-service';
import { OrbiterUtils } from './services/orbiter-utils';

export class OrbiterBridgeProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.ORBITER_BRIDGE;

    private orbiterQuoteConfigs: OrbiterQuoteConfig[] = [];

    public isSupportedBlockchain(blockchain: EvmBlockchainName): boolean {
        return orbiterSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as OrbiterSupportedBlockchain;
        let useProxy = options?.useProxy?.[this.type] ?? true;
        if (fromBlockchain === BLOCKCHAIN_NAME.TRON) {
            useProxy = false;
        }

        try {
            this.orbiterQuoteConfigs = await OrbiterApiService.getQuoteConfigs();

            const feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                from,
                useProxy
            );

            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const quoteConfig = OrbiterUtils.getQuoteConfig({
                from,
                to: toToken,
                configs: this.orbiterQuoteConfigs
            });
            const minAmountBN = new BigNumber(quoteConfig.minAmt);
            const maxAmountBN = new BigNumber(quoteConfig.maxAmt);

            try {
                this.checkAmountLimits(from, maxAmountBN, minAmountBN);
            } catch (error) {
                return {
                    tradeType: this.type,
                    error,
                    trade: this.getEmptyTrade(
                        from,
                        toToken,
                        feeInfo,
                        quoteConfig,
                        options.providerAddress
                    )
                };
            }

            const { result } = await OrbiterApiService.getReceiveAmount({
                line: quoteConfig.line,
                value: fromWithoutFee.stringWeiAmount
            });

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(result.receiveAmount, toToken.decimals)
            });

            const toAmountWithoutTradeFee = to.tokenAmount.minus(
                to.tokenAmount.multipliedBy(result.router.tradeFee)
            );

            const trade = OrbiterBridgeFactory.createTrade({
                crossChainTrade: {
                    feeInfo,
                    from,
                    gasData: await this.getGasData(from),
                    to,
                    priceImpact: from.calculatePriceImpactPercent(to),
                    quoteConfig,
                    toTokenAmountMin: toAmountWithoutTradeFee
                },
                providerAddress: options.providerAddress,
                routePath: await this.getRoutePath(from, to),
                useProxy
            });

            return { trade, tradeType: this.type };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);

            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
    }

    private checkAmountLimits(
        from: PriceTokenAmount,
        maxAmountBN: BigNumber,
        minAmountBN: BigNumber
    ): void | never {
        if (from.tokenAmount.gt(maxAmountBN)) {
            throw new MaxAmountError(maxAmountBN, from.symbol);
        }
        if (from.tokenAmount.lt(minAmountBN)) {
            throw new MinAmountError(minAmountBN, from.symbol);
        }
    }

    protected async getFeeInfo(
        fromBlockchain: OrbiterSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        return ProxyCrossChainEvmTrade.getFeeInfo(
            fromBlockchain,
            providerAddress,
            percentFeeToken,
            useProxy
        );
    }

    private getEmptyTrade(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        feeInfo: FeeInfo,
        quoteConfig: OrbiterQuoteConfig,
        providerAddress: string
    ): OrbiterEvmBridgeTrade | OrbiterTronBridgeTrade {
        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            tokenAmount: new BigNumber(0)
        });
        const trade = OrbiterBridgeFactory.createTrade({
            crossChainTrade: {
                from,
                gasData: null,
                feeInfo,
                to,
                priceImpact: 0,
                quoteConfig,
                toTokenAmountMin: new BigNumber(0)
            },
            providerAddress,
            useProxy: false,
            routePath: []
        });

        return trade;
    }
}
