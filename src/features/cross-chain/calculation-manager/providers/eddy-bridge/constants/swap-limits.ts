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
    //Bsc native
    {
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        address: nativeTokensList[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].address,
        min: new BigNumber(0.01),
        max: new BigNumber(15)
    },
    //Eth nativve
    {
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: nativeTokensList[BLOCKCHAIN_NAME.ETHEREUM].address,
        min: new BigNumber(0.0015),
        max: new BigNumber(5)
    },
    //zeta ZETA
    {
        blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
        address: nativeTokensList[BLOCKCHAIN_NAME.ZETACHAIN].address,
        min: new BigNumber(7),
        max: new BigNumber(15_000)
    },
    // zeta BNB.BSC
    {
        blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
        address: '0x48f80608b672dc30dc7e3dbbd0343c5f02c738eb',
        min: new BigNumber(0.01),
        max: new BigNumber(15)
    },
    // zeta ETH.ETH
    {
        blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
        address: '0xd97b1de3619ed2c6beb3860147e30ca8a7dc9891',
        min: new BigNumber(0.0015),
        max: new BigNumber(5)
    },
    //USDC.BSC
    {
        blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
        address: '0x05ba149a7bd6dc1f937fa9046a9e05c05f3b18b0',
        min: new BigNumber(5),
        max: new BigNumber(10_000)
    },
    //USDC.ETH
    {
        blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
        address: '0x0cbe0df132a6c6b4a2974fa1b7fb953cf0cc798a',
        min: new BigNumber(5),
        max: new BigNumber(10_000)
    },
    //USDT.BSC
    {
        blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
        address: '0x91d4f0d54090df2d81e834c3c8ce71c6c865e79f',
        min: new BigNumber(5),
        max: new BigNumber(10_000)
    },
    //USDT.ETH
    {
        blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
        address: '0x7c8dda80bbbe1254a7aacf3219ebe1481c6e01d7',
        min: new BigNumber(5),
        max: new BigNumber(10_000)
    },
    //Bsc USDT
    {
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        address: '0x55d398326f99059ff775485246999027b3197955',
        min: new BigNumber(5),
        max: new BigNumber(10_000)
    },
    //Bsc USDC
    {
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        min: new BigNumber(5),
        max: new BigNumber(10_000)
    },
    //Eth USDT
    {
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        min: new BigNumber(5),
        max: new BigNumber(10_000)
    },
    //Eth USDC
    {
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        min: new BigNumber(5),
        max: new BigNumber(10_000)
    }
];
