import BigNumber from 'bignumber.js';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

interface EddySupportedChainLimit {
    min: BigNumber;
    max: BigNumber;
    blockchain: BlockchainName;
    address: string;
}

export const EDDY_BRIDGE_LIMITS: EddySupportedChainLimit[] = [
    {
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        address: nativeTokensList[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].address,
        min: new BigNumber(0.01),
        max: new BigNumber(15)
    },
    {
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: nativeTokensList[BLOCKCHAIN_NAME.ETHEREUM].address,
        min: new BigNumber(0.0015),
        max: new BigNumber(5)
    },
    {
        blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
        address: nativeTokensList[BLOCKCHAIN_NAME.ZETACHAIN].address,
        min: new BigNumber(7),
        max: new BigNumber(15_000)
    },
    {
        blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
        address: '0x48f80608b672dc30dc7e3dbbd0343c5f02c738eb',
        min: new BigNumber(0.01),
        max: new BigNumber(15)
    },
    {
        blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
        address: '0xd97b1de3619ed2c6beb3860147e30ca8a7dc9891',
        min: new BigNumber(0.0015),
        max: new BigNumber(5)
    }
];
