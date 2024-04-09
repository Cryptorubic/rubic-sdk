import BigNumber from 'bignumber.js';
import { solidityPack } from 'ethers/lib/utils';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { getCrossChainGasData } from 'src/features/cross-chain/calculation-manager/utils/get-cross-chain-gas-data';

import { ALGB_TOKEN } from './constants/algb-token-addresses';
import { layerZeroProxyOFT } from './constants/layerzero-bridge-address';
import { layerZeroChainIds } from './constants/layzerzero-chain-ids';
import { LayerZeroBridgeSupportedBlockchain } from './models/layerzero-bridge-supported-blockchains';
import { layerZeroOFTABI } from './models/layerzero-oft-abi';

export class LayerZeroBridgeTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        options: SwapTransactionOptions
    ): Promise<GasData | null> {
        const trade = new LayerZeroBridgeTrade(
            {
                from,
                to,
                gasData: {
                    gasLimit: new BigNumber(0),
                    gasPrice: new BigNumber(0)
                }
            },
            EvmWeb3Pure.EMPTY_ADDRESS,
            []
        );
        return getCrossChainGasData(trade, options?.receiverAddress);
    }

    public readonly onChainSubtype = { from: undefined, to: undefined };

    public readonly type = CROSS_CHAIN_TRADE_TYPE.LAYERZERO;

    public readonly isAggregator = false;

    public readonly bridgeType = BRIDGE_TYPE.LAYERZERO;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData | null;

    private get fromBlockchain(): LayerZeroBridgeSupportedBlockchain {
        return this.from.blockchain as LayerZeroBridgeSupportedBlockchain;
    }

    private get toBlockchain(): LayerZeroBridgeSupportedBlockchain {
        return this.to.blockchain as LayerZeroBridgeSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return layerZeroProxyOFT[this.fromBlockchain];
    }

    public readonly feeInfo: FeeInfo = {};

    public readonly onChainTrade = null;

    protected get methodName(): string {
        return 'sendFrom';
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
            const { data, value, to } = await this.setTransactionConfig(
                false,
                options?.useCacheData || false,
                options.receiverAddress
            );

            const tx = await this.web3Private.trySendTransaction(to, {
                data,
                value,
                gas: gasLimit,
                gasPriceOptions
            });

            onTransactionHash(tx.transactionHash);

            return transactionHash!;
        } catch (err) {
            throw err;
        }
    }

    public async getContractParams(options: SwapTransactionOptions): Promise<ContractParams> {
        const account = this.web3Private.address;

        const fee = await this.estimateSendFee(options);

        const methodArguments = [
            account,
            layerZeroChainIds[this.toBlockchain],
            options.receiverAddress || account,
            this.from.stringWeiAmount,
            options.receiverAddress || account,
            '0x0000000000000000000000000000000000000000',
            '0x'
        ];

        return {
            contractAddress:
                this.fromBlockchain === BLOCKCHAIN_NAME.POLYGON
                    ? layerZeroProxyOFT[BLOCKCHAIN_NAME.POLYGON]
                    : ALGB_TOKEN[this.fromBlockchain],
            contractAbi: layerZeroOFTABI,
            methodName: this.methodName,
            methodArguments,
            value: fee || '0x'
        };
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const params = await this.getContractParams({ receiverAddress });
        const config = EvmWeb3Pure.encodeMethodCall(
            params.contractAddress,
            params.contractAbi,
            params.methodName,
            params.methodArguments,
            params.value
        );
        return { config, amount: this.to.stringWeiAmount };
    }

    private async estimateSendFee(options: SwapTransactionOptions) {
        const adapterParams = solidityPack(
            ['uint16', 'uint256'],
            [1, this.toBlockchain === BLOCKCHAIN_NAME.ARBITRUM ? 2_000_000 : 200_000]
        );

        const params = {
            contractAddress:
                this.fromBlockchain === BLOCKCHAIN_NAME.POLYGON
                    ? layerZeroProxyOFT[BLOCKCHAIN_NAME.POLYGON]
                    : ALGB_TOKEN[this.fromBlockchain],
            contractAbi: layerZeroOFTABI,
            methodName: 'estimateSendFee',
            methodArguments: [
                layerZeroChainIds[this.toBlockchain],
                options.receiverAddress || this.web3Private.address,
                this.from.stringWeiAmount,
                false,
                adapterParams
            ],
            value: '0'
        };

        const gasFee = await this.fromWeb3Public.callContractMethod(
            params.contractAddress,
            params.contractAbi,
            params.methodName,
            params.methodArguments
        );

        return gasFee[0];
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
