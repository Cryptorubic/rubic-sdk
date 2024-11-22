import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { RetroBridgeEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/chains/retro-bridge-evm-trade';
import { RetroBridgeTonTrade } from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/chains/retro-bridge-ton-trade';
import {
    RetroBridgeConstructorParams,
    RetroBridgeEvmConstructorParams,
    RetroBridgeTonConstructorParams
} from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/models/retro-bridge-constructor-params';

export class RetroBridgeFactory {
    public static createTrade(
        fromBlockchain: BlockchainName,
        constructorParams: RetroBridgeConstructorParams<BlockchainName>,
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ): CrossChainTrade<EvmEncodeConfig | { data: string } | TonEncodedConfig> {
        if (BlockchainsInfo.isTonBlockchainName(fromBlockchain)) {
            return new RetroBridgeTonTrade(
                constructorParams as RetroBridgeTonConstructorParams,
                providerAddress,
                routePath
            );
        }

        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new RetroBridgeEvmTrade(
                constructorParams as RetroBridgeEvmConstructorParams,
                providerAddress,
                routePath,
                useProxy
            );
        }
        throw new Error('Can not create trade instance');
    }
}
