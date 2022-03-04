export interface CrossChainInstantTrade {
    getFirstPath(): string[] | string;

    getSecondPath(): string[];

    modifyArgumentsForProvider(methodArguments: unknown[][], walletAddress: string): Promise<void>;
}
