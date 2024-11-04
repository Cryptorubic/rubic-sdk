import { BLOCKCHAIN_NAME } from "src/core/blockchain/models/blockchain-name";
import { UniswapV2AbstractProvider } from "../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider";
import { BLAZE_SWAP_FLARE_PROVIDER_CONFIGURATION } from "./constants";
import { BlazeSwapFlareTrade } from "./blaze-swap-flare-trade";


export class BlazeSwapFlareProvider extends UniswapV2AbstractProvider<BlazeSwapFlareTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FLARE;

    public readonly UniswapV2TradeClass = BlazeSwapFlareTrade;

    public readonly providerSettings = BLAZE_SWAP_FLARE_PROVIDER_CONFIGURATION;
}
