import { PriceToken, PriceTokenAmount, wrappedNativeTokensList } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { combineOptions } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { IzumiQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-quoter-controller';
import { IzumiTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-trade';
import { IzumiTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/models/izumi-trade-struct';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { UniswapV2CalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-calculation-options';

export abstract class IzumiProvider extends EvmOnChainProvider {
    public abstract readonly blockchain: EvmBlockchainName;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.IZUMI;
    }

    protected readonly defaultOptions: UniswapV2CalculationOptions = {
        ...evmProviderDefaultOptions,
        deadlineMinutes: 20,
        disableMultihops: false
    };

    protected abstract readonly dexAddress: string;

    protected abstract readonly quoterAddress: string;

    protected abstract readonly izumiConfig: {
        readonly maxTransitTokens: number;
        readonly routingTokenAddresses: string[];
    };

    protected abstract readonly quoterController: IzumiQuoterController;

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<EvmOnChainTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;
        let weiAmountWithoutFee = from.stringWeiAmount;

        if (fullOptions.useProxy) {
            const proxyContractInfo = await this.handleProxyContract(
                new PriceTokenAmount({
                    ...from.asStruct,
                    weiAmount: from.weiAmount
                }),
                fullOptions
            );
            proxyFeeInfo = proxyContractInfo.proxyFeeInfo;
            weiAmountWithoutFee = proxyContractInfo.fromWithoutFee.stringWeiAmount;
        }

        // const fromChainId = blockchainId[from.blockchain];
        // quoterSwapChainWithExactInput

        const route = await this.quoterController.getAllRoutes(
            from,
            to,
            fullOptions,
            weiAmountWithoutFee
        );

        const wrapAddress = wrappedNativeTokensList[from.blockchain]?.address;

        // const fromAddress = from.isNative ? wrapAddress : from.address;
        // const toAddress = to.isNative ? wrapAddress : to.address;
        // if (!fromAddress || !toAddress) {
        //     throw new RubicSdkError('Cant estimate trade');
        // }
        //
        // const tokenA = {
        //     address: fromAddress,
        //     chainId: fromChainId,
        //     symbol: from.symbol,
        //     decimal: fromChainId,
        //     name: from.name
        // } as TokenInfoFormatted;
        //
        // const tokenB = {
        //     address: toAddress,
        //     chainId: fromChainId,
        //     symbol: to.symbol,
        //     decimal: to.decimals,
        //     name: to.name
        // } as TokenInfoFormatted;
        // const fee = 400;
        //
        // const chainPath = getTokenChainPath([tokenA, tokenB], [fee]);
        // const { acquire } = await this.web3Public.callContractMethod<{ acquire: string }>(
        //     this.quoterAddress,
        //     izumiQuoterContractAbi,
        //     'swapAmount',
        //     [weiAmountWithoutFee, chainPath]
        // );
        // const output = acquire.toString();
        //
        // if (!output) {
        //     throw new RubicSdkError('Trade is not available');
        // }

        const toToken = new PriceTokenAmount({
            ...to.asStruct,
            tokenAmount: Web3Pure.fromWei(route.outputAbsoluteAmount, to.decimals)
        });

        const tradeStruct: IzumiTradeStruct = {
            from,
            to: toToken,
            path: [from, to],
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee: from,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain,
            dexContractAddress: this.dexAddress,
            swapConfig: {
                tokenChain: route.tokenChain,
                feeChain: route.feeChain
            },
            strictERC20Token:
                compareAddresses(wrapAddress!, from.address) ||
                compareAddresses(wrapAddress!, to.address)
        };
        if (options?.gasCalculation === 'calculate') {
            try {
                const gasPriceInfo = await this.getGasPriceInfo();
                const gasLimit = await IzumiTrade.getGasLimit(
                    tradeStruct,
                    fullOptions.providerAddress
                );
                tradeStruct.gasFeeInfo = getGasFeeInfo(gasLimit, gasPriceInfo!);
            } catch {}
        }

        return new IzumiTrade(tradeStruct, fullOptions.providerAddress);
    }
}
