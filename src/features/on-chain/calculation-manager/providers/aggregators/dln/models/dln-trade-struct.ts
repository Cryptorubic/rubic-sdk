import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { DlnOnChainSupportedBlockchain } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/constants/dln-on-chain-supported-blockchains';
import { DlnOnChainSwapRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-on-chain-swap-request';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { OnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

import { OnChainProxyFeeInfo } from '../../../common/models/on-chain-proxy-fee-info';

export interface DlnTradeStruct<T extends DlnOnChainSupportedBlockchain>
    extends OnChainTradeStruct<T> {
    type: OnChainTradeType;
    toTokenWeiAmountMin: BigNumber;
    providerGateway: string;
    transactionRequest: DlnOnChainSwapRequest;
    proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    fromWithoutFee: PriceTokenAmount<T>;
}
