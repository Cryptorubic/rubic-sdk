import { BigNumber as EthersBigNumber } from 'ethers';

export type Web3PrimitiveType =
    | string
    | boolean
    | Web3PrimitiveType[]
    | { [key: string]: Web3PrimitiveType };

export type TronWeb3PrimitiveType =
    | number
    | EthersBigNumber
    | Web3PrimitiveType
    | TronWeb3PrimitiveType[]
    | { [key: string]: TronWeb3PrimitiveType };
