import { Web3Pure } from 'src/core';
import { CrossChainInstantTrade } from '@features/cross-chain/cross-chain-contract-trade/it-cross-chain-contract-trade/cross-chain-instant-trade/models/cross-chain-instant-trade';
import { AlgebraTrade } from '@features/instant-trades/dexes/polygon/algebra/algebra-trade';
import { AlgebraQuoterController } from '@features/instant-trades/dexes/polygon/algebra/utils/quoter-controller/algebra-quoter-controller';

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
}
