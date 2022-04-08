import { OneinchTrade } from 'src/features';
import { Web3Pure } from 'src/core';
import { CrossChainInstantTrade } from '@features/cross-chain/cross-chain-contract-trade/it-cross-chain-contract-trade/cross-chain-instant-trade/models/cross-chain-instant-trade';

export class CrossChainOneinchTrade implements CrossChainInstantTrade {
    constructor(private readonly instantTrade: OneinchTrade) {}

    public getFirstPath(): string {
        return this.instantTrade.path[0].address;
    }

    public getSecondPath(): string[] {
        return this.instantTrade.wrappedPath.map(token => Web3Pure.addressToBytes32(token.address));
    }

    public async modifyArgumentsForProvider(
        methodArguments: unknown[][],
        walletAddress: string
    ): Promise<void> {
        const { data } = await this.instantTrade.encode({ fromAddress: walletAddress });
        methodArguments[0].push(data);
    }
}
