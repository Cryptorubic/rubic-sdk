import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, Token } from 'src/common/tokens';
import { notNull } from 'src/common/utils/object';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/algebra/algebra-quoter-controller';
import { AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/models/algebra-route';

interface GetQuoterMethodsDataOptions {
    routesTokens: Token[];
    to: Token;
    exact: Exact;
    weiAmount: string;
    maxTransitTokens: number;
}

export class FenixQuoterController extends AlgebraQuoterController {
    public async getAllRoutes(
        from: PriceToken,
        to: PriceToken,
        exact: Exact,
        weiAmount: string,
        routeMaxTransitTokens: number
    ): Promise<AlgebraRoute[]> {
        const routesTokens = (await this.getOrCreateRouterTokens()).filter(
            token => !token.isEqualToTokens([from, to])
        );

        const options: Omit<GetQuoterMethodsDataOptions, 'maxTransitTokens'> = {
            routesTokens,
            to,
            exact,
            weiAmount
        };
        const quoterMethodsData = [...Array(routeMaxTransitTokens + 1)]
            .map((_, maxTransitTokens) =>
                this.getQuoterMethodsData(
                    {
                        ...options,
                        maxTransitTokens
                    },
                    [from]
                )
            )
            .flat();

        const results = await this.web3Public.multicallContractMethods<string>(
            this.quoterContractAddress,
            this.quoterContractABI,
            quoterMethodsData.map(quoterMethodData => {
                if (quoterMethodData.methodData.methodName.toLowerCase().includes('single')) {
                    return {
                        methodName: quoterMethodData.methodData.methodName,
                        methodArguments: [quoterMethodData.methodData.methodArguments]
                    };
                }

                return quoterMethodData.methodData;
            })
        );

        return results
            .map((result: ContractMulticallResponse<string>, index: number) => {
                if (result.success) {
                    const quoter = quoterMethodsData?.[index];
                    if (!quoter) {
                        throw new RubicSdkError('Quoter has to be defined');
                    }
                    return {
                        outputAbsoluteAmount: new BigNumber(result.output!),
                        path: quoter.path
                    };
                }
                return null;
            })
            .filter(notNull);
    }
}
