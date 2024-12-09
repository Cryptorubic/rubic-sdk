import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { combineOptions } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import {
    OnChainCalculationOptions,
    RequiredOnChainCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { getGasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-price-info';
import { addressProviderAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/constants/address-provider-abi';
import { registryAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/constants/registry-abi';
import { registryExchangeAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/constants/registry-exchange-abi';
import { CurveAbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-trade';
import { CurveOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/models/curve-on-chain-trade-struct';
import { CurveTradeClass } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/models/curve-trade-class';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';

export abstract class CurveAbstractProvider<
    T extends CurveAbstractTrade = CurveAbstractTrade
> extends EvmOnChainProvider {
    /** @internal */
    public abstract readonly Trade: CurveTradeClass<T>;

    protected readonly addressProvider = '0x0000000022D53366457F9d5E68Ec105046FC4383';

    public static readonly nativeAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

    private readonly defaultOptions: RequiredOnChainCalculationOptions = {
        ...evmProviderDefaultOptions,
        deadlineMinutes: 20,
        disableMultihops: false
    };

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.CURVE;
    }

    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<EvmOnChainTrade> {
        const fromAddress = fromToken.isNative
            ? CurveAbstractProvider.nativeAddress
            : fromToken.address;
        const toAddress = toToken.isNative ? CurveAbstractProvider.nativeAddress : toToken.address;

        const registryExchangeAddress = await this.fetchRegistryExchangeAddress();
        const registryAddress = await this.fetchRegistryAddress();
        let poolAddress = await this.fetchPoolAddress(fromAddress, toAddress, registryAddress);

        const fullOptions = combineOptions(options, this.defaultOptions);
        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(
            fromToken,
            fullOptions
        );
        const fromAmount = fromWithoutFee.stringWeiAmount;

        if (compareAddresses(poolAddress, EvmWeb3Pure.EMPTY_ADDRESS)) {
            const bestRate = await this.fetchBestRate(
                fromAddress,
                toAddress,
                fromAmount,
                registryExchangeAddress
            );
            poolAddress = bestRate[0]!;
        }

        if (compareAddresses(poolAddress, EvmWeb3Pure.EMPTY_ADDRESS)) {
            throw new RubicSdkError('Token is not supported.');
        }

        const amountOut = await this.fetchExchangeAmount(
            fromAddress,
            toAddress,
            fromAmount,
            poolAddress,
            registryExchangeAddress
        );

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            weiAmount: new BigNumber(amountOut)
        });

        const tradeStruct: CurveOnChainTradeStruct = {
            from: fromToken,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            path: [fromToken, toToken],
            registryExchangeAddress,
            poolAddress,
            usedForCrossChain: fullOptions.usedForCrossChain
        };

        const trade = new this.Trade(tradeStruct, fullOptions.providerAddress);

        let gasFeeInfo = null;
        const spenderAddress = options?.fromAddress || this.walletAddress;
        if (spenderAddress) {
            const params = await trade.encodeDirect({
                fromAddress: spenderAddress,
                supportFee: false
            });
            const gasPrice = await getGasPriceInfo(fromToken.blockchain);

            let gasLimit: null | BigNumber;

            try {
                gasLimit = await this.web3Public.getEstimatedGasByData(
                    spenderAddress,
                    registryExchangeAddress,
                    {
                        data: params.data
                    }
                );
            } catch {
                gasLimit = new BigNumber(400_000); // Default gas limit
            }
            gasFeeInfo = getGasFeeInfo(gasPrice, { ...(gasLimit && { gasLimit }) });
        }

        return new this.Trade({ ...tradeStruct, gasFeeInfo }, fullOptions.providerAddress);
    }

    private async fetchRegistryExchangeAddress(): Promise<string> {
        return this.web3Public.callContractMethod(
            this.addressProvider,
            addressProviderAbi,
            'get_address',
            ['2']
        );
    }

    private async fetchRegistryAddress(): Promise<string> {
        return this.web3Public.callContractMethod(
            this.addressProvider,
            addressProviderAbi,
            'get_address',
            ['0']
        );
    }

    private async fetchPoolAddress(
        fromAddress: string,
        toAddress: string,
        registryAddress: string
    ): Promise<string> {
        return this.web3Public.callContractMethod(
            registryAddress,
            registryAbi,
            'find_pool_for_coins',
            [fromAddress, toAddress]
        );
    }

    private async fetchBestRate(
        fromAddress: string,
        toAddress: string,
        fromAmount: string,
        registryExchangeAddress: string
    ): Promise<[string, string]> {
        return this.web3Public.callContractMethod(
            registryExchangeAddress,
            registryExchangeAbi,
            'get_best_rate',
            [fromAddress, toAddress, fromAmount]
        );
    }

    private async fetchExchangeAmount(
        fromAddress: string,
        toAddress: string,
        fromAmount: string,
        poolAddress: string,
        registryExchangeAddress: string
    ): Promise<string> {
        return this.web3Public.callContractMethod(
            registryExchangeAddress,
            registryExchangeAbi,
            'get_exchange_amount',
            [poolAddress, fromAddress, toAddress, fromAmount]
        );
    }
}
