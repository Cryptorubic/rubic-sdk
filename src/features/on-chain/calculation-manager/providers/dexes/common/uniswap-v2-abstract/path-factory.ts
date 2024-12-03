import BigNumber from 'bignumber.js';
import { InsufficientLiquidityError, RubicSdkError } from 'src/common/errors';
import { PriceToken, Token } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { notNull } from 'src/common/utils/object';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { Injector } from 'src/core/injector/injector';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { DefaultRoutesMethodArgument } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/route-method-arguments';
import { UniswapCalculatedInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-calculated-info';
import { UniswapRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-route';
import { UniswapV2CalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-calculation-options';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-trade-class';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { hasLengthAtLeast } from 'src/features/on-chain/calculation-manager/utils/type-guards';

export interface PathFactoryStruct {
    readonly from: PriceToken<EvmBlockchainName>;
    readonly to: PriceToken<EvmBlockchainName>;
    readonly weiAmount: BigNumber;
    readonly exact: Exact;
    readonly options: UniswapV2CalculationOptions;
    readonly proxyFeeInfo: OnChainProxyFeeInfo | undefined;
}

export interface UniswapV2AbstractProviderStruct<T extends UniswapV2AbstractTrade> {
    readonly UniswapV2TradeClass: UniswapV2TradeClass<T>;
    readonly providerSettings: UniswapV2ProviderConfiguration;
}

export class PathFactory<T extends UniswapV2AbstractTrade> {
    private readonly web3Public: EvmWeb3Public;

    protected readonly from: PriceToken<EvmBlockchainName>;

    protected readonly to: PriceToken<EvmBlockchainName>;

    private readonly weiAmount: BigNumber;

    protected readonly exact: Exact;

    private readonly options: UniswapV2CalculationOptions;

    private readonly proxyFeeInfo: OnChainProxyFeeInfo | undefined;

    protected readonly UniswapV2TradeClass: UniswapV2TradeClass<T>;

    protected readonly routingProvidersAddresses: ReadonlyArray<string>;

    protected readonly maxTransitTokens: number;

    private get walletAddress(): string | undefined {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain).address;
    }

    @Cache
    protected get stringWeiAmount(): string {
        return this.weiAmount.toFixed(0);
    }

    constructor(
        uniswapProviderStruct: UniswapV2AbstractProviderStruct<T>,
        pathFactoryStruct: PathFactoryStruct
    ) {
        this.web3Public = Injector.web3PublicService.getWeb3Public(
            pathFactoryStruct.from.blockchain
        );

        this.from = pathFactoryStruct.from;
        this.to = pathFactoryStruct.to;
        this.weiAmount = pathFactoryStruct.weiAmount;
        this.exact = pathFactoryStruct.exact;
        this.options = pathFactoryStruct.options;
        this.UniswapV2TradeClass = uniswapProviderStruct.UniswapV2TradeClass;
        this.routingProvidersAddresses =
            uniswapProviderStruct.providerSettings.routingProvidersAddresses;
        this.maxTransitTokens = pathFactoryStruct.options.disableMultihops
            ? 0
            : uniswapProviderStruct.providerSettings.maxTransitTokens;
        this.proxyFeeInfo = pathFactoryStruct.proxyFeeInfo;
    }

    public async getAmountAndPath(): Promise<UniswapCalculatedInfo> {
        const allRoutes = await this.getAllRoutes();
        const sortedRoutes = allRoutes
            .filter(route => route.outputAbsoluteAmount.gt(0))
            .sort(
                (a, b) =>
                    b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount) *
                    (this.exact === 'input' ? 1 : -1)
            );
        if (sortedRoutes.length === 0) {
            throw new InsufficientLiquidityError();
        }

        if (!hasLengthAtLeast(sortedRoutes, 1)) {
            throw new RubicSdkError('Routes array length has to be bigger than 0');
        }
        return {
            route: sortedRoutes[0]
        };
    }

    protected async getAllRoutes(): Promise<UniswapRoute[]> {
        const transitTokens = await Token.createTokens(
            this.routingProvidersAddresses,
            this.from.blockchain
        );

        const vertexes: Token[] = transitTokens.filter(
            elem => !elem.isEqualTo(this.from) && !elem.isEqualTo(this.to)
        );

        const initialPath = [this.from];
        const routesPaths: Token[][] = [];
        const routesMethodArguments: DefaultRoutesMethodArgument[] = [];

        const recGraphVisitor = (path: Token[], transitTokensLimit: number): void => {
            if (path.length === transitTokensLimit + 1) {
                const finalPath = path.concat(this.to);
                routesPaths.push(finalPath);
                routesMethodArguments.push([
                    this.stringWeiAmount,
                    Token.tokensToAddresses(finalPath)
                ]);
                return;
            }

            vertexes
                .filter(vertex => path.every(token => !token.isEqualTo(vertex)))
                .forEach(vertex => {
                    const extendedPath = path.concat(vertex);
                    recGraphVisitor(extendedPath, transitTokensLimit);
                });
        };

        for (let i = 0; i <= this.maxTransitTokens; i++) {
            recGraphVisitor(initialPath, i);
        }

        const responses = await this.UniswapV2TradeClass.callForRoutes(
            this.from.blockchain,
            this.exact,
            routesMethodArguments
        );

        const tokens = responses.map((response, index) => {
            if (!response.success || !response.output) {
                return null;
            }
            const amounts = response.output;

            const numberAmount = this.exact === 'input' ? amounts[amounts.length - 1] : amounts[0];
            if (!numberAmount) {
                throw new RubicSdkError('Amount has to be defined');
            }
            const outputAbsoluteAmount = new BigNumber(numberAmount);

            const path = routesPaths?.[index];
            if (!path) {
                throw new RubicSdkError('Path has to be defined');
            }

            return { outputAbsoluteAmount, path };
        });

        return tokens.filter(notNull);
    }
}
