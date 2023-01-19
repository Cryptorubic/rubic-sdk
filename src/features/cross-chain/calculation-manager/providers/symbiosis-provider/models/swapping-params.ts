import { TokenAmount } from 'symbiosis-js-sdk/dist/entities';
import { Token } from 'symbiosis-js-sdk-v1/dist/entities';

export type SwappingParams = [TokenAmount, Token, string, string, string, number, number, boolean];
