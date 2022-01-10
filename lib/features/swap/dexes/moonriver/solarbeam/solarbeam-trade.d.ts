import { BLOCKCHAIN_NAME } from '../../../../../core/blockchain/models/BLOCKCHAIN_NAME';
import { ContractMulticallResponse } from '../../../../../core/blockchain/web3-public/models/contract-multicall-response';
import { UniswapV2AbstractTrade, UniswapV2TradeStruct } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TradeType } from '../../../..';
export declare class SolarbeamTrade extends UniswapV2AbstractTrade {
    static readonly contractAbi: import("web3-utils").AbiItem[];
    static get type(): TradeType;
    static callForRoutes(blockchain: BLOCKCHAIN_NAME, exact: 'input' | 'output', routesMethodArguments: [string, string[]][]): Promise<ContractMulticallResponse<{
        amounts: string[];
    }>[]>;
    private static readonly feeParameter;
    protected readonly contractAddress = "0xAA30eF758139ae4a7f798112902Bf6d65612045f";
    constructor(tradeStruct: UniswapV2TradeStruct);
}
