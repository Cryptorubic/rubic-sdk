import { Address } from '@ton/core';
import { SwapType } from '@toncodex/sdk';

export interface ToncoJettonWallets {
    srcRouterJettonWallet: Address;
    dstRouterJettonWallet: Address;
    srcUserJettonWallet: Address;
}

export interface ToncoCommonParams {
    /**
     *  checks which token from pool is source(jetton0) and  which one is destination(jetton1) in trade
     */
    zeroToOne: boolean;
    jettonWallets: ToncoJettonWallets;
    swapType: SwapType;
    poolAddress: Address;
}
