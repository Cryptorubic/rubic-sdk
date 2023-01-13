import { Via } from '@viaprotocol/router-sdk';
import {
    IActionStepTool,
    IGetRoutesRequestParams,
    IRoute
} from '@viaprotocol/router-sdk/dist/types';
import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import {
    BRIDGE_TYPE,
    bridges,
    BridgeType
} from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { viaContractAddress } from 'src/features/cross-chain/calculation-manager/providers/via-provider/constants/contract-data';
import {
    ViaCrossChainSupportedBlockchain,
    viaCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/via-provider/constants/via-cross-chain-supported-blockchain';
import { VIA_DEFAULT_CONFIG } from 'src/features/cross-chain/calculation-manager/providers/via-provider/constants/via-default-api-key';
import { ViaCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/via-provider/via-cross-chain-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

interface ToolType extends IActionStepTool {
    type: 'swap' | 'cross';
}

export class ViaCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.VIA;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is ViaCrossChainSupportedBlockchain {
        return viaCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as ViaCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as ViaCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        try {
            const fromChainId = blockchainId[fromBlockchain];
            const toChainId = blockchainId[toBlockchain];

            let feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const via = new Via({
                ...VIA_DEFAULT_CONFIG,
                timeout: options.timeout
            });

            const fromAddress = this.getWalletAddress(fromBlockchain);
            const toAddress = options.receiverAddress || fromAddress;
            const params: IGetRoutesRequestParams = {
                fromChainId,
                fromTokenAddress: from.address,
                // `number` max value is less, than from wei amount
                fromAmount: fromWithoutFee.stringWeiAmount as unknown as number,
                toChainId,
                toTokenAddress: toToken.address,
                ...(fromAddress && { fromAddress }),
                ...(toAddress && { toAddress }),
                multiTx: false,
                limit: 1
            };
            const wrappedRoutes = await via.getRoutes({
                ...params
            });
            const routes = wrappedRoutes.routes.filter(
                route => this.parseBridge(route) && this.isAvailableProvider(route)
            );
            if (!routes.length) {
                return { trade: null, error: new RubicSdkError('No available routes') };
            }

            const [fromTokenPrice, nativeTokenPrice] = await this.getTokensPrice(fromBlockchain, [
                {
                    address: from.address,
                    price: from.price
                },
                { address: EvmWeb3Pure.nativeTokenAddress }
            ]);
            const bestRoute = await this.getBestRoute(from, toToken, nativeTokenPrice!, routes);
            if (!bestRoute) {
                return null;
            }

            from = new PriceTokenAmount({
                ...from.asStructWithAmount,
                price: fromTokenPrice!
            });
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(bestRoute.toTokenAmount)
            });
            const toTokenAmountMin = Web3Pure.fromWei(
                to.weiAmountMinusSlippage((bestRoute.slippage || 0) / 100),
                to.decimals
            );

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await ViaCrossChainTrade.getGasData(from, to, bestRoute)
                    : null;

            const additionalFee = bestRoute.actions[0]?.additionalProviderFee;
            const cryptoFeeAmount = Web3Pure.fromWei(additionalFee?.amount.toString() || 0);
            const cryptoFeeSymbol = additionalFee?.token.symbol;
            feeInfo = {
                ...feeInfo,
                provider: {
                    ...(additionalFee && {
                        cryptoFee: {
                            amount: cryptoFeeAmount,
                            tokenSymbol: cryptoFeeSymbol!
                        }
                    })
                }
            };

            const nativeToken = nativeTokensList[from.blockchain];
            const cryptoFeeToken = new PriceTokenAmount({
                ...nativeToken,
                price: nativeTokenPrice || new BigNumber(0),
                tokenAmount: cryptoFeeAmount
            });

            const onChainType = this.parseOnChainProviders(bestRoute);
            const bridgeType = this.parseBridge(bestRoute);

            return {
                trade: new ViaCrossChainTrade(
                    {
                        from,
                        to,
                        route: bestRoute,
                        gasData,
                        priceImpact: 0, // @TODO add price impact
                        toTokenAmountMin,
                        feeInfo,
                        cryptoFeeToken,
                        onChainSubtype: onChainType,
                        bridgeType,
                        slippage: bestRoute.slippage || 0
                    },
                    options.providerAddress,
                    fromAddress
                )
            };
        } catch (err: unknown) {
            return {
                trade: null,
                error: CrossChainProvider.parseError(err)
            };
        }
    }

    private async getBestRoute(
        from: PriceTokenAmount,
        toToken: PriceToken,
        nativeTokenPrice: BigNumber | null,
        routes: IRoute[]
    ): Promise<IRoute | undefined> {
        const toTokenPrice = (await this.getTokensPrice(toToken.blockchain, [toToken]))[0];

        const filteredRoutes = routes.filter(route => {
            if (from.isNative) {
                return true;
            }

            const viaFromAmount = route.actions[0]?.fromTokenAmount;
            return viaFromAmount && from.weiAmount.gte(viaFromAmount);
        });
        const sortedRoutes = filteredRoutes.sort((routeA, routeB) => {
            if (!toTokenPrice) {
                return new BigNumber(routeB.toTokenAmount).comparedTo(routeA.toTokenAmount);
            }

            const nativeTokenAmountA = routeA.actions[0]?.additionalProviderFee?.amount;
            const nativeTokenAmountB = routeB.actions[0]?.additionalProviderFee?.amount;

            const routeProfitA = toTokenPrice
                .multipliedBy(routeA.toTokenAmount)
                .minus(nativeTokenPrice?.multipliedBy(nativeTokenAmountA?.toString() || 0) || 0);
            const routeProfitB = toTokenPrice
                .multipliedBy(routeB.toTokenAmount)
                .minus(nativeTokenPrice?.multipliedBy(nativeTokenAmountB?.toString() || 0) || 0);

            return routeProfitB.comparedTo(routeProfitA);
        });
        return sortedRoutes[0];
    }

    private async getTokensPrice(
        blockchain: BlockchainName,
        tokens: {
            address: string;
            price?: BigNumber;
        }[]
    ): Promise<(BigNumber | null)[]> {
        const chainId = blockchainId[blockchain];

        try {
            const response = await Injector.httpClient.get<{
                [chainId: number]: { [address: string]: { USD: number } };
            }>('https://explorer-api.via.exchange/v1/token_price', {
                params: {
                    chain: chainId,
                    tokens_addresses: tokens.map(token => token.address).join(',')
                }
            });
            return tokens.map(token => new BigNumber(response[chainId]![token.address]!.USD));
        } catch {
            return tokens.map(token => token.price || null);
        }
    }

    private parseOnChainProviders(route: IRoute): OnChainSubtype {
        const steps = route.actions[0]?.steps;

        const firstStep = steps?.[0];
        const firstItProvider =
            (firstStep?.tool as ToolType).type === 'swap' ? firstStep?.tool.name : undefined;

        const lastStep = steps?.reverse()[0];
        const secondItProvider =
            steps?.length && steps.length > 1 && (lastStep?.tool as ToolType).type === 'swap'
                ? lastStep?.tool.name
                : undefined;

        return {
            from: this.parseTradeType(firstItProvider),
            to: this.parseTradeType(secondItProvider)
        };
    }

    private parseTradeType(type: string | undefined): OnChainTradeType | undefined {
        if (!type) {
            return undefined;
        }

        type = type.toUpperCase();
        const foundType = Object.values(ON_CHAIN_TRADE_TYPE).find(
            tradeType => tradeType.split('_').join('') === type
        );
        if (foundType) {
            return foundType;
        }

        switch (type) {
            case '0x':
                return ON_CHAIN_TRADE_TYPE.ZRX;
            case '1INCH':
                return ON_CHAIN_TRADE_TYPE.ONE_INCH;
            case '1SOL':
                return ON_CHAIN_TRADE_TYPE.ONE_SOL;
            case 'DODOEX':
                return ON_CHAIN_TRADE_TYPE.DODO;
            case 'TRADERJOE':
                return ON_CHAIN_TRADE_TYPE.JOE;
            case 'UNISWAP':
                return ON_CHAIN_TRADE_TYPE.UNISWAP_V2;
            default:
                return undefined;
        }
    }

    private parseBridge(route: IRoute): BridgeType {
        const bridgeApi = route.actions[0]?.steps.find(
            step => (step.tool as ToolType).type === 'cross'
        )?.tool.name;
        if (!bridgeApi) {
            return BRIDGE_TYPE.VIA;
        }

        return (
            bridges.find(
                bridge => bridge.toLowerCase() === bridgeApi.split(' ')[0]?.toLowerCase()
            ) || BRIDGE_TYPE.VIA
        );
    }

    protected override async getFeeInfo(
        fromBlockchain: ViaCrossChainSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount
    ): Promise<FeeInfo> {
        return {
            rubicProxy: {
                fixedFee: {
                    amount: await this.getFixedFee(
                        fromBlockchain,
                        providerAddress,
                        viaContractAddress[fromBlockchain],
                        evmCommonCrossChainAbi
                    ),
                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                },
                platformFee: {
                    percent: await this.getFeePercent(
                        fromBlockchain,
                        providerAddress,
                        viaContractAddress[fromBlockchain],
                        evmCommonCrossChainAbi
                    ),
                    tokenSymbol: percentFeeToken.symbol
                }
            }
        };
    }

    private isAvailableProvider(route: IRoute): boolean {
        const blacklistProviders = ['thorchain'];
        return !route.actions.some(action =>
            action.steps.some(step => blacklistProviders.includes(step.tool.name.toLowerCase()))
        );
    }
}
