import {
    getL2Network,
    L1TransactionReceipt,
    L2ToL1MessageReader,
    L2TransactionReceipt
} from '@arbitrum/sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
import BigNumber from 'bignumber.js';
import { BigNumber as EtherBigNumber } from 'ethers';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { outboxAbi } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/constants/outbox-abi';
import { retryableFactoryAbi } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/constants/retryable-factory-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { l1Erc20ScrollGatewayAbi } from 'src/features/cross-chain/calculation-manager/providers/scroll-bridge/constants/l1-erc20-scroll-gateway-abi';
import { l2Erc20ScrollGatewayAbi } from 'src/features/cross-chain/calculation-manager/providers/scroll-bridge/constants/l2-erc20-scroll-gateway-abi';
import { scrollBridgeContractAddress } from 'src/features/cross-chain/calculation-manager/providers/scroll-bridge/constants/scroll-bridge-contract-address';
import { TransactionReceipt } from 'web3-eth';

import { ScrollBridgeSupportedBlockchain } from './models/scroll-bridge-supported-blockchain';

export class ScrollBridgeTrade extends EvmCrossChainTrade {
    public readonly onChainSubtype = { from: undefined, to: undefined };

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SCROLL_BRIDGE;

    public readonly isAggregator = false;

    public readonly bridgeType = BRIDGE_TYPE.SCROLL_BRIDGE;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData | null;

    private get fromBlockchain(): ScrollBridgeSupportedBlockchain {
        return this.from.blockchain as ScrollBridgeSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return scrollBridgeContractAddress[this.fromBlockchain]!.providerGateway;
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

    public async getContractParams(_options: GetContractParamsOptions): Promise<ContractParams> {
        throw new Error('Method is not supported');
    }

    public getTradeAmountRatio(_fromUsd: BigNumber): BigNumber {
        return new BigNumber(1);
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

    public static async claimTargetTokens(
        sourceTransaction: string,
        options: SwapTransactionOptions
    ): Promise<TransactionReceipt> {
        const web3Private = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
            BLOCKCHAIN_NAME.ETHEREUM
        );
        await web3Private.checkBlockchainCorrect(BLOCKCHAIN_NAME.ETHEREUM);

        const rpcProviders = Injector.web3PublicService.rpcProvider;
        const l1Provider = new JsonRpcProvider(
            rpcProviders[BLOCKCHAIN_NAME.ETHEREUM]!.rpcList[0]!,
            blockchainId[BLOCKCHAIN_NAME.ETHEREUM]
        );
        const l2Provider = new JsonRpcProvider(
            rpcProviders[BLOCKCHAIN_NAME.ARBITRUM]!.rpcList[0]!,
            blockchainId[BLOCKCHAIN_NAME.ARBITRUM]
        );
        const targetReceipt = await l2Provider.getTransactionReceipt(sourceTransaction);
        const l2TxReceipt = new L2TransactionReceipt(targetReceipt);
        const [event] = l2TxReceipt.getL2ToL1Events();
        if (!event) {
            throw new RubicSdkError('Transaction is not ready');
        }
        const messageReader = new L2ToL1MessageReader(l1Provider, event);

        const proof = await messageReader.getOutboxProof(l2Provider);
        const l2network = await getL2Network(blockchainId[BLOCKCHAIN_NAME.ARBITRUM]);

        const { onConfirm, gasLimit, gasPriceOptions } = options;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
        };

        return web3Private.tryExecuteContractMethod(
            l2network.ethBridge.outbox,
            outboxAbi,
            'executeTransaction',
            [
                proof,
                (event as unknown as { position: EtherBigNumber }).position.toString(),
                event.caller,
                event.destination,
                event.arbBlockNum.toString(),
                event.ethBlockNum.toString(),
                event.timestamp.toString(),
                event.callvalue.toString(),
                event.data
            ],
            {
                onTransactionHash,
                gas: gasLimit,
                gasPriceOptions
            }
        );
    }

    public static async redeemTokens(
        sourceTransactionHash: string,
        options: SwapTransactionOptions
    ): Promise<TransactionReceipt> {
        const rpcProviders = Injector.web3PublicService.rpcProvider;
        const l1Provider = new JsonRpcProvider(
            rpcProviders[BLOCKCHAIN_NAME.ETHEREUM]!.rpcList[0]!,
            blockchainId[BLOCKCHAIN_NAME.ETHEREUM]
        );
        const l2Provider = new JsonRpcProvider(
            rpcProviders[BLOCKCHAIN_NAME.ARBITRUM]!.rpcList[0]!,
            blockchainId[BLOCKCHAIN_NAME.ARBITRUM]
        );

        const receipt = await l1Provider.getTransactionReceipt(sourceTransactionHash);
        const messages = await new L1TransactionReceipt(receipt).getL1ToL2Messages(l2Provider);
        const creationIdMessage = messages.find(el => el.retryableCreationId);
        if (!creationIdMessage) {
            throw new RubicSdkError('Can not find creation id message.');
        }
        const { retryableCreationId } = creationIdMessage;

        const web3Private = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
            BLOCKCHAIN_NAME.ARBITRUM
        );
        await web3Private.checkBlockchainCorrect(BLOCKCHAIN_NAME.ARBITRUM);

        const { onConfirm, gasLimit, gasPriceOptions } = options;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
        };

        return web3Private.tryExecuteContractMethod(
            '0x000000000000000000000000000000000000006E',
            retryableFactoryAbi,
            'redeem',
            [retryableCreationId],
            {
                onTransactionHash,
                gas: gasLimit,
                gasPriceOptions
            }
        );
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        let contractParams: ContractParams | null = null;
        if (this.fromBlockchain === BLOCKCHAIN_NAME.GOERLI) {
            const methodArguments = [
                ...(this.from.isNative ? [] : [this.from.address]),
                ...(receiverAddress ? [receiverAddress] : []),
                this.from.stringWeiAmount,
                '40000'
            ];
            const fee = Web3Pure.toWei(0.005);

            contractParams = {
                contractAddress: scrollBridgeContractAddress[this.fromBlockchain]!.providerGateway,
                contractAbi: l1Erc20ScrollGatewayAbi,
                methodName: this.from.isNative ? 'depositETH' : 'depositERC20',
                methodArguments,
                value: this.from.isNative
                    ? this.from.weiAmount.plus(fee).toFixed()
                    : this.from.stringWeiAmount
            };
        } else {
            const methodArguments = [
                ...(this.from.isNative ? [] : [this.from.address]),
                ...(receiverAddress ? [receiverAddress] : []),
                this.from.stringWeiAmount,
                '160000'
            ];
            const fee = Web3Pure.toWei(0.005);

            contractParams = {
                contractAddress: scrollBridgeContractAddress[this.fromBlockchain]!.providerGateway,
                contractAbi: l2Erc20ScrollGatewayAbi,
                methodName: this.from.isNative ? 'withdrawETH' : 'withdrawERC20',
                methodArguments,
                value: this.from.isNative
                    ? this.from.weiAmount.plus(fee).toFixed()
                    : this.from.stringWeiAmount
            };
        }

        const config = EvmWeb3Pure.encodeMethodCall(
            contractParams.contractAddress,
            contractParams.contractAbi,
            contractParams.methodName,
            contractParams.methodArguments,
            contractParams.value
        );

        return { config, amount: this.to.stringWeiAmount };
    }
}
