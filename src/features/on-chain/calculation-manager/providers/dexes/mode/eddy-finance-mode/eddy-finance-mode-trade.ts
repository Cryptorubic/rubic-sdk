import { NotWhitelistedProviderError, RubicSdkError } from 'src/common/errors';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { GetToAmountAndTxDataResponse } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';
import { EDDY_SWAP_METHOD } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/EDDY_SWAP_METHOD';
import { ExactInputOutputSwapMethodsList } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/SWAP_METHOD';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    EDDY_FINANCE_MODE_CALCULATE_CONTRACT_ADDRESS,
    EDDY_FINANCE_MODE_SWAP_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/mode/eddy-finance-mode/constants';
import { EDDY_FINANCE_SWAP_CONTRACT_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/eddy-finance/constants';

export class EddyFinanceModeTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.EDDY_FINANCE;
    }

    public readonly dexContractAddress = EDDY_FINANCE_MODE_CALCULATE_CONTRACT_ADDRESS;

    public static readonly swapMethods: ExactInputOutputSwapMethodsList = EDDY_SWAP_METHOD;

    protected get spenderAddress(): string {
        return this.useProxy
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : EDDY_FINANCE_MODE_SWAP_CONTRACT_ADDRESS;
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<GetToAmountAndTxDataResponse> {
        await this.checkFromAddress(options.fromAddress, true);
        checkUnsupportedReceiverAddress(
            options?.receiverAddress,
            options?.fromAddress || this.walletAddress
        );

        if (options.supportFee === undefined) {
            const needApprove = await this.needApprove(options.fromAddress);
            if (needApprove) {
                throw new RubicSdkError(
                    'To use `encode` function, token must be approved for wallet'
                );
            }

            try {
                await this.checkBalance();
            } catch (_err) {
                throw new RubicSdkError(
                    'To use `encode` function, wallet must have enough balance or you must provider `supportFee` parameter in options.'
                );
            }
        }

        const methodName = await this.getMethodName(options, options.fromAddress, false);
        const gasParams = this.getGasParams(options);

        const config = EvmWeb3Pure.encodeMethodCall(
            EDDY_FINANCE_MODE_SWAP_CONTRACT_ADDRESS,
            EDDY_FINANCE_SWAP_CONTRACT_ABI,
            methodName,
            this.getCallParameters(),
            this.nativeValueToSend,
            gasParams
        );

        return { tx: config, toAmount: this.to.stringWeiAmount };
    }

    protected getCallParameters(): unknown[] {
        const { amountIn } = this.getAmountInAndAmountOut();
        // EddyFinance 13.05.2024::
        // amountOut is handled at our contracts for now so you can pass it as 0(Will be changed in future)
        const amountOut = '0';
        const amountParameters = this.from.isNative ? [amountOut] : [amountIn, amountOut];

        return [...amountParameters, this.wrappedPath.map(t => t.address)];
    }

    protected getSwapParametersByMethod(
        method: string
    ): Parameters<InstanceType<typeof EvmWeb3Private>['executeContractMethod']> {
        const value = this.nativeValueToSend;

        return [
            EDDY_FINANCE_MODE_SWAP_CONTRACT_ADDRESS,
            EDDY_FINANCE_SWAP_CONTRACT_ABI,
            method,
            this.getCallParameters(),
            { value }
        ];
    }

    protected async getSwapData(options: GetContractParamsOptions): Promise<unknown[]> {
        const directTransactionConfig = await this.encodeDirect({
            ...options,
            fromAddress: rubicProxyContractAddress[this.from.blockchain].router,
            supportFee: false,
            receiverAddress:
                options.receiverAddress || rubicProxyContractAddress[this.from.blockchain].router
        });

        const availableDexs = (
            await ProxyCrossChainEvmTrade.getWhitelistedDexes(this.from.blockchain)
        ).map(address => address.toLowerCase());

        const routerAddress = directTransactionConfig.to;
        const method = directTransactionConfig.data.slice(0, 10);

        if (!availableDexs.includes(routerAddress.toLowerCase())) {
            throw new NotWhitelistedProviderError(routerAddress, undefined, 'dex');
        }
        await ProxyCrossChainEvmTrade.checkDexWhiteList(
            this.from.blockchain,
            routerAddress,
            method
        );

        return [
            [
                routerAddress,
                routerAddress,
                this.from.address,
                this.to.address,
                this.from.stringWeiAmount,
                directTransactionConfig.data,
                true
            ]
        ];
    }
}
