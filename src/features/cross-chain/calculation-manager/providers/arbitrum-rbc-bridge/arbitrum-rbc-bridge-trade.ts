import {
    Erc20Bridger,
    getL2Network,
    L1TransactionReceipt,
    L2Network,
    L2ToL1MessageReader,
    L2TransactionReceipt
} from '@arbitrum/sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
import BigNumber from 'bignumber.js';
import { BigNumber as EtherBigNumber } from 'ethers';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { arbitrumRbcBridgeContractAddress } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/constants/arbitrum-rbc-bridge-contract-address';
import { l1Erc20GatewayAbi } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/constants/l1-erc20-gateway-abi';
import { l2Erc20GatewayAbi } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/constants/l2-erc20-gateway-abi';
import { outboxAbi } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/constants/outbox-abi';
import { retryableFactoryAbi } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/constants/retryable-factory-abi';
import { ArbitrumRbcBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/models/arbitrum-rbc-bridge-supported-blockchain';
import { CbridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-supported-blockchains';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { MethodDecoder } from 'src/features/cross-chain/calculation-manager/utils/decode-method';
import { TransactionReceipt } from 'web3-eth';

import { convertGasDataToBN } from '../../utils/convert-gas-price';

export class ArbitrumRbcBridgeTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        l2network: L2Network
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as CbridgeCrossChainSupportedBlockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new ArbitrumRbcBridgeTrade(
                    {
                        from,
                        to,
                        gasData: null,
                        l2network
                    },
                    EvmWeb3Pure.EMPTY_ADDRESS
                ).getContractParams({});

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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.ARBITRUM;

    public readonly isAggregator = false;

    public readonly bridgeType = BRIDGE_TYPE.ARBITRUM;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData | null;

    private get fromBlockchain(): ArbitrumRbcBridgeSupportedBlockchain {
        return this.from.blockchain as ArbitrumRbcBridgeSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return arbitrumRbcBridgeContractAddress[this.fromBlockchain].providerGateway;
    }

    public readonly feeInfo: FeeInfo = {};

    public readonly onChainTrade = null;

    protected get methodName(): string {
        return this.onChainTrade
            ? 'swapAndStartBridgeTokensViaGenericCrossChain'
            : 'startBridgeTokensViaGenericCrossChain';
    }

    private readonly bridge: Erc20Bridger;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            gasData: GasData | null;
            l2network: L2Network;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.toTokenAmountMin = crossChainTrade.to.tokenAmount;
        this.bridge = new Erc20Bridger(crossChainTrade.l2network);
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasLimit, gasPrice, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        // eslint-disable-next-line no-useless-catch
        try {
            const params = await this.getContractParams(options);

            const { data, to, value } = EvmWeb3Pure.encodeMethodCall(
                params.contractAddress,
                params.contractAbi,
                params.methodName,
                params.methodArguments,
                params.value
            );

            await this.web3Private.trySendTransaction(to, {
                data,
                value,
                onTransactionHash,
                gas: gasLimit,
                gasPrice,
                gasPriceOptions
            });

            return transactionHash!;
        } catch (err) {
            throw err;
        }
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const rpcProviders = Injector.web3PublicService.rpcProvider;
        const l1Provider = new JsonRpcProvider(rpcProviders[BLOCKCHAIN_NAME.ETHEREUM]!.rpcList[0]!);
        const l2Provider = new JsonRpcProvider(rpcProviders[BLOCKCHAIN_NAME.ARBITRUM]!.rpcList[0]!);

        if (this.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
            const depositRequest = await this.bridge.getDepositRequest({
                from: this.walletAddress,
                amount: EtherBigNumber.from(this.from.stringWeiAmount),
                erc20L1Address: this.from.address,
                l1Provider,
                l2Provider,
                destinationAddress: options?.receiverAddress || this.walletAddress
            });

            const { to, data, value } = depositRequest.txRequest;
            const methodArguments = MethodDecoder.decodeMethod(
                l1Erc20GatewayAbi.find(method => method.name === 'outboundTransfer')!,
                data as string
            )!.params.map(param => param.value);

            return {
                contractAddress: to,
                contractAbi: l1Erc20GatewayAbi,
                methodName: 'outboundTransfer',
                methodArguments,
                value: value.toString()
            };
        }

        const withdrawRequest = await this.bridge.getWithdrawalRequest({
            from: this.walletAddress,
            amount: EtherBigNumber.from(this.from.stringWeiAmount),
            destinationAddress: options?.receiverAddress || this.walletAddress,
            erc20l1Address: this.to.address
        });
        const { to, data, value } = withdrawRequest.txRequest;

        const decoded = MethodDecoder.decodeMethod(
            l2Erc20GatewayAbi.find(method => method.name === 'outboundTransfer')!,
            data as string
        );
        const methodArguments = decoded.params.map(param => param.value || '0x');

        return {
            contractAddress: to,
            contractAbi: l2Erc20GatewayAbi,
            methodName: 'outboundTransfer',
            methodArguments,
            value: value.toString()
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
            slippage: 0
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
            1
        );
        const l2Provider = new JsonRpcProvider(
            rpcProviders[BLOCKCHAIN_NAME.ARBITRUM]!.rpcList[0]!,
            42161
        );
        const targetReceipt = await l2Provider.getTransactionReceipt(sourceTransaction);
        const l2TxReceipt = new L2TransactionReceipt(targetReceipt);
        const [event] = l2TxReceipt.getL2ToL1Events();
        if (!event) {
            throw new RubicSdkError('Transaction is not ready');
        }
        const messageReader = new L2ToL1MessageReader(l1Provider, event);

        const proof = await messageReader.getOutboxProof(l2Provider);
        const l2network = await getL2Network(42161);

        const { onConfirm, gasLimit, gasPrice, gasPriceOptions } = options;
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
                gasPrice,
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
            1
        );
        const l2Provider = new JsonRpcProvider(
            rpcProviders[BLOCKCHAIN_NAME.ARBITRUM]!.rpcList[0]!,
            42161
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

        const { onConfirm, gasLimit, gasPrice, gasPriceOptions } = options;
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
                gasPrice,
                gasPriceOptions
            }
        );
    }
}
