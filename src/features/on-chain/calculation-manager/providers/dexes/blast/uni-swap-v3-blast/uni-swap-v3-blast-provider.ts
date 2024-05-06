import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UNI_SWAP_V3_BLAST_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/uni-swap-v3-blast/constants/provider-configuration';
import { UNI_SWAP_V3_BLAST_ROUTER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/uni-swap-v3-blast/constants/router-configuration';
import { UniSwapV3BlastTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/uni-swap-v3-blast/uni-swap-v3-blast-trade';
import { UniswapV3AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UniswapV3BlastQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/fenix-uniswap-v3-blast-quoter-qontroller';

export class UniSwapV3BlastProvider extends UniswapV3AbstractProvider<UniSwapV3BlastTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BLAST;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.FENIX_V3;
    }

    protected readonly OnChainTradeClass = UniSwapV3BlastTrade;

    protected readonly providerConfiguration = UNI_SWAP_V3_BLAST_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = UNI_SWAP_V3_BLAST_ROUTER_CONFIGURATION;

    protected readonly quoterController = new UniswapV3BlastQuoterController(
        this.blockchain,
        this.routerConfiguration
    );
}
