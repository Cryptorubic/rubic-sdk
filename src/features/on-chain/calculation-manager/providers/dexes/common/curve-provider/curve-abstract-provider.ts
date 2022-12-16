import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    OnChainCalculationOptions,
    RequiredOnChainCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
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
        const registryExchangeAddress = await this.web3Public.callContractMethod(
            this.addressProvider,
            addressProviderAbi,
            'get_address',
            ['2']
        );

        const registryAddress = await this.web3Public.callContractMethod(
            this.addressProvider,
            addressProviderAbi,
            'get_address',
            ['0']
        );

        const poolAddress = await this.web3Public.callContractMethod(
            registryAddress,
            registryAbi,
            'find_pool_for_coins',
            [fromToken.address, toToken.address]
        );

        if (!poolAddress) {
            throw new RubicSdkError('Token is not supported.');
        }

        const amountOut = await this.web3Public.callContractMethod(
            registryExchangeAddress,
            registryExchangeAbi,
            'get_exchange_amount',
            [poolAddress, fromToken.address, toToken.address, fromToken.stringWeiAmount]
        );

        const fullOptions = combineOptions(options, this.defaultOptions);
        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(
            fromToken,
            fullOptions
        );

        const to = await PriceTokenAmount.createFromToken({
            ...toToken.asStruct,
            weiAmount: new BigNumber(amountOut)
        });

        const tradeStruct: CurveOnChainTradeStruct = {
            from: fromToken,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            useProxy: true,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            path: [fromToken, toToken],
            registryExchangeAddress,
            poolAddress
        };

        return new this.Trade(tradeStruct, fullOptions.providerAddress);
    }
}
