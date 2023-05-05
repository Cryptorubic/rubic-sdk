import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { oneinchArbitrumProtocols } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/oneinch-arbitrum/oneinch-arbitrum-protocols';
import { OneinchAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/oneinch-abstract-provider';

export class OneinchArbitrumProvider extends OneinchAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ARBITRUM;

    protected getAvailableProtocols(): string | undefined {
        return oneinchArbitrumProtocols.join(',');
    }
}
