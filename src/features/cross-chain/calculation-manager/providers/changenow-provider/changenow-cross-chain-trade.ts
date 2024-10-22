import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { ChangenowCurrency } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-currencies-api';
import { ChangenowTrade } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-trade';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { convertGasDataToBN } from '../../utils/convert-gas-price';
import { CrossChainTransferTrade } from '../common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import {
    CrossChainPaymentInfo,
    CrossChainTransferData
} from '../common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { TradeInfo } from '../common/models/trade-info';
import { ChangenowSwapRequestBody } from './models/changenow-swap.api';
import { ChangeNowCrossChainApiService } from './services/changenow-cross-chain-api-service';

export class ChangenowCrossChainTrade extends CrossChainTransferTrade {
    /**
     * used in rubic-app to send as changenow_id to backend
     */
    public get changenowId(): string {
        return this.paymentInfo ? this.paymentInfo.id : '';
    }

    /** @internal */
    public static async getGasData(
        changenowTrade: ChangenowTrade,
        providerAddress: string,
        receiverAddress?: string
    ): Promise<GasData | null> {
        const fromBlockchain = changenowTrade.from.blockchain;
        const walletAddress =
            BlockchainsInfo.isEvmBlockchainName(fromBlockchain) &&
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new ChangenowCrossChainTrade(
                    changenowTrade,
                    providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                    [],
                    false
                ).getContractParams({ receiverAddress: receiverAddress || walletAddress }, true);

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
                convertGasDataToBN(await Injector.gasPriceApi.getGasPrice(fromBlockchain))
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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.CHANGENOW;

    public readonly onChainSubtype;

    public readonly bridgeType = BRIDGE_TYPE.CHANGENOW;

    private readonly fromCurrency: ChangenowCurrency;

    private readonly toCurrency: ChangenowCurrency;

    private get transitToken(): PriceTokenAmount {
        return this.onChainTrade ? this.onChainTrade.toTokenAmountMin : this.from;
    }

    protected get fromContractAddress(): string {
        if (this.isProxyTrade) {
            return rubicProxyContractAddress[this.from.blockchain].gateway;
        }
        throw new RubicSdkError('No contract address for changenow provider');
    }

    public readonly onChainTrade: EvmOnChainTrade | null;

    public get estimatedGas(): BigNumber | null {
        if (!this.gasData) {
            return null;
        }

        if (this.gasData.baseFee && this.gasData.maxPriorityFeePerGas) {
            return Web3Pure.fromWei(this.gasData.baseFee).plus(
                Web3Pure.fromWei(this.gasData.maxPriorityFeePerGas)
            );
        }

        if (this.gasData.gasPrice) {
            return Web3Pure.fromWei(this.gasData.gasPrice).multipliedBy(this.gasData.gasLimit);
        }

        return null;
    }

    constructor(
        crossChainTrade: ChangenowTrade,
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(
            providerAddress,
            routePath,
            useProxy,
            crossChainTrade.onChainTrade,
            crossChainTrade.from,
            crossChainTrade.to,
            crossChainTrade.toTokenAmountMin,
            crossChainTrade.gasData,
            crossChainTrade.feeInfo,
            crossChainTrade.from.calculatePriceImpactPercent(crossChainTrade.to)
        );
        this.fromCurrency = crossChainTrade.fromCurrency;
        this.toCurrency = crossChainTrade.toCurrency;
        this.onChainSubtype = crossChainTrade.onChainTrade
            ? { from: crossChainTrade.onChainTrade.type, to: undefined }
            : { from: undefined, to: undefined };
        this.onChainTrade = crossChainTrade.onChainTrade;
    }

    protected async getPaymentInfo(receiverAddress: string): Promise<CrossChainTransferData> {
        const params: ChangenowSwapRequestBody = {
            fromCurrency: this.fromCurrency.ticker,
            toCurrency: this.toCurrency.ticker,
            fromNetwork: this.fromCurrency.network,
            toNetwork: this.toCurrency.network,
            fromAmount: this.transitToken.tokenAmount.toFixed(),
            address: receiverAddress,
            flow: 'standard'
        };
        const res = await ChangeNowCrossChainApiService.getSwapTx(params);

        return {
            id: res.id,
            depositAddress: res.payinAddress,
            toAmount: res.toAmount.toString(),
            depositExtraId: res.payinExtraId,
            depositExtraIdName: res.payinExtraIdName
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.onChainTrade?.slippageTolerance
                ? this.onChainTrade.slippageTolerance * 100
                : 0,
            routePath: this.routePath
        };
    }

    /**
     * @deprecated Use getTransferTrade instead
     */
    public getChangenowPostTrade(receiverAddress: string): Promise<CrossChainPaymentInfo> {
        return super.getTransferTrade(receiverAddress);
    }
}
