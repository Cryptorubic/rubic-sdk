import { BlockchainName } from '@cryptorubic/core';

import { ApiCrossChainConstructor } from '../../models/api-cross-chain-constructor';

export interface ApiCrossChainTransferConstructor
    extends ApiCrossChainConstructor<BlockchainName> {}
