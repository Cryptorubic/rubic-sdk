import { getMulticallContracts } from 'iziswap-sdk/lib/base';
import { searchPathQuery } from 'iziswap-sdk/lib/search/func';
import { SearchPathQueryParams, SwapDirection } from 'iziswap-sdk/lib/search/types';
import { PriceToken, PriceTokenAmount, Token, wrappedNativeTokensList } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { combineOptions } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { MULTICALL_ADDRESSES } from 'src/core/blockchain/web3-public-service/web3-public/constants/multicall-addresses';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
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

    protected abstract readonly config: {
        readonly maxTransitTokens: number;
        readonly routingTokenAddresses: string[];
        readonly liquidityManagerAddress: string;
        readonly quoterAddress: string;
    };

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

        const chainId = blockchainId[from.blockchain];

        const { web3 } = Injector.web3PrivateService.getWeb3Private('EVM');
        const multicallContract = getMulticallContracts(MULTICALL_ADDRESSES[from.blockchain], web3);

        const transitTokens = await Token.createTokens(
            this.config.routingTokenAddresses,
            this.blockchain
        );

        const tokenIn = {
            chainId,
            symbol: from.symbol,
            address: from.address,
            decimal: from.decimals
        };

        const tokenOut = {
            chainId,
            symbol: to.symbol,
            address: to.address,
            decimal: to.decimals
        };

        const midTokenList = transitTokens.map(token => ({
            chainId,
            symbol: token.symbol,
            address: token.address,
            decimal: token.decimals
        }));

        const searchParams = {
            chainId,
            web3,
            multicall: multicallContract,
            tokenIn,
            tokenOut,
            liquidityManagerAddress: this.config.liquidityManagerAddress,
            quoterAddress: this.config.quoterAddress,
            poolBlackList: [],
            midTokenList,
            supportFeeContractNumbers: [2000, 400, 100],
            support001Pools: [],
            direction: SwapDirection.ExactIn,
            amount: weiAmountWithoutFee
        } as SearchPathQueryParams;

        let pathQueryResult = null;
        try {
            const result = await searchPathQuery(searchParams);
            pathQueryResult = result.pathQueryResult;
        } catch (err) {
            console.log(err);
            throw err;
        }

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
            tokenAmount: Web3Pure.fromWei(pathQueryResult.amount, to.decimals)
        });

        const path = await Token.createTokens(
            pathQueryResult.path.tokenChain.map(token => token.address),
            from.blockchain
        );

        const tradeStruct: IzumiTradeStruct = {
            from,
            to: toToken,
            path,
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee: from,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain,
            dexContractAddress: this.dexAddress,
            swapConfig: {
                tokenChain: [],
                feeChain: []
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
