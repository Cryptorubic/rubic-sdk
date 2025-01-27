import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { FRAXSWAP_V2_CONTRACT_ADDRESS } from './constants';
import { ExtendedRoutesMethodArguments } from '../../common/uniswap-v2-abstract/models/route-method-arguments';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { Injector } from 'src/core/injector/injector';
import { Exact } from '../../../common/on-chain-trade/evm-on-chain-trade/models/exact';
import { AbiItem } from 'web3-utils';
import { FRAXSWAP_V2_ABI } from './frax-swap-v2-abi';

export class FraxSwapV2Trade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.FRAX_SWAP_V2;
    }

    public readonly dexContractAddress = FRAXSWAP_V2_CONTRACT_ADDRESS;

    /** @internal */
    public static readonly contractAbi: AbiItem[] = FRAXSWAP_V2_ABI;

    public static override callForRoutes(
        blockchain: EvmBlockchainName,
        exact: Exact,
        routesMethodArguments: ExtendedRoutesMethodArguments
    ): Promise<ContractMulticallResponse<string[]>[]> {
        const web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
        const methodName = exact === 'input' ? 'getAmountsOutWithTwamm' : 'getAmountsInWithTwamm';
        return web3Public.multicallContractMethod<string[]>(
            this.getDexContractAddress(blockchain),
            this.contractAbi,
            methodName,
            routesMethodArguments
        );
    }
}
