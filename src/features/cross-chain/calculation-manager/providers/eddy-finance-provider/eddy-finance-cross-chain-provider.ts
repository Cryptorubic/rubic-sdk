import { BlockchainName } from "src/core/blockchain/models/blockchain-name";
import { CROSS_CHAIN_TRADE_TYPE } from "../../models/cross-chain-trade-type";
import { CrossChainProvider } from "../common/cross-chain-provider";
import { eddyFinanceCrossChainSupportBlockChain, EddyFinanceCrossChainSupportedBlockchain } from "./constants/eddy-finance-cross-chain-supported-blockchain";

export class EddyFinanceCrossChainProvider extends CrossChainProvider{
    public readonly type = CROSS_CHAIN_TRADE_TYPE.EDDY_FINANCE;

    public isSupportedBlockchain(blockchain: BlockchainName): blockchain is EddyFinanceCrossChainSupportedBlockchain {
        return eddyFinanceCrossChainSupportBlockChain.some(
            supportedBlockChain => supportedBlockChain === blockchain
        )
    }


}