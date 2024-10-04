import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OpenOceanApiService } from '../common/open-ocean/open-ocean-api-service';
import { X_API_KEY } from '../open-ocean/constants/api-key';
import { ARBITRUM_GAS_PRICE } from '../open-ocean/constants/arbitrum-gas-price';
import { openOceanApiUrl } from '../open-ocean/constants/get-open-ocean-api-url';
import { openOceanBlockchainName } from '../open-ocean/constants/open-ocean-blockchain';
import { OpenoceanOnChainSupportedBlockchain } from '../open-ocean/constants/open-ocean-on-chain-supported-blockchain';
import { OpenOceanQuoteResponse } from '../open-ocean/models/open-ocean-quote-response';
import { OpenOceanTradeStruct } from '../open-ocean/models/open-ocean-trade-struct';
import { OpenOceanProvider } from '../open-ocean/open-ocean-provider';
import { GMXOnChainTrade } from './gmx-on-chain-trade';
import { GMXQuoteRequest } from './models/gmx-quote-request';

export class GMXOnChainProvider extends OpenOceanProvider {
    public override readonly tradeType = ON_CHAIN_TRADE_TYPE.GMX;

    protected createTradeInstance(
        openOceanTradeStruct: OpenOceanTradeStruct,
        gasFeeInfo: GasFeeInfo | null,
        providerAddress: string
    ): GMXOnChainTrade {
        return new GMXOnChainTrade(
            {
                ...openOceanTradeStruct,
                gasFeeInfo
            },
            providerAddress
        );
    }

    protected override async getQuote(
        from: PriceTokenAmount,
        toToken: PriceToken,
        _slippage: number,
        isArbitrum: boolean,
        gasPrice: string
    ): Promise<OpenOceanQuoteResponse> {
        const blockchain = from.blockchain as OpenoceanOnChainSupportedBlockchain;
        const apiUrl = openOceanApiUrl.gmxQuote(openOceanBlockchainName[blockchain]);

        const quoteRequestParams: GMXQuoteRequest = {
            inTokenAddress: this.getTokenAddress(from),
            outTokenAddress: this.getTokenAddress(toToken),
            amount: from.tokenAmount.toString(),
            gasPrice: isArbitrum
                ? ARBITRUM_GAS_PRICE
                : Web3Pure.fromWei(gasPrice, nativeTokensList[from.blockchain].decimals)
                      .multipliedBy(10 ** 9)
                      .toString()
        };

        return OpenOceanApiService.getQuote<GMXQuoteRequest, OpenOceanQuoteResponse>(
            quoteRequestParams,
            apiUrl,
            X_API_KEY
        );
    }
}
