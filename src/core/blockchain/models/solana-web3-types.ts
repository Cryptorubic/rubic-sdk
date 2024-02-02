import { AccountInfo, PublicKey, RpcResponseAndContext } from '@solana/web3.js';

/**
 * RPC response value.
 */
export type ReturnValue = Promise<{
    result: RpcResponseAndContext<
        Array<{
            pubkey: PublicKey;
            account: AccountInfo<{
                parsed: {
                    info: {
                        tokenAmount: {
                            amount: number;
                            decimals: number;
                        };
                        mint: string;
                    };
                };
            }>;
        }>
    >;
}>;
