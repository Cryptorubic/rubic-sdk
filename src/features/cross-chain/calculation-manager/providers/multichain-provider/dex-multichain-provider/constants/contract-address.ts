import {
    MultichainProxyCrossChainSupportedBlockchain,
    multichainProxyCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { RubicSdkError } from 'src/common/errors';

export const multichainProxyContractAddress: Record<
    MultichainProxyCrossChainSupportedBlockchain,
    string
> = multichainProxyCrossChainSupportedBlockchains.reduce((acc, blockchain) => {
    let routerAddress = '0x41e7056A16B35E5E09214d6F7d43C90D9DEC1630';
    if (blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
        routerAddress = '0xac340Eaf0b6B886f579640C12c4cdd924F4ff655';
    } else if (blockchain === BLOCKCHAIN_NAME.POLYGON) {
        routerAddress = '0x027F99bc33Ec825aC65765F9945Aa4C3d347F05D';
    } else if (blockchain === BLOCKCHAIN_NAME.KAVA) {
        routerAddress = '0x451EA65b89F9D99011D643d99785F8Ede936f08E';
    } else {
        throw new RubicSdkError('Wrong blockchain for bridgers provider.');
    }
    return {
        ...acc,
        [blockchain]: routerAddress
    };
}, {} as Record<MultichainProxyCrossChainSupportedBlockchain, string>);
