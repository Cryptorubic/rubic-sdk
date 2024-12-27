import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';

import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { AccrossCcrSupportedChains } from './constants/across-ccr-supported-chains';
import { acrossContractAddresses } from './constants/across-contract-addresses';
import { AcrossFeeQuoteRequestParams } from './models/across-fee-quote';

export class AcrossCrossChainTrade extends EvmCrossChainTrade {
    private readonly uniqCodeWithSeparator = '1dc0de003c';

    public readonly type = CROSS_CHAIN_TRADE_TYPE.ACROSS;

    public readonly isAggregator = false;

    public readonly bridgeType = BRIDGE_TYPE.ACROSS;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly priceImpact: number | null;

    public readonly gasData: GasData | null;

    public readonly feeInfo: FeeInfo;

    private readonly slippage: number;

    private readonly acrossFeeQuoteRequestParams: AcrossFeeQuoteRequestParams;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    private readonly fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;

    private get fromBlockchain(): AccrossCcrSupportedChains {
        return this.from.blockchain as AccrossCcrSupportedChains;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : acrossContractAddresses[this.fromBlockchain];
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(
        ccrTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            toTokenAmountMin: BigNumber;
            priceImpact: number | null;
            gasData: GasData | null;
            feeInfo: FeeInfo;
            slippage: number;
            acrossFeeQuoteRequestParams: AcrossFeeQuoteRequestParams;
        },
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean,
        apiQuote: QuoteRequestInterface,
        apiResponse: QuoteResponseInterface
    ) {
        super(providerAddress, routePath, useProxy, apiQuote, apiResponse);

        this.from = ccrTrade.from;
        this.to = ccrTrade.to;
        this.toTokenAmountMin = ccrTrade.toTokenAmountMin;
        this.priceImpact = ccrTrade.priceImpact;
        this.gasData = ccrTrade.gasData;
        this.feeInfo = ccrTrade.feeInfo;
        this.slippage = ccrTrade.slippage;
        this.acrossFeeQuoteRequestParams = ccrTrade.acrossFeeQuoteRequestParams;
        this.fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }
}
