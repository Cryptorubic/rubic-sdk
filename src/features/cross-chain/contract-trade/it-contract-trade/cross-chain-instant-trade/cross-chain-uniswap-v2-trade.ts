import { UniswapV2AbstractTrade } from 'src/features';
import { Web3Pure } from 'src/core';
import { CrossChainInstantTrade } from '@features/cross-chain/contract-trade/it-contract-trade/cross-chain-instant-trade/models/cross-chain-instant-trade';

export class CrossChainUniswapV2Trade implements CrossChainInstantTrade {
    constructor(private readonly instantTrade: UniswapV2AbstractTrade) {}

    public getFirstPath(): string[] {
        return this.instantTrade.wrappedPath.map(token => token.address);
    }

    public getSecondPath(): string[] {
        return this.instantTrade.wrappedPath.map(token => Web3Pure.addressToBytes32(token.address));
    }

    public async modifyArgumentsForProvider(methodArguments: unknown[][]): Promise<void> {
        const exactTokensForTokens = true;
        const swapTokenWithFee = false;

        methodArguments[0].push(exactTokensForTokens);
        methodArguments[0].push(swapTokenWithFee);
    }
}
