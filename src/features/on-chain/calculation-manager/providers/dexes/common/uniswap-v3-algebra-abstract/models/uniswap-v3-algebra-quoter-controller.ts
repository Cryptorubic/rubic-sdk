import { PriceToken } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { UniswapV3AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-route';
import { AbiItem } from 'web3-utils';

export abstract class UniswapV3AlgebraQuoterController {
    protected abstract readonly quoterContractAddress: string;

    protected abstract readonly quoterContractABI: AbiItem[];

    protected abstract readonly blockchain: EvmBlockchainName;

    /**
     * Returns all routes between given tokens with output amount.
     * @param from From token.
     * @param to To token.
     * @param exact Is exact input or output trade.
     * @param weiAmount Amount of tokens to trade.
     * @param routeMaxTransitTokens Max amount of transit tokens.
     */
    public abstract getAllRoutes(
        from: PriceToken,
        to: PriceToken,
        exact: Exact,
        weiAmount: string,
        routeMaxTransitTokens: number
    ): Promise<UniswapV3AlgebraRoute[]>;
}
