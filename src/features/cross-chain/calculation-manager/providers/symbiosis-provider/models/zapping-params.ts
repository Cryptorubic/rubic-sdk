import { ChainId } from 'symbiosis-js-sdk/dist/constants';
import { TokenAmount } from 'symbiosis-js-sdk/dist/entities';

export type ZappingParams = [TokenAmount, ChainId, string, string, string, number, number, boolean];
