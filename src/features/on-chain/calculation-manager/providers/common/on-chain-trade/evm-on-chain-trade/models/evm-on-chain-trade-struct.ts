import { PriceTokenAmount, Token } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';

export interface EvmOnChainTradeStruct {
    from: PriceTokenAmount<EvmBlockchainName>;
    to: PriceTokenAmount<EvmBlockchainName>;

    slippageTolerance: number;
    path: ReadonlyArray<Token>;

    gasFeeInfo: GasFeeInfo | null;

    useProxy: boolean;
    proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
    // isDeflation: {
    //     from: IsDeflationToken;
    //     to: IsDeflationToken;
    // };
}
