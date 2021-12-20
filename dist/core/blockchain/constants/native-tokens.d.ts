import { BLOCKCHAIN_NAME } from '../models/BLOCKCHAIN_NAME';
import { TokenStruct } from '../tokens/token';
export declare type NativeTokensList = Record<BLOCKCHAIN_NAME, Omit<TokenStruct, 'blockchain'>>;
export declare const nativeTokensList: NativeTokensList;
