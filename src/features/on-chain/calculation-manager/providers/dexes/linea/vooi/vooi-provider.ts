import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { combineOptions, deadlineMinutesTimestamp } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { getFromToTokensAmountsByExact } from 'src/features/on-chain/calculation-manager/providers/dexes/common/utils/get-from-to-tokens-amounts-by-exact';
import { omniPoolAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/vooi/constants/omni-pool-abi';
import { vooiPoolIdMapping } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/vooi/constants/pool-id-mapping';
import { VooiTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/vooi/models/vooi-trade-struct';
import { VooiTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/vooi/vooi-trade';

export class VooiProvider extends EvmOnChainProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.LINEA;

    public readonly type = ON_CHAIN_TRADE_TYPE.VOOI;

    private readonly defaultOptions = {
        ...evmProviderDefaultOptions,
        deadlineMinutes: deadlineMinutesTimestamp(10)
    };

    private readonly contractAddress = '0xBc7f67fA9C72f9fcCf917cBCEe2a50dEb031462A';

    private readonly omniPoolAddress = '0x87E4c4517B28844f575Cfbbc4CABBD867863EA6E';

    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<EvmOnChainTrade> {
        const fromPoolId = vooiPoolIdMapping[fromToken.address.toLowerCase()];
        const toPoolId = vooiPoolIdMapping[toToken.address.toLowerCase()];

        if (fromPoolId === undefined || toPoolId === undefined) {
            throw new RubicSdkError('Vooi DEX supports only USDC.e, USDT, DAI token');
        }

        const fullOptions = combineOptions(options, this.defaultOptions);

        let weiAmountWithoutFee = fromToken.weiAmount;
        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;
        if (fullOptions.useProxy) {
            const proxyContractInfo = await this.handleProxyContract(
                new PriceTokenAmount({
                    ...fromToken.asStruct,
                    weiAmount: fromToken.weiAmount
                }),
                fullOptions
            );
            weiAmountWithoutFee = proxyContractInfo.fromWithoutFee.weiAmount;
            proxyFeeInfo = proxyContractInfo.proxyFeeInfo;
        }

        // let gasPriceInfo: GasPriceInfo | undefined;
        // if (fullOptions.gasCalculation !== 'disabled') {
        //     try {
        //         gasPriceInfo = await this.getGasPriceInfo();
        //     } catch {}
        // }

        const output = await this.getRoute(fromPoolId, toPoolId, weiAmountWithoutFee.toFixed());
        if (!output) {
            throw new RubicSdkError('Can not estimate the route');
        }

        const { from, to, fromWithoutFee } = getFromToTokensAmountsByExact(
            fromToken,
            toToken,
            'input',
            fromToken.weiAmount,
            weiAmountWithoutFee,
            output
        );

        const tradeStruct: VooiTradeStruct = {
            from,
            to,
            fromPoolId,
            toPoolId,
            gasFeeInfo: null,
            slippageTolerance: fullOptions.slippageTolerance,
            deadlineMinutes: fullOptions.deadlineMinutes,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain,
            path: [from, to]
        };

        return new VooiTrade(tradeStruct, fullOptions.providerAddress);

        // if (fullOptions.gasCalculation === 'disabled') {
        //     return new VooiTrade(tradeStruct, fullOptions.providerAddress);
        // }

        // const gasFeeInfo = getGasFeeInfo(estimatedGas, gasPriceInfo!);
        // return new VooiTrade({ ...tradeStruct, gasFeeInfo }, fullOptions.providerAddress);
    }

    private async getRoute(fromId: number, toId: number, fromAmount: string): Promise<BigNumber> {
        const web3 = Injector.web3PublicService.getWeb3Public(this.blockchain);
        const result = await web3.callContractMethod<{
            actualToAmount: string;
            lpFeeAmount: string;
        }>(this.omniPoolAddress, omniPoolAbi, 'quoteFrom', [fromId, toId, fromAmount]);
        return new BigNumber(result.actualToAmount);
    }
}
