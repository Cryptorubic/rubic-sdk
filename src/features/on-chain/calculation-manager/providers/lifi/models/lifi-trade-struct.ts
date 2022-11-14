import { PriceTokenAmount, Token } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { Route } from '@lifi/sdk';
import BigNumber from 'bignumber.js';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';

export interface LifiTradeStruct {
    from: PriceTokenAmount<EvmBlockchainName>;
    to: PriceTokenAmount<EvmBlockchainName>;
    gasFeeInfo: GasFeeInfo | null;
    slippageTolerance: number;
    type: OnChainTradeType;
    path: ReadonlyArray<Token>;
    route: Route;
    toTokenWeiAmountMin: BigNumber;
    proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
}
