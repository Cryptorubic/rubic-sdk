import { PriceTokenAmount } from 'src/common/tokens';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';

export interface ProxySwapParams {
    walletAddress: string;
    contractAddress: string;
    fromTokenAmount: PriceTokenAmount;
    toTokenAmount: PriceTokenAmount;
    onChainEncodeFn: (options: EncodeTransactionOptions) => Promise<EvmEncodeConfig>;
}
