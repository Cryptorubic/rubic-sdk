import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { relayersAddresses } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/relayers-addresses';
import {
    StargateBridgeToken,
    stargateBridgeToken
} from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-bridge-token';
import { stargatePoolId } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pool-id';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { stargateChainId } from './constants/stargate-chain-id';
import {
    stargateContractAddress,
    stargateEthContractAddress
} from './constants/stargate-contract-address';
import { StargateCrossChainSupportedBlockchain } from './constants/stargate-cross-chain-supported-blockchain';
import { stargateRouterAbi } from './constants/stargate-router-abi';
import { stargateRouterEthAbi } from './constants/stargate-router-eth-abi';

export class StargateCrossChainTrade extends EvmCrossChainTrade {
    protected get methodName(): string {
        return this.onChainTrade
            ? 'swapAndStartBridgeTokensViaStargate'
            : 'startBridgeTokensViaStargate';
    }

    public readonly feeInfo: FeeInfo;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.STARGATE;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly slippageTolerance: number;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;

    public readonly toTokenAmountMin: BigNumber;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType = BRIDGE_TYPE.STARGATE;

    public get fromBlockchain(): StargateCrossChainSupportedBlockchain {
        return this.from.blockchain as StargateCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : stargateContractAddress[this.fromBlockchain];
    }

    private readonly onChainTrade: EvmOnChainTrade | null;

    private readonly dstChainTrade: EvmOnChainTrade | null;

    private readonly cryptoFeeToken: PriceToken | null;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            slippageTolerance: number;
            priceImpact: number | null;
            gasData: GasData | null;
            feeInfo: FeeInfo;
            srcChainTrade: EvmOnChainTrade | null;
            dstChainTrade: EvmOnChainTrade | null;
            cryptoFeeToken: PriceToken | null;
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
        this.slippageTolerance = crossChainTrade.slippageTolerance;
        this.priceImpact = crossChainTrade.priceImpact;
        this.gasData = crossChainTrade.gasData;
        this.feeInfo = crossChainTrade.feeInfo;
        this.onChainTrade = crossChainTrade.srcChainTrade;
        this.dstChainTrade = crossChainTrade.dstChainTrade;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(
            1 -
                (crossChainTrade.srcChainTrade
                    ? this.slippageTolerance / 2
                    : this.slippageTolerance)
        );
        this.onChainSubtype = {
            from: this.onChainTrade?.type,
            to: this.dstChainTrade?.type
        };
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
    }

    public static async getLayerZeroSwapData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        tokenAmountMin: string = to.stringWeiAmount,
        receiverAddress?: string,
        dstData?: string
    ): Promise<EvmEncodeConfig> {
        const walletAddress =
            Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM).address ||
            EvmWeb3Pure.EMPTY_ADDRESS;
        const fromBlockchain = from.blockchain as StargateCrossChainSupportedBlockchain;
        const toBlockchain = to.blockchain as StargateCrossChainSupportedBlockchain;
        const dstRelayer = relayersAddresses[toBlockchain];
        const destinationAddress = dstData ? dstRelayer : receiverAddress || walletAddress;
        const isEthTrade = from.isNative && to.isNative;
        const stargateRouterAddress = isEthTrade
            ? stargateEthContractAddress[fromBlockchain]!
            : stargateContractAddress[fromBlockchain];
        const dstChainId = stargateChainId[toBlockchain];
        const swapToMetisBlockchain = toBlockchain === BLOCKCHAIN_NAME.METIS;
        const swapFromMetisBlockchain = fromBlockchain === BLOCKCHAIN_NAME.METIS;

        const fromSymbol = StargateCrossChainTrade.getSymbol(
            from.symbol,
            fromBlockchain,
            swapToMetisBlockchain
        );
        const toSymbol = StargateCrossChainTrade.getSymbol(
            to.symbol,
            toBlockchain,
            swapFromMetisBlockchain
        );

        let srcPoolId = stargatePoolId[fromSymbol as StargateBridgeToken];
        let dstPoolId = stargatePoolId[toSymbol as StargateBridgeToken];

        // @TODO FIX STARGATE MULTIPLE POOLS
        if (
            dstPoolId === stargatePoolId[stargateBridgeToken.mUSD] &&
            srcPoolId === stargatePoolId[stargateBridgeToken.USDT]
        ) {
            srcPoolId = stargatePoolId[stargateBridgeToken.mUSD];
        }
        if (
            srcPoolId === stargatePoolId[stargateBridgeToken.mUSD] &&
            dstPoolId === stargatePoolId[stargateBridgeToken.USDT]
        ) {
            dstPoolId = stargatePoolId[stargateBridgeToken.mUSD];
        }

        const dstConfig = dstData
            ? ['750000', '0', relayersAddresses[toBlockchain]]
            : ['0', '0', walletAddress];

        const methodArguments = isEthTrade
            ? [dstChainId, walletAddress, walletAddress, from.stringWeiAmount, tokenAmountMin]
            : [
                  dstChainId,
                  srcPoolId,
                  dstPoolId,
                  walletAddress,
                  from.stringWeiAmount,
                  tokenAmountMin,
                  dstConfig,
                  destinationAddress,
                  dstData || '0x'
              ];
        const methodName = isEthTrade ? 'swapETH' : 'swap';
        const abi = isEthTrade ? stargateRouterEthAbi : stargateRouterAbi;
        return EvmWeb3Pure.encodeMethodCall(
            stargateRouterAddress,
            abi,
            methodName,
            methodArguments
        );
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const usdCryptoFee = this.cryptoFeeToken?.price.multipliedBy(
            this.feeInfo.provider?.cryptoFee?.amount || 0
        );
        if (usdCryptoFee && usdCryptoFee.gt(0)) {
            return fromUsd
                .plus(usdCryptoFee.isNaN() ? 0 : usdCryptoFee)
                .dividedBy(this.to.tokenAmount);
        }

        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippageTolerance * 100,
            routePath: this.routePath
        };
    }

    public static getSymbol(
        symbol: string,
        blockchain: BlockchainName,
        swapWithMetisBlockchain?: boolean
    ): string {
        if (blockchain === BLOCKCHAIN_NAME.ARBITRUM && symbol === 'AETH') {
            return 'ETH';
        }

        if (
            swapWithMetisBlockchain &&
            (blockchain === BLOCKCHAIN_NAME.AVALANCHE ||
                blockchain === BLOCKCHAIN_NAME.ETHEREUM ||
                blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) &&
            symbol.toLowerCase() === 'usdt'
        ) {
            return 'm.USDT';
        }

        if (blockchain === BLOCKCHAIN_NAME.AVALANCHE && symbol === 'USDt') {
            return 'USDT';
        }
        if (blockchain === BLOCKCHAIN_NAME.FANTOM && symbol === 'USDC') {
            return 'FUSDC';
        }
        if (symbol.toUpperCase() === 'METIS') {
            return symbol.toUpperCase();
        }
        return symbol;
    }
}
