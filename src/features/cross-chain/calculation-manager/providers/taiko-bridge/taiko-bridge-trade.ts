import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import {
    taikoERC20BridgeABI,
    taikoNativeBridgeABI
} from 'src/features/cross-chain/calculation-manager/providers/taiko-bridge/constants/taiko-gateway-abi';

import { taikoBridgeContractAddress } from './constants/taiko-bridge-contract-address';
import { TaikoBridgeSupportedBlockchain } from './models/taiko-bridge-supported-blockchains';

export class TaikoBridgeTrade extends EvmCrossChainTrade {
    public readonly onChainSubtype = { from: undefined, to: undefined };

    public readonly type = CROSS_CHAIN_TRADE_TYPE.TAIKO_BRIDGE;

    public readonly isAggregator = false;

    public readonly bridgeType = BRIDGE_TYPE.TAIKO_BRIDGE;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData | null;

    /**
     * id of taiko bridge tx, used to get trade status.
     */
    public id: string | undefined;

    private get fromBlockchain(): TaikoBridgeSupportedBlockchain {
        return this.from.blockchain as TaikoBridgeSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.from.isNative
            ? taikoBridgeContractAddress[this.fromBlockchain]!.nativeProvider
            : taikoBridgeContractAddress[this.fromBlockchain]!.erc20Provider;
    }

    public readonly feeInfo: FeeInfo = {};

    public readonly onChainTrade = null;

    protected get methodName(): string {
        return this.onChainTrade
            ? 'swapAndStartBridgeTokensViaGenericCrossChain'
            : 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            gasData: GasData | null;
        },
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(providerAddress, routePath, useProxy);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.toTokenAmountMin = crossChainTrade.to.tokenAmount;
    }

    public async getContractParams(): Promise<ContractParams> {
        throw new Error('Method is not supported');
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: null,
            slippage: 0,
            routePath: this.routePath
        };
    }

    protected async getTransactionConfigAndAmount(
        _receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        let methodArguments;
        let fee;

        const account = this.web3Private.address;

        if (this.fromBlockchain === BLOCKCHAIN_NAME.HOLESKY) {
            if (this.from.isNative) {
                methodArguments = [
                    {
                        id: 0,
                        from: account,
                        srcChainId: blockchainId[BLOCKCHAIN_NAME.HOLESKY],
                        destChainId: blockchainId[BLOCKCHAIN_NAME.TAIKO],
                        owner: account,
                        to: account,
                        refundTo: account,
                        value: this.from.stringWeiAmount,
                        fee: '9000000',
                        gasLimit: '140000',
                        data: '0x',
                        memo: ''
                    }
                ];

                fee = '9000000';
            } else {
                methodArguments = [
                    {
                        destChainId: blockchainId[BLOCKCHAIN_NAME.TAIKO],
                        to: account,
                        token: this.from.address,
                        amount: this.from.stringWeiAmount,
                        gasLimit: '140000',
                        fee: '11459820715200000',
                        refundTo: account,
                        memo: ''
                    }
                ];

                fee = '11459820715200000';
            }
        } else {
            if (this.from.isNative) {
                methodArguments = [
                    {
                        id: 0,
                        from: account,
                        srcChainId: blockchainId[BLOCKCHAIN_NAME.TAIKO],
                        destChainId: blockchainId[BLOCKCHAIN_NAME.HOLESKY],
                        owner: account,
                        to: account,
                        refundTo: account,
                        value: this.from.stringWeiAmount,
                        fee: '34774829357400000',
                        gasLimit: '140000',
                        data: '0x',
                        memo: ''
                    }
                ];

                fee = '34774829357400000';
            } else {
                methodArguments = [
                    {
                        destChainId: blockchainId[BLOCKCHAIN_NAME.HOLESKY],
                        to: account,
                        token: this.from.address,
                        amount: this.from.stringWeiAmount,
                        gasLimit: '140000',
                        fee: '88242155100000',
                        refundTo: account,
                        memo: ''
                    }
                ];

                fee = '88242155100000';
            }
        }

        const config = EvmWeb3Pure.encodeMethodCall(
            this.from.isNative
                ? taikoBridgeContractAddress[this.fromBlockchain].nativeProvider
                : taikoBridgeContractAddress[this.fromBlockchain].erc20Provider,
            this.from.isNative ? taikoNativeBridgeABI : taikoERC20BridgeABI,
            this.from.isNative ? 'sendMessage' : 'sendToken',
            methodArguments,
            this.from.isNative ? this.from.weiAmount.plus(fee).toFixed() : fee
        );

        return { config, amount: this.to.stringWeiAmount };
    }
}
