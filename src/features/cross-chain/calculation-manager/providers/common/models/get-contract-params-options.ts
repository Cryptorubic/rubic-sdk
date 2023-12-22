import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';

export interface GetContractParamsOptions {
    fromAddress?: string;
    receiverAddress?: string;
    directTransaction?: EvmEncodeConfig;
    referrer?: string;
}
