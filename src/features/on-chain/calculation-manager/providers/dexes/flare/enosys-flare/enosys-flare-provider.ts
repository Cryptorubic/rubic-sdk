import { BLOCKCHAIN_NAME } from "src/core/blockchain/models/blockchain-name";
import { UniswapV2AbstractProvider } from "../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider";
import { ENOSYS_FLARE_PROVIDER_CONFIGURATION } from "./constants";
import { EnosysFlareTrade } from "./enosys-flare-trade";


export class EnosysFlareProvider extends UniswapV2AbstractProvider<EnosysFlareTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FLARE;

    public readonly UniswapV2TradeClass = EnosysFlareTrade;

    public readonly providerSettings = ENOSYS_FLARE_PROVIDER_CONFIGURATION;
}