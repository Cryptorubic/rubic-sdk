import { SymbiosisStuckedResponse } from 'src/features/cross-chain/symbiosis-manager/models/symbiosis-stucked-api';

export type SymbiosisStuckedTrade = SymbiosisStuckedResponse & { version: 'v1' | 'v2' };
