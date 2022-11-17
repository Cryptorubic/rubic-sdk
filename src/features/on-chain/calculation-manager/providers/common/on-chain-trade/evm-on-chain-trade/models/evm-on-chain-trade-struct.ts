import { PriceTokenAmount, Token } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import { IsDeflationToken } from 'src/features/deflation-token-manager/models/is-deflation-token';

export interface EvmOnChainTradeStruct {
    from: PriceTokenAmount<EvmBlockchainName>;
    to: PriceTokenAmount<EvmBlockchainName>;

    slippageTolerance: number;
    path: ReadonlyArray<Token>;

    gasFeeInfo: GasFeeInfo | null;

    useProxy: boolean;
    proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;

    withDeflation: {
        from: IsDeflationToken;
        to: IsDeflationToken;
    };
}
