import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { ContractMulticallResponse } from '@core/blockchain/web3-public/models/contract-multicall-response';
import { Injector } from '@core/sdk/injector';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import {
    SOLARBEAM_CONTRACT_ABI,
    SOLARBEAM_CONTRACT_ADDRESS
} from '@features/swap/trades/moonriver/solarbeam/constants';

export class SolarbeamTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = SOLARBEAM_CONTRACT_ABI;

    public static callForRoutes(
        blockchain: BLOCKCHAIN_NAME,
        exact: 'input' | 'output',
        routesMethodArguments: [string, string[]][]
    ): Promise<ContractMulticallResponse<{ amounts: string[] }>[]> {
        const web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
        return web3Public.multicallContractMethod<{ amounts: string[] }>(
            this.getContractAddress(),
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
