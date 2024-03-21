import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { Injector } from 'src/core/injector/injector';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { DefaultRoutesMethodArgument } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/route-method-arguments';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    ASCENT_CONTRACT_ABI,
    ASCENT_HORIZEN_EON_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/horizen-eon/ascent-horizon-eon/constants';

export class AscentHorizenEonTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ASCENT;
    }

    public readonly dexContractAddress = ASCENT_HORIZEN_EON_CONTRACT_ADDRESS;

    public static readonly contractAbi = ASCENT_CONTRACT_ABI;

    public static async callForRoutes(
        blockchain: EvmBlockchainName,
        exact: Exact,
        routesMethodArguments: DefaultRoutesMethodArgument[]
    ): Promise<ContractMulticallResponse<string[]>[]> {
        const web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
        const methodName = exact === 'input' ? 'getAmountsOut' : 'getAmountsIn';
        const args = routesMethodArguments.map(([amount, routes]) => {
            const [firstRoute, ...otherRoutes] = routes;
            const routesArgs = otherRoutes.map(
                (route, index) =>
                    (index === 0
                        ? [firstRoute!, route, false]
                        : [otherRoutes[index - 1]!, route, false]) as [string, string, boolean]
            );
            return [amount, routesArgs];
        });

        return web3Public.multicallContractMethod<string[]>(
            this.getDexContractAddress(blockchain),
            this.contractAbi,
            methodName,
            args
        );
    }

    protected getCallParameters(receiverAddress?: string): unknown[] {
        const { amountIn, amountOut } = this.getAmountInAndAmountOut();
        const amountParameters = this.from.isNative ? [amountOut] : [amountIn, amountOut];

        const [firstToken, ...otherTokens] = [...this.wrappedPath];
        const path = otherTokens.map((token, index) =>
            index === 0
                ? [firstToken!.address, token.address, false]
                : [otherTokens[index - 1]!.address, token.address, false]
        );

        return [
            ...amountParameters,
            path,
            receiverAddress || this.walletAddress,
            this.deadlineMinutesTimestamp
        ];
    }
}
