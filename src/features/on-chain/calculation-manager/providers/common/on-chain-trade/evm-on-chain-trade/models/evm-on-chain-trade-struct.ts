import { PriceTokenAmount, Token } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { IsDeflationToken } from 'src/features/deflation-token-manager/models/is-deflation-token';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';

export interface OnChainTradeStruct<T extends BlockchainName> {
    from: PriceTokenAmount<T>;
    to: PriceTokenAmount<T>;

    slippageTolerance: number;

    gasFeeInfo: GasFeeInfo | null;

    useProxy: boolean;

    withDeflation: {
        from: IsDeflationToken;
        to: IsDeflationToken;
    };

    usedForCrossChain?: boolean;
}

export interface EvmOnChainTradeStruct extends OnChainTradeStruct<EvmBlockchainName> {
    permit2ApproveAddress?: string;
    proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
    path: ReadonlyArray<Token>;
}
