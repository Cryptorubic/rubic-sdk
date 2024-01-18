import { AccountInfo, PublicKey, RpcResponseAndContext } from '@solana/web3.js';

// export interface AccountsRpcRequest<T> {
//     _rpcRequest: (method: string, params: unknown[]) => Promise<{ error: Error } | { result: T }>;
// }
//
// /**
//  * Program accounts RPC result.
//  */
// export interface ProgramAccounts {
//     pubkey: PublicKey;
//     account: {
//         data: string[];
//         executable: boolean;
//         owner: string;
//         lamports: number;
//     };
// }
//
// /**
//  * Base information needed for swap - owner, transaction. signers objects.
//  */
// export interface BaseInformation {
//     owner: PublicKey;
//     signers: Signer[];
//     setupInstructions: TransactionInstruction[];
//     tradeInstructions: TransactionInstruction[];
// }

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
