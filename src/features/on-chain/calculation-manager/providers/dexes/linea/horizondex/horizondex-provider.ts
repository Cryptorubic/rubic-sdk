import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV3AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UniswapV3QuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { HORIZONDEX_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/horizondex/constants/provider-configuration';
import { HORIZONDEX_ROUTER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/horizondex/constants/router-configuration';
import { HorizondexTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/horizondex/horizondex-trade';
import {
    HORIZONDEX_QUOTER_CONTRACT_ABI,
    HORIZONDEX_QUOTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/linea/horizondex/utils/quoter-controller/constants/quoter-contract-data';

export class HorizondexProvider extends UniswapV3AbstractProvider<HorizondexTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.LINEA;

    public readonly OnChainTradeClass = HorizondexTrade;

    public readonly providerConfiguration = HORIZONDEX_PROVIDER_CONFIGURATION;

    public readonly routerConfiguration = HORIZONDEX_ROUTER_CONFIGURATION;

    protected readonly quoterController = new UniswapV3QuoterController(
        this.blockchain,
        this.routerConfiguration,
        HORIZONDEX_QUOTER_CONTRACT_ADDRESS,
        HORIZONDEX_QUOTER_CONTRACT_ABI
    );
}
