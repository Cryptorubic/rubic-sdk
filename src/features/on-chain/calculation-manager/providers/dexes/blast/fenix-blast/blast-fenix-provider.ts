import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { createTokenNativeAddressProxyInPathStartAndEnd } from 'src/features/common/utils/token-native-address-proxy';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { BlastFenixTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/fenix-blast/blast-fenix-trade';
import { BlastFenixRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/fenix-blast/models/blast-fenix-route';
import { FenixQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/fenix-blast/utils/quoter-controller/fenix-quoter-controller';
import { UniswapV3AlgebraTradeStructOmitPath } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { UniswapV3AlgebraAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';

import { defaultBlastProviderConfiguration } from '../default-constants';
import { BLAST_FENIX_PROVIDER_CONFIGURATION } from './constants/provider-configuration';
import {
    BLAST_FENIX_ROUTER_CONTRACT_ABI,
    BLAST_FENIX_ROUTER_CONTRACT_ADDRESS
} from './constants/swap-router-contract-data';
import {
    BLAST_FENIX_QUOTER_CONTRACT_ABI,
    BLAST_FENIX_QUOTER_CONTRACT_ADDRESS
} from './utils/quoter-controller/constants/quoter-contract-data';

export class BlastFenixProvider extends UniswapV3AlgebraAbstractProvider<BlastFenixTrade> {
    protected readonly contractAddress = BLAST_FENIX_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = BLAST_FENIX_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.BLAST;

    protected readonly OnChainTradeClass = BlastFenixTrade;

    protected readonly providerConfiguration = BLAST_FENIX_PROVIDER_CONFIGURATION;

    protected readonly quoterController = new FenixQuoterController(
        this.blockchain,
        defaultBlastProviderConfiguration.routingProvidersAddresses,
        BLAST_FENIX_QUOTER_CONTRACT_ADDRESS,
        BLAST_FENIX_QUOTER_CONTRACT_ABI
    );

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.FENIX;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: BlastFenixRoute,
        providerAddress: string
    ): BlastFenixTrade {
        const path = createTokenNativeAddressProxyInPathStartAndEnd(
            route.path,
            EvmWeb3Pure.nativeTokenAddress
        );
        return new BlastFenixTrade(
            {
                ...tradeStruct,
                path,
                route
            },
            providerAddress
        );
    }
}
