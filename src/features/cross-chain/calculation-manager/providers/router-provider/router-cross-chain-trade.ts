import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';
import { RouterQuoteResponseConfig } from 'src/features/common/providers/router/models/router-quote-response-config';
import { RouterApiService } from 'src/features/common/providers/router/services/router-api-service';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { getCrossChainGasData } from '../../utils/get-cross-chain-gas-data';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { RouterCrossChainSupportedBlockchains } from './constants/router-cross-chain-supported-chains';

export class RouterCrossChainTrade extends EvmCrossChainTrade {
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        feeInfo: FeeInfo,
        providerAddress: string,
        routerQuoteConfig: RouterQuoteResponseConfig,
        receiverAddress?: string
    ): Promise<GasData | null> {
        const trade = new RouterCrossChainTrade(
            {
                from,
                to,
                feeInfo,
                gasData: null,
                priceImpact: 0,
                routerQuoteConfig,
                slippage: 0
            },
            providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
            []
        );
        return getCrossChainGasData(trade, receiverAddress);
    }

    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.ROUTER;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber = new BigNumber(0);

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
        return this.isProxyTrade ? rubicProxyContractAddress[this.fromBlockchain].gateway : ' ';
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            feeInfo: FeeInfo;
            gasData: GasData | null;
            priceImpact: number | null;
            routerQuoteConfig: RouterQuoteResponseConfig;
            slippage: number;
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.routerQuoteConfig = crossChainTrade.routerQuoteConfig;
        this.slippage = crossChainTrade.slippage;
    }

    protected getContractParams(
        options: GetContractParamsOptions,
        skipAmountChangeCheck?: boolean | undefined
    ): Promise<ContractParams> {
        console.log(options, skipAmountChangeCheck);
        return Promise.reject(new RubicSdkError('method not implemented'));
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const { txn, destination } = await RouterApiService.getSwapTx({
            ...this.routerQuoteConfig,
            senderAddress: this.walletAddress,
            receiverAddress: receiverAddress || this.walletAddress,
            refundAddress: this.walletAddress
        });

        if (!txn) {
            throw new RubicSdkError();
        }

        const config = {
            data: txn.data,
            value: txn.value,
            to: txn.to,
            gasPrice: txn.gasPrice
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
