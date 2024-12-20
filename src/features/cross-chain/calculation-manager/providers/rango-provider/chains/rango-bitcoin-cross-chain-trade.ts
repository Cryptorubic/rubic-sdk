import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BitcoinBlockchainName, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BitcoinEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/bitcoin-web3-private/models/bitcoin-encoded-config';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { RangoTransfer } from 'src/features/common/providers/rango/models/rango-api-swap-types';
import { RangoSwapQueryParams } from 'src/features/common/providers/rango/models/rango-parser-types';
import { RangoSupportedBlockchain } from 'src/features/common/providers/rango/models/rango-supported-blockchains';
import { BitcoinCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/bitcoin-cross-chain-trade/bitcoin-cross-chain-trade';

import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from '../../../models/cross-chain-trade-type';
import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { OnChainSubtype } from '../../common/models/on-chain-subtype';
import { TradeInfo } from '../../common/models/trade-info';
import { RangoCrossChainTradeConstructorParams } from '../model/rango-cross-chain-parser-types';
import { RangoCrossChainApiService } from '../services/rango-cross-chain-api-service';

export class RangoBitcoinCrossChainTrade extends BitcoinCrossChainTrade {
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public readonly isAggregator: boolean = true;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly from: PriceTokenAmount<BitcoinBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.RANGO;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    /**
     * @description UUID returned by rango-api to track transaction status in getRangoDstSwapStatus
     */
    public rangoRequestId: string | undefined;

    private readonly swapQueryParams: RangoSwapQueryParams;

    private get fromBlockchain(): RangoSupportedBlockchain {
        return this.from.blockchain as RangoSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        throw new Error('Method not supported');
    }

    protected get methodName(): string {
        throw new Error('Method not supported');
    }

    public readonly memo: string;

    constructor(params: RangoCrossChainTradeConstructorParams<BitcoinBlockchainName>) {
        super(params.providerAddress, params.routePath, params.useProxy);
        this.to = params.crossChainTrade.to;
        this.from = params.crossChainTrade.from;
        this.toTokenAmountMin = params.crossChainTrade.toTokenAmountMin;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.gasData = params.crossChainTrade.gasData;
        this.priceImpact = params.crossChainTrade.priceImpact;
        this.slippage = params.crossChainTrade.slippage;
        this.swapQueryParams = params.crossChainTrade.swapQueryParams;
        this.bridgeType = params.crossChainTrade.bridgeSubtype || BRIDGE_TYPE.RANGO;
        this.memo = params.crossChainTrade.memo!;
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig | BitcoinEncodedConfig; amount: string }> {
        const { route, tx, error, requestId } = await RangoCrossChainApiService.getSwapTransaction({
            ...this.swapQueryParams,
            toAddress: receiverAddress || this.swapQueryParams.toAddress
        });

        this.rangoRequestId = requestId;

        if (!route || !tx) {
            throw new RubicSdkError('Invalid data after sending swap request. Error text:' + error);
        }

        const { recipientAddress, memo } = tx as RangoTransfer;
        const config = {
            value: this.from.stringWeiAmount,
            to: recipientAddress,
            data: memo
        };

        return { config, amount: route.outputAmount };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact || null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }
}
