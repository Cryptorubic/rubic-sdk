import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BitcoinBlockchainName, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BitcoinEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/bitcoin-web3-private/models/bitcoin-encoded-config';
import { RouterQuoteResponseConfig } from 'src/features/common/providers/router/models/router-quote-response-config';
import { RouterApiService } from 'src/features/common/providers/router/services/router-api-service';
import { BitcoinCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/bitcoin-cross-chain-trade/bitcoin-cross-chain-trade';
import { RouterBitcoinConstructorParams } from 'src/features/cross-chain/calculation-manager/providers/router-provider/models/router-constructor-params';
import { RouterCrossChainUtilService } from 'src/features/cross-chain/calculation-manager/providers/router-provider/utils/router-cross-chain-util-service';

import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from '../../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../../common/constants/rubic-proxy-contract-address';
import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { OnChainSubtype } from '../../common/models/on-chain-subtype';
import { TradeInfo } from '../../common/models/trade-info';
import { RouterCrossChainSupportedBlockchains } from '../constants/router-cross-chain-supported-chains';

export class RouterBitcoinCrossChainTrade extends BitcoinCrossChainTrade {
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.ROUTER;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly from: PriceTokenAmount<BitcoinBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.ROUTER;

    public readonly gasData: GasData | null;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    public readonly isAggregator = false;

    private readonly routerQuoteConfig: RouterQuoteResponseConfig;

    private get fromBlockchain(): RouterCrossChainSupportedBlockchains {
        return this.from.blockchain as RouterCrossChainSupportedBlockchains;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : this.routerQuoteConfig.allowanceTo;
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    public readonly memo: string = '';

    constructor(params: RouterBitcoinConstructorParams) {
        const { providerAddress, routePath, useProxy, crossChainTrade } = params;
        super(providerAddress, routePath, useProxy);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.routerQuoteConfig = crossChainTrade.routerQuoteConfig;
        this.slippage = crossChainTrade.slippage;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - this.slippage);
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: BitcoinEncodedConfig; amount: string }> {
        const toBlockchain = this.to.blockchain as RouterCrossChainSupportedBlockchains;

        const toAddress = await RouterCrossChainUtilService.checkAndConvertAddress(
            toBlockchain,
            receiverAddress || this.walletAddress,
            this.to.address
        );
        const { txn, destination } = await RouterApiService.getSwapTx({
            ...this.routerQuoteConfig,
            senderAddress: this.walletAddress,
            receiverAddress: toAddress,
            refundAddress: this.walletAddress,
            isTransfer: true
        });

        if (!txn) {
            throw new RubicSdkError();
        }

        const config = {
            // data: txn.data,
            value: this.from.stringWeiAmount,
            to: txn.to
        };

        return { config, amount: destination.tokenAmount };
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
