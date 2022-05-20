import { Web3Pure } from 'src/core';
import { CrossChainInstantTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/common/cross-chain-instant-trade';
import { AlgebraTrade } from '@features/instant-trades/dexes/polygon/algebra/algebra-trade';
import { AlgebraQuoterController } from '@features/instant-trades/dexes/polygon/algebra/utils/quoter-controller/algebra-quoter-controller';
import { SwapInfoDest } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/swap-info-dest.interface';
import { SwapInfoV3 } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/swap-info-v3.interface';
import { UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/constants/swap-router-contract-abi';
import { UniswapV2AbstractTrade } from 'src/features';
import { EMPTY_ADDRESS } from '@core/blockchain/constants/empty-address';

export class CrossChainAlgebraTrade implements CrossChainInstantTrade {
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

    // @TODO
    public getCelerSourceObject(slippage: number): SwapInfoV3 {
        const dex = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS;
        const path = this.getFirstPath();
        const amountOutMinimum = this.instantTrade.toTokenAmountMin
            .weiAmountMinusSlippage(slippage)
            .toFixed(0);

        return { dex, path, deadline: 0, amountOutMinimum };
    }

    // @TODO
    public getCelerDestinationObject(slippage: number): SwapInfoDest {
        const dex = UniswapV2AbstractTrade.getContractAddress(this.instantTrade.from.blockchain);
        const path = this.getSecondPath();
        const deadline = 0;
        const amountOutMinimum = this.instantTrade.toTokenAmountMin
            .weiAmountMinusSlippage(slippage)
            .toFixed(0);

        return { dex, integrator: EMPTY_ADDRESS, path, deadline, amountOutMinimum };
    }
}
