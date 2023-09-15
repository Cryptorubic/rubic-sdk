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
    SOLARBEAM_CONTRACT_ABI,
    SOLARBEAM_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/moonriver/solarbeam/constants';

export class SolarbeamTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = SOLARBEAM_CONTRACT_ABI;

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SOLAR_BEAM;
    }

    public static callForRoutes(
        blockchain: EvmBlockchainName,
        exact: Exact,
        routesMethodArguments: DefaultRoutesMethodArgument[]
    ): Promise<ContractMulticallResponse<string[]>[]> {
        const web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
        return web3Public.multicallContractMethod<string[]>(
            this.getDexContractAddress(blockchain),
            this.contractAbi,
            exact === 'input' ? 'getAmountsOut' : 'getAmountsIn',
            routesMethodArguments.map(args => args.concat(this.feeParameter))
        );
    }

    private static readonly feeParameter = '25';

    public readonly dexContractAddress = SOLARBEAM_CONTRACT_ADDRESS;
}
