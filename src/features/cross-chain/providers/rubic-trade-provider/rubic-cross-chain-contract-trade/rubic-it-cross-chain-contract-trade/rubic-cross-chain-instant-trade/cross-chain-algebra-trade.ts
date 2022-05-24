import { Web3Pure } from 'src/core';
import { CrossChainInstantTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/common/cross-chain-instant-trade';
import { AlgebraTrade } from '@features/instant-trades/dexes/polygon/algebra/algebra-trade';
import { AlgebraQuoterController } from '@features/instant-trades/dexes/polygon/algebra/utils/quoter-controller/algebra-quoter-controller';
import { DestinationCelerSwapInfo } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/destination-celer-swap-info';
import { v3LikeCelerSwapInfo } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/v3-like-celer-swap-info';
import { EMPTY_ADDRESS } from '@core/blockchain/constants/empty-address';
import { SwapVersion } from '@features/cross-chain/providers/common/models/provider-type.enum';
import { ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS } from '@features/instant-trades/dexes/polygon/algebra/constants/swap-router-contract-data';

export class CrossChainAlgebraTrade implements CrossChainInstantTrade {
    readonly defaultDeadline = 999999999999999;

    constructor(private readonly instantTrade: AlgebraTrade) {}

    public getFirstPath(): string {
        return AlgebraQuoterController.getEncodedPath(Array.from(this.instantTrade.path));
    }

    public getSecondPath(): string[] {
        return this.instantTrade.wrappedPath.map(token => Web3Pure.addressToBytes32(token.address));
    }

    public async modifyArgumentsForProvider(methodArguments: unknown[][]): Promise<void> {
        const exactTokensForTokens = true;

        methodArguments[0].push(exactTokensForTokens);
    }

    public getCelerSourceObject(slippage: number): v3LikeCelerSwapInfo {
        const dex = ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS;
        const path = this.getFirstPath();
        const amountOutMinimum = this.instantTrade.toTokenAmountMin
            .weiAmountMinusSlippage(slippage)
            .toFixed(0);

        return { dex, path, deadline: this.defaultDeadline, amountOutMinimum };
    }

    public getCelerDestinationObject(
        slippage: number,
        integratorAddress: string
    ): DestinationCelerSwapInfo {
        const dex = ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS;
        const pathV3 = this.getSecondPath();
        const deadline = this.defaultDeadline;
        const amountOutMinimum = this.instantTrade.toTokenAmountMin
            .weiAmountMinusSlippage(slippage)
            .toFixed(0);

        return {
            dex,
            integrator: integratorAddress,
            version: SwapVersion.V3,
            path: EMPTY_ADDRESS,
            pathV3,
            deadline,
            amountOutMinimum
        };
    }
}
