import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { ContractMulticallResponse } from '@core/blockchain/web3-public/models/contract-multicall-response';
import { Injector } from '@core/sdk/injector';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    SOLARBEAM_CONTRACT_ABI,
    SOLARBEAM_CONTRACT_ADDRESS
} from '@features/instant-trades/dexes/moonriver/solarbeam/constants';
import { TRADE_TYPE, TradeType } from 'src/features';
import { Exact } from '@features/instant-trades/models/exact';

export class SolarbeamTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = SOLARBEAM_CONTRACT_ABI;

    public static get type(): TradeType {
        return TRADE_TYPE.SOLAR_BEAM;
    }

    public static callForRoutes(
        blockchain: BLOCKCHAIN_NAME,
        exact: Exact,
        routesMethodArguments: [string, string[]][]
    ): Promise<ContractMulticallResponse<{ amounts: string[] }>[]> {
        const web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
        return web3Public.multicallContractMethod<{ amounts: string[] }>(
            this.getContractAddress(blockchain),
            this.contractAbi,
            exact === 'input' ? 'getAmountsOut' : 'getAmountsIn',
            routesMethodArguments.map(args => args.concat(this.feeParameter))
        );
    }

    private static readonly feeParameter = '25';

    protected readonly contractAddress = SOLARBEAM_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
