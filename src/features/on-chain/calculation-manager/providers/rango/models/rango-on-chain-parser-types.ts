import BigNumber from 'bignumber.js';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { OnChainProxyFeeInfo } from '../../common/models/on-chain-proxy-fee-info';
import { EvmOnChainTradeStruct } from '../../common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { RangoOnChainOptions } from './rango-on-chain-api-types';

export interface RangoOnChainTradeStruct extends EvmOnChainTradeStruct {
    toTokenWeiAmountMin: BigNumber;
}

export interface GetTradeStructType {
    from: PriceTokenAmount<EvmBlockchainName>;
    to: PriceTokenAmount<EvmBlockchainName>;
    fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
    proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    gasFeeInfo: GasFeeInfo | null;
    path: ReadonlyArray<Token>;
    toTokenWeiAmountMin: BigNumber;
    options: RangoOnChainOptions;
}
