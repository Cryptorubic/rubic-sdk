import { PriceTokenAmount, PriceToken } from "src/common/tokens";
import { BlockchainName } from "src/core/blockchain/models/blockchain-name";
import { EvmEncodeConfig } from "src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config";
import { TronTransactionConfig } from "src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config";
import { CrossChainOptions, RequiredCrossChainOptions } from "../../models/cross-chain-options";
import { CROSS_CHAIN_TRADE_TYPE } from "../../models/cross-chain-trade-type";
import { CrossChainProvider } from "../common/cross-chain-provider";
import { CalculationResult } from "../common/models/calculation-result";
import { routerCrossChainSupportedChains } from "./constants/router-cross-chain-supported-chains";

export class RouterCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.ROUTER;

    public isSupportedBlockchain(
        fromBlockchain: BlockchainName
    ): boolean {
        return routerCrossChainSupportedChains.some(
            chain => chain === fromBlockchain
        )
    }

    public async calculate(
        from: PriceTokenAmount<BlockchainName>,
        toToken: PriceToken<BlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {

    }
}