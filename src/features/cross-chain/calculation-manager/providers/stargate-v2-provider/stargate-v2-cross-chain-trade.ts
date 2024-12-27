import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { EvmCrossChainTrade } from '../common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { StargateV2BridgeToken } from './constants/stargate-v2-bridge-token';
import { stargateV2ContractAddress } from './constants/stargate-v2-contract-address';
import { StargateV2SupportedBlockchains } from './constants/stargate-v2-cross-chain-supported-blockchains';
import { stargateV2TokenAddress } from './constants/stargate-v2-token-address';
import {
    StargateV2MessagingFee,
    StargateV2QuoteParamsStruct
} from './modal/stargate-v2-quote-params-struct';

export class StargateV2CrossChainTrade extends EvmCrossChainTrade {
    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    protected get web3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly feeInfo: FeeInfo;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.STARGATE_V2;

    public readonly gasData: GasData;

    public readonly toTokenAmountMin: BigNumber;

    public readonly isAggregator = false;

    public readonly slippageTolerance: number;

    public readonly priceImpact: number | null;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.STARGATE_V2;

    public readonly messagingFee: StargateV2MessagingFee;

    private readonly fromTokenAddress: string;

    private readonly fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;

    public get fromBlockchain(): StargateV2SupportedBlockchains {
        return this.from.blockchain as StargateV2SupportedBlockchains;
    }

    protected get fromContractAddress(): string {
        const fromTokenSymbol = stargateV2TokenAddress[
            this.from.blockchain as StargateV2SupportedBlockchains
        ][this.fromTokenAddress] as StargateV2BridgeToken;
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : (stargateV2ContractAddress?.[this.fromBlockchain]?.[fromTokenSymbol] as string);
    }

    private readonly stargateV2SendParams: StargateV2QuoteParamsStruct;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            slippageTolerance: number;
            gasData: GasData | null;
            feeInfo: FeeInfo;
            sendParams: StargateV2QuoteParamsStruct;
            messagingFee: StargateV2MessagingFee;
            priceImpact: number | null;
            toTokenAmountMin: BigNumber;
        },
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean,
        apiQuote: QuoteRequestInterface,
        apiResponse: QuoteResponseInterface
    ) {
        super(providerAddress, routePath, useProxy, apiQuote, apiResponse);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;
        this.slippageTolerance = crossChainTrade.slippageTolerance;
        this.stargateV2SendParams = crossChainTrade.sendParams;
        this.messagingFee = crossChainTrade.messagingFee;
        this.priceImpact = crossChainTrade.priceImpact;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.fromTokenAddress = this.from.address.toLowerCase();
        this.fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippageTolerance * 100,
            routePath: this.routePath
        };
    }
}
