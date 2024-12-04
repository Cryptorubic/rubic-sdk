import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import {
    BRIDGE_TYPE,
    BridgeType
} from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { TronContractParams } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/models/tron-contract-params';
import { TronCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/tron-cross-chain-trade';
import { ORBITER_ROUTER_V3_ABI } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/constants/orbiter-router-v3-abi';
import { OrbiterQuoteConfig } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/models/orbiter-api-quote-types';
import { OrbiterTronTradeParams } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/models/orbiter-bridge-trade-types';
import { orbiterContractAddresses } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/models/orbiter-contract-addresses';
import { OrbiterSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/models/orbiter-supported-blockchains';
import { OrbiterUtils } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/services/orbiter-utils';

export class OrbiterTronBridgeTrade extends TronCrossChainTrade {
    /**ABSTRACT PROPS */
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.ORBITER_BRIDGE;

    public readonly isAggregator: boolean = false;

    public readonly to: PriceTokenAmount;

    public readonly from: PriceTokenAmount<TronBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.ORBITER_BRIDGE;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;
    /** */

    /* used to get extraNativeFee(tradeFee) and orbiter contract params */
    private quoteConfig: OrbiterQuoteConfig;

    private get fromBlockchain(): OrbiterSupportedBlockchain {
        return this.from.blockchain as OrbiterSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return orbiterContractAddresses[this.fromBlockchain];
    }

    protected get methodName(): string {
        throw new Error('Not implemented');
    }

    constructor(params: OrbiterTronTradeParams) {
        super(params.providerAddress, params.routePath, params.useProxy);
        this.to = params.crossChainTrade.to;
        this.from = params.crossChainTrade.from;
        this.toTokenAmountMin = params.crossChainTrade.toTokenAmountMin;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.gasData = params.crossChainTrade.gasData;
        this.priceImpact = params.crossChainTrade.priceImpact;
        this.quoteConfig = params.crossChainTrade.quoteConfig;
    }

    public async getContractParams(
        _options: GetContractParamsOptions
    ): Promise<TronContractParams> {
        throw new Error('Not implemented');
    }

    protected async getTransactionConfigAndAmount(receiverAddress?: string): Promise<{
        config: TronTransactionConfig;
        amount: string;
    }> {
        // Orbiter deposit address to send funds money to receiverWalletAddress after transfer confirmation
        const orbiterTokensDispenser = this.quoteConfig.endpoint;

        // const transferAmount = this.from.stringWeiAmount;
        const transferAmount = OrbiterUtils.getFromAmountWithoutFeeWithCode(
            this.from,
            this.feeInfo,
            this.quoteConfig
        );

        const encodedReceiverAndCode = OrbiterUtils.getHexDataArg(
            this.quoteConfig.vc,
            receiverAddress || this.walletAddress
        );

        const methodName = this.from.isNative ? 'transfer' : 'transferToken';
        const methodArgs = this.from.isNative
            ? [
                  { type: 'address', value: orbiterTokensDispenser },
                  { type: 'bytes', value: encodedReceiverAndCode }
              ]
            : [
                  { type: 'address', value: this.from.address },
                  { type: 'address', value: orbiterTokensDispenser },
                  { type: 'uint256', value: transferAmount },
                  { type: 'bytes', value: encodedReceiverAndCode }
              ];

        // this.from.address, orbiterTokensDispenser, transferAmount, encodedReceiverAndCode
        const value = this.from.isNative ? transferAmount : '0';

        const config = TronWeb3Pure.encodeMethodCall(
            orbiterContractAddresses[this.fromBlockchain],
            ORBITER_ROUTER_V3_ABI,
            methodName,
            methodArgs,
            value
        );

        return {
            config,
            amount: this.to.stringWeiAmount
        };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: 0,
            routePath: this.routePath
        };
    }
}
