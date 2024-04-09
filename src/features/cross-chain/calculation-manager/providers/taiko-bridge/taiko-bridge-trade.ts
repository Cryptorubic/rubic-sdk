import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';

import { convertGasDataToBN } from '../../utils/convert-gas-price';
import { taikoBridgeContractAddress } from './constants/taiko-bridge-contract-address';
import { taikoERC20BridgeABI, taikoNativeBridgeABI } from './constants/taiko-gateway-abi';
import { TaikoBridgeSupportedBlockchain } from './models/taiko-bridge-supported-blockchains';

export class TaikoBridgeTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as TaikoBridgeSupportedBlockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new TaikoBridgeTrade(
                    {
                        from,
                        to,
                        gasData: null
                    },
                    EvmWeb3Pure.EMPTY_ADDRESS,
                    []
                ).getContractParams();

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const [gasLimit, gasDetails] = await Promise.all([
                web3Public.getEstimatedGas(
                    contractAbi,
                    contractAddress,
                    methodName,
                    methodArguments,
                    walletAddress,
                    value
                ),
                convertGasDataToBN(await Injector.gasPriceApi.getGasPrice(from.blockchain))
            ]);

            if (!gasLimit?.isFinite()) {
                return null;
            }

            const increasedGasLimit = Web3Pure.calculateGasMargin(gasLimit, 1.2);
            return {
                gasLimit: increasedGasLimit,
                ...gasDetails
            };
        } catch (_err) {
            return null;
        }
    }

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
            ? 'swapAndStartBridgeTokensViaGenericCrossChainV2'
            : 'startBridgeTokensViaGenericCrossChainV2';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            gasData: GasData | null;
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.toTokenAmountMin = crossChainTrade.to.tokenAmount;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasLimit, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        // eslint-disable-next-line no-useless-catch
        try {
            const params = await this.getContractParams();

            const { data, to, value } = EvmWeb3Pure.encodeMethodCall(
                params.contractAddress,
                params.contractAbi,
                params.methodName,
                params.methodArguments,
                params.value
            );

            await this.web3Private
                .trySendTransaction(to, {
                    data,
                    value,
                    gas: gasLimit,
                    gasPriceOptions
                })
                .then(tx => {
                    this.id = tx?.logs[this.from.isNative ? 0 : 2]?.topics[1];
                    onTransactionHash(tx.transactionHash);
                });

            return transactionHash!;
        } catch (err) {
            throw err;
        }
    }

    public async getContractParams(): Promise<ContractParams> {
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

        return {
            contractAddress: this.from.isNative
                ? taikoBridgeContractAddress[this.fromBlockchain].nativeProvider
                : taikoBridgeContractAddress[this.fromBlockchain].erc20Provider,
            contractAbi: this.from.isNative ? taikoNativeBridgeABI : taikoERC20BridgeABI,
            methodName: this.from.isNative ? 'sendMessage' : 'sendToken',
            methodArguments,
            value: this.from.isNative ? this.from.weiAmount.plus(fee).toFixed() : fee
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getUsdPrice(): BigNumber {
        return this.from.price.multipliedBy(this.from.tokenAmount);
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
}
