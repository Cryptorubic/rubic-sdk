import { StaticToken } from './lifi-cross-chain-token';

export const exchangeTool = {
    ONEINCH: '1inch',
    PARASWAP: 'paraswap',
    OPENOCEAN: 'openocean',
    ZEROX: '0x',
    DODO: 'dodo'
} as const;
export type ExchangeTool = (typeof exchangeTool)[keyof typeof exchangeTool];
export interface ExchangeAggregator {
    key: ExchangeTool;
    name: string;
    logoURI: string;
    webUrl: string;
}
export interface Exchange {
    key: string;
    name: string;
    chainId: number;
    logoURI: string;
    webUrl: string;
    graph?: string;
    tokenlistUrl: string;
    routerAddress: string;
    factoryAddress: string;
    initCodeHash: string;
    baseTokens: readonly StaticToken[];
}
