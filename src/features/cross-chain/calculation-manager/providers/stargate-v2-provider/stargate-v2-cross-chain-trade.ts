import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { getCrossChainGasData } from '../../utils/get-cross-chain-gas-data';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { StargateV2SupportedBlockchains } from './constants/stargate-v2-cross-chain-supported-blockchains';

export class StargateV2CrossChainTrade extends EvmCrossChainTrade {
    protected get methodName(): string {
        return 'swapAndStartBridgeTokensViaStargateV2';
    }

    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>,
        feeInfo: FeeInfo,
        slippageTolerance: number,
        providerAddress: string,
        routePath: RubicStep[],
        receiverAddress?: string
    ): Promise<GasData | null> {
        try {
            const trade = new StargateV2CrossChainTrade(
                {
                    from,
                    to: toToken,
                    slippageTolerance,
                    priceImpact: null,
                    gasData: null,
                    feeInfo,
                    cryptoFeeToken: null
                },
                providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                routePath
            );

            return getCrossChainGasData(trade, receiverAddress);
        } catch (_err) {
            return null;
        }
    }

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly feeInfo: FeeInfo;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.STARGATE_V2;

    public readonly gasData: GasData;

    public readonly isAggregator = false;

    public readonly slippageTolerance: number;

    public readonly priceImpact = null;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.STARGATE_V2;

    public get fromBlockchain(): StargateV2SupportedBlockchains {
        return this.from.blockchain as StargateV2SupportedBlockchains;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade ? rubicProxyContractAddress[this.fromBlockchain].gateway : ' ';
    }

    private readonly onChainTrade: EvmOnChainTrade | null;

    private readonly dstChainTrade: EvmOnChainTrade | null;

    private readonly cryptoFeeToken: PriceToken | null;

    public readonly toTokenAmountMin = new BigNumber(0);

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            slippageTolerance: number;
            priceImpact: number | null;
            gasData: GasData | null;
            feeInfo: FeeInfo;
            cryptoFeeToken: PriceToken | null;
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);
        console.log(providerAddress);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;
        this.slippageTolerance = crossChainTrade.slippageTolerance;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.onChainTrade = null;
        this.dstChainTrade = null;
    }

    protected async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        console.log(options.fromAddress);
        return Promise.reject(new RubicSdkError('method not implemented'));
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string | undefined
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        console.log(receiverAddress);
        return Promise.reject(new RubicSdkError('method not implemented'));
    }

    protected async swapDirect(options?: SwapTransactionOptions): Promise<string> {
        console.log(options);
        return Promise.reject(new RubicSdkError('method not implemented'));
    }

    protected async setTransactionConfig(
        skipAmountChangeCheck: boolean,
        useCacheData: boolean
    ): Promise<EvmEncodeConfig> {
        console.log(skipAmountChangeCheck, useCacheData);
        return Promise.reject(new RubicSdkError('method not implemented'));
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact || null,
            slippage: this.slippageTolerance * 100,
            routePath: this.routePath
        };
    }
}
