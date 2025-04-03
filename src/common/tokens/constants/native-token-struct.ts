import { nativeTokensList } from '@cryptorubic/core';
import { TokenStruct } from 'src/common/tokens/token';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const nativeTokensStruct: Record<BlockchainName, TokenStruct> = nativeTokensList;
