import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { OpenOceanApiService } from '../common/open-ocean/open-ocean-api-service';
import { X_API_KEY } from '../open-ocean/constants/api-key';
import { ARBITRUM_GAS_PRICE } from '../open-ocean/constants/arbitrum-gas-price';
import { openOceanApiUrl } from '../open-ocean/constants/get-open-ocean-api-url';
import { openOceanBlockchainName } from '../open-ocean/constants/open-ocean-blockchain';
import { OpenoceanOnChainSupportedBlockchain } from '../open-ocean/constants/open-ocean-on-chain-supported-blockchain';
import { OpenoceanSwapQuoteResponse } from '../open-ocean/models/open-cean-swap-quote-response';
import { OpenOceanTrade } from '../open-ocean/open-ocean-trade';
import { GMXSwapQuoteRequest } from './models/gmx-quote-request';

export class GMXOnChainTrade extends OpenOceanTrade {
    public override readonly type = ON_CHAIN_TRADE_TYPE.GMX;

    protected override getSwapQuote(
        isArbitrum: boolean,
        gasPrice: string,
        account: string
    ): Promise<OpenoceanSwapQuoteResponse> {
        const swapQuoteParams: GMXSwapQuoteRequest = {
            inTokenAddress: this.getTokenAddress(this.from),
            outTokenAddress: this.getTokenAddress(this.to),
            amount: this.fromWithoutFee.tokenAmount.toString(),
            gasPrice: isArbitrum
                ? ARBITRUM_GAS_PRICE
                : Web3Pure.fromWei(gasPrice, nativeTokensList[this.from.blockchain].decimals)
                      .multipliedBy(10 ** 9)
                      .toString(),
            slippage: this.slippageTolerance * 100,
            account,
            referrer: '0x429A3A1a2623DFb520f1D93F64F38c0738418F1f'
        };

        const apiUrl = openOceanApiUrl.gmxSwapQuote(
            openOceanBlockchainName[this.from.blockchain as OpenoceanOnChainSupportedBlockchain]
        );

        return OpenOceanApiService.getQuote<GMXSwapQuoteRequest, OpenoceanSwapQuoteResponse>(
            swapQuoteParams,
            apiUrl,
            X_API_KEY
        );
    }
}
