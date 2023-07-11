import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { PANCAKE_SWAP_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/pancake-swap/constants';
import {
    EvmOnChainTradeStruct
} from "src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct";

export class PancakeRouterTrade extends EvmOnChainTrade {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP;
    }

    public readonly dexContractAddress = PANCAKE_SWAP_CONTRACT_ADDRESS;

    public async encodeDirect(_options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        return undefined as unknown as EvmEncodeConfig;
    }

    constructor(evmOnChainTradeStruct: EvmOnChainTradeStruct, providerAddress: string) {
        super(evmOnChainTradeStruct, providerAddress);
    }
}
