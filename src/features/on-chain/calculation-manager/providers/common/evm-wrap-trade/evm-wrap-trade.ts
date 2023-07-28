import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export class EvmWrapTrade extends EvmOnChainTrade {
    public get dexContractAddress(): string {
        return this.from.isNative ? this.to.address : this.from.address;
    }

    public readonly type = ON_CHAIN_TRADE_TYPE.WRAPPED;

    public async encodeDirect(_options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        return undefined as unknown as EvmEncodeConfig;
    }

    public constructor(evmOnChainTradeStruct: EvmOnChainTradeStruct, providerAddress: string) {
        super(evmOnChainTradeStruct, providerAddress);
    }
}
