import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { Injector } from 'src/core/injector/injector';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { DefaultRoutesMethodArguments } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/routes-method-arguments';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { MUTE_SWAP_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/mute-swap/constants';
import { muteSwapAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/mute-swap/mute-swap-abi';

export class MuteSwapTrade extends UniswapV2AbstractTrade {
    public static callForRoutes(
        blockchain: EvmBlockchainName,
        exact: Exact,
        routesMethodArguments: DefaultRoutesMethodArguments
    ): Promise<ContractMulticallResponse<string[]>[]> {
        const web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
        const methodName = exact === 'input' ? 'getAmountsOut' : 'getAmountsIn';
        const args = routesMethodArguments.map(arg => [arg[0], arg[1], arg[1].map(() => false)]);

        return web3Public.multicallContractMethod<string[]>(
            this.getDexContractAddress(blockchain),
            this.contractAbi,
            methodName,
            args
        );
    }

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.MUTE_SWAP;
    }

    public static readonly contractAbi = muteSwapAbi;

    public readonly dexContractAddress = MUTE_SWAP_CONTRACT_ADDRESS;

    protected getCallParameters(receiverAddress?: string): unknown[] {
        const { amountIn, amountOut } = this.getAmountInAndAmountOut();
        const amountParameters = this.from.isNative ? [amountOut] : [amountIn, amountOut];

        return [
            ...amountParameters,
            this.wrappedPath.map(t => t.address),
            receiverAddress || this.walletAddress,
            this.deadlineMinutesTimestamp,
            this.wrappedPath.map(() => false)
        ];
    }
}
