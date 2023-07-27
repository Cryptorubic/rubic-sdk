import { ChainType } from 'src/core/blockchain/models/chain-type';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';

export type Web3PureContainer = Record<ChainType, TypedWeb3Pure>;
