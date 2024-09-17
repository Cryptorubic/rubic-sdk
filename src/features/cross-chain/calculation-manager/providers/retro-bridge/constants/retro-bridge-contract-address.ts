import { BLOCKCHAIN_NAME } from "src/core/blockchain/models/blockchain-name";
import { retroBridgeSupportedBlockchain, RetroBridgeSupportedBlockchain } from "./retro-bridge-supported-blockchain";

export const retroBridgeContractAddresses: Record<RetroBridgeSupportedBlockchain, string> =
    retroBridgeSupportedBlockchain.reduce((acc, chain) => {
        if (chain === BLOCKCHAIN_NAME.ZK_SYNC ||
            chain === BLOCKCHAIN_NAME.ZK_LINK
        ) {
            acc[chain] = '0x22158e226D68D91378f30Ae42b6F6a039bcCACf8';
        }
        else {
            acc[chain] = '0xDcD3979c23B0A375e276f33c65c70b4199d0AF5A';
        }
        return acc
    }, {} as Record<RetroBridgeSupportedBlockchain, string>)