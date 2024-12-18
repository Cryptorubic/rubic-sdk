import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { PriceTokenAmount } from 'src/common/tokens';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import {
    BRIDGE_TYPE,
    BridgeType
} from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { TronCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/tron-cross-chain-trade';
import { MESON_ABI } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/constants/meson-abi';
import { mesonContractAddresses } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/constants/meson-contract-addresses';
import { MesonSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/constants/meson-cross-chain-supported-chains';
import { MesonCrossChainTronTradeConstructorParams } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/models/meson-trade-types';
import { MesonCcrApiService } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/services/meson-cross-chain-api-service';

export class MesonCrossChainTronTrade extends TronCrossChainTrade {
    /**ABSTRACT PROPS */
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.MESON;

    public readonly isAggregator: boolean = false;

    public readonly to: PriceTokenAmount;

    public readonly from: PriceTokenAmount<TronBlockchainName>; // 0.0011

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.MESON;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;
    /** */

    /* Used in swap-request, example `bnb:usdc` */
    private readonly sourceAssetString: string;

    private readonly targetAssetString: string;

    private get fromBlockchain(): MesonSupportedBlockchain {
        return this.from.blockchain as MesonSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return mesonContractAddresses[this.fromBlockchain];
    }

    protected get methodName(): string {
        throw new Error('Not implemented');
    }

    constructor(params: MesonCrossChainTronTradeConstructorParams) {
        super(params.providerAddress, params.routePath, params.useProxy);
        this.to = params.crossChainTrade.to;
        this.from = params.crossChainTrade.from;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.gasData = params.crossChainTrade.gasData;
        this.priceImpact = params.crossChainTrade.priceImpact;
        this.toTokenAmountMin = this.to.tokenAmount;
        this.sourceAssetString = params.crossChainTrade.sourceAssetString;
        this.targetAssetString = params.crossChainTrade.targetAssetString;
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: TronTransactionConfig; amount: string }> {
        const rubicMultiProxyAddress = rubicProxyContractAddress[this.fromBlockchain].router;
        const fromAddress = this.isProxyTrade ? rubicMultiProxyAddress : this.walletAddress;

        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );

        const { encoded, initiator } = await MesonCcrApiService.fetchInfoForTx({
            sourceAssetString: this.sourceAssetString,
            targetAssetString: this.targetAssetString,
            amount: fromWithoutFee.tokenAmount.toFixed(),
            fromAddress,
            receiverAddress: receiverAddress || this.walletAddress,
            useProxy: this.isProxyTrade
        });
        const postingValue = ethers.utils.solidityPack(['address', 'uint40'], [initiator, 1]);

        const methodName = 'postSwapFromContract';
        const methodArgs = [
            { type: 'uint256', value: encoded },
            { type: 'uint200', value: postingValue },
            { type: 'address', value: encoded }
        ];
        const value = this.from.isNative ? fromWithoutFee.stringWeiAmount : '0';

        const config = TronWeb3Pure.encodeMethodCall(
            mesonContractAddresses[this.fromBlockchain],
            MESON_ABI,
            methodName,
            methodArgs,
            Number(value)
        );

        return { config, amount: this.to.stringWeiAmount };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact || null,
            slippage: 0,
            routePath: this.routePath
        };
    }
}
