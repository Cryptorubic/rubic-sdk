import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { notNull } from 'src/common/utils/object';
import { AerodromeTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/base/aerodrome/aerodrome-trade';
import { AerodromeRoutesMethodArgument } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/aerodrome-route-method-arguments';
import { UniswapRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-route';
import { PathFactory } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/path-factory';

export class AerodromePathFactory extends PathFactory<AerodromeTrade> {
    protected async getAllRoutes(): Promise<UniswapRoute[]> {
        const transitTokens = await Token.createTokens(
            this.routingProvidersAddresses,
            this.from.blockchain
        );

        const vertexes: Token[] = transitTokens.filter(
            elem => !elem.isEqualTo(this.from) && !elem.isEqualTo(this.to)
        );

        const initialPath = [this.from];
        const routes: { path: Token[]; methodArguments: AerodromeRoutesMethodArgument }[] = [];

        const updRoutesMethodArgumentsWithTransitToken = (
            finalPath: Token[],
            tokenA: string,
            tokenB: string,
            tokenC: string,
            isPairAStablePool: boolean,
            isPairBStablePool: boolean
        ) => {
            routes.push({
                path: finalPath,
                methodArguments: [
                    this.stringWeiAmount,
                    [
                        [
                            tokenA,
                            tokenB,
                            isPairAStablePool,
                            '0x420DD381b31aEf6683db6B902084cB0FFECe40Da'
                        ],
                        [
                            tokenB,
                            tokenC,
                            isPairBStablePool,
                            '0x420DD381b31aEf6683db6B902084cB0FFECe40Da'
                        ]
                    ]
                ]
            });
        };

        const updRoutesMethodArgumentsWithoutTransitToken = (
            finalPath: Token[],
            tokenA: string,
            tokenB: string,
            isStable: boolean
        ) => {
            routes.push({
                path: finalPath,
                methodArguments: [
                    this.stringWeiAmount,
                    [[tokenA, tokenB, isStable, '0x420DD381b31aEf6683db6B902084cB0FFECe40Da']]
                ]
            });
        };

        const recGraphVisitor = (path: Token[], transitTokensLimit: number): void => {
            if (path.length === transitTokensLimit + 1) {
                const finalPath = path.concat(this.to);
                const tokens = Token.tokensToAddresses(finalPath);

                if (tokens.length > 3) {
                    throw new RubicSdkError('Maximum number of transit tokens: 1');
                }

                if (tokens.length === 2) {
                    updRoutesMethodArgumentsWithoutTransitToken(
                        finalPath,
                        tokens[0]!,
                        tokens[1]!,
                        true
                    );
                    updRoutesMethodArgumentsWithoutTransitToken(
                        finalPath,
                        tokens[0]!,
                        tokens[1]!,
                        false
                    );
                }

                if (tokens.length === 3) {
                    updRoutesMethodArgumentsWithTransitToken(
                        finalPath,
                        tokens[0]!,
                        tokens[1]!,
                        tokens[2]!,
                        true,
                        true
                    );
                    updRoutesMethodArgumentsWithTransitToken(
                        finalPath,
                        tokens[0]!,
                        tokens[1]!,
                        tokens[2]!,
                        false,
                        false
                    );
                    updRoutesMethodArgumentsWithTransitToken(
                        finalPath,
                        tokens[0]!,
                        tokens[1]!,
                        tokens[2]!,
                        false,
                        true
                    );
                    updRoutesMethodArgumentsWithTransitToken(
                        finalPath,
                        tokens[0]!,
                        tokens[1]!,
                        tokens[2]!,
                        true,
                        false
                    );
                }
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
            routes.map(route => route.methodArguments)
        );

        const tokens = responses.map((response, index) => {
            if (!response.success || !response.output || !(response.output[1] !== '0')) {
                return null;
            }
            const amounts = response.output;

            const numberAmount = this.exact === 'input' ? amounts[amounts.length - 1] : amounts[0];
            if (!numberAmount) {
                throw new RubicSdkError('Amount has to be defined');
            }
            const outputAbsoluteAmount = new BigNumber(numberAmount);

            const path = routes?.[index]?.path;
            const routPoolInfo = routes?.[index]?.methodArguments[1][0];

            if (!path || !routPoolInfo) {
                throw new RubicSdkError('Path has to be defined');
            }

            return { outputAbsoluteAmount, path, routPoolInfo };
        });

        return tokens.filter(notNull);
    }
}
