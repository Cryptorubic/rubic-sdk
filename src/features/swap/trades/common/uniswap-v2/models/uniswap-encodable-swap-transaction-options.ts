import { EncodableSwapTransactionOptions } from '@features/swap/models/encodable-swap-transaction-options';

export interface UniswapEncodableSwapTransactionOptions extends EncodableSwapTransactionOptions {
    useDeflationaryTokenMethod?: boolean;
}
