import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { Injector } from 'src/core/injector/injector';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { ContractParams } from '../common/models/contract-params';
import { FeeInfo } from '../common/models/fee';
import { ItType } from '../common/models/it-type';
import { bitgertApiUrl } from './constants/bitgert-api-url';
import { bitgertBridgeAbi } from './constants/bitgert-bridge-abi';
import { BitgertCrossChainSupportedBlockchain } from './constants/bitgert-cross-chain-supported-blockchain';
import { bitgertNativeBridgeAbi } from './constants/bitgert-native-bridge-abi';
import { blockchainNameToBitgertBlockchain } from './constants/blockchain-name-to-bitgert-blockchain';
import { bitgertBridges } from './constants/contract-address';

export class BitgertCrossChainTrade extends EvmCrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.BITGERT_BRIDGE;

    public readonly from: PriceTokenAmount<BitgertCrossChainSupportedBlockchain>;

    public readonly to: PriceTokenAmount<BitgertCrossChainSupportedBlockchain>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly cryptoFeeToken: PriceTokenAmount;

    public readonly priceImpact: number;

    protected get fromContractAddress(): string {
        return bitgertBridges[this.from.symbol]![
            this.from.blockchain as BitgertCrossChainSupportedBlockchain
        ];
    }

    public readonly itType: ItType = {
        from: undefined,
        to: undefined
    };

    public readonly feeInfo: FeeInfo;

    public readonly slippage: number;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<BitgertCrossChainSupportedBlockchain>;
            to: PriceTokenAmount<BitgertCrossChainSupportedBlockchain>;
            toTokenAmountMin: BigNumber;
            slippageTolerance: number;
            cryptoFeeToken: PriceTokenAmount;
            gasData: GasData | null;
            feeInfo: FeeInfo;
            priceImpact: number;
        },
        providerAddress: string
    ) {
        super(providerAddress);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.slippage = crossChainTrade.slippageTolerance;
        this.gasData = crossChainTrade.gasData;
        this.feeInfo = crossChainTrade.feeInfo;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.priceImpact = crossChainTrade.priceImpact;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);

        const { onConfirm } = options;
        let transactionHash: string;
        const onTransactionHash = async (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
            await Injector.httpClient.post(
                bitgertApiUrl.baseUrl + bitgertApiUrl.swap[this.from.symbol],
                {
                    fromChain: blockchainNameToBitgertBlockchain[this.from.blockchain],
                    toChain: blockchainNameToBitgertBlockchain[this.to.blockchain],
                    hash,
                    account: this.web3Private.address
                }
            );
        };

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await this.getContractParams(options);
            console.log({ contractAddress, contractAbi, methodName, methodArguments, value });

            const receipt = await this.web3Private.tryExecuteContractMethod(
                contractAddress,
                contractAbi,
                methodName,
                methodArguments,
                { value, onTransactionHash }
            );

            await Injector.httpClient.post(
                bitgertApiUrl.baseUrl + bitgertApiUrl.swap[this.from.symbol],
                {
                    fromChain: blockchainNameToBitgertBlockchain[this.from.blockchain],
                    toChain: blockchainNameToBitgertBlockchain[this.to.blockchain],
                    hash: receipt.transactionHash,
                    account: this.web3Private.address
                }
            );

            return receipt.transactionHash;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    public async getContractParams(_options: {
        fromAddress?: string | undefined;
        receiverAddress?: string | undefined;
    }): Promise<ContractParams> {
        return this.from.isNative
            ? {
                  contractAddress: this.fromContractAddress,
                  contractAbi: bitgertNativeBridgeAbi,
                  methodName: 'swap',
                  methodArguments: [] as unknown[],
                  value: this.from.stringWeiAmount
              }
            : {
                  contractAddress: this.fromContractAddress,
                  contractAbi: bitgertBridgeAbi,
                  methodName: 'swap',
                  methodArguments: [this.from.stringWeiAmount],
                  value: '0'
              };
    }

    public getTradeAmountRatio(_fromUsd: BigNumber): BigNumber {
        return new BigNumber(1);
    }
}
