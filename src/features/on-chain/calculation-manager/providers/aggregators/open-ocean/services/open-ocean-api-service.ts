import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import {
    BLOCKCHAIN_NAME,
    EvmBlockchainName,
    SuiBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';

import { ARBITRUM_GAS_PRICE } from '../constants/arbitrum-gas-price';
import { openOceanBlockchainName } from '../constants/open-ocean-blockchain';
import { OpenoceanOnChainSupportedBlockchain } from '../constants/open-ocean-on-chain-supported-blockchain';
import {
    OpenoceanSuiSwapQuoteResponse,
    OpenoceanSwapQuoteResponse
} from '../models/open-cean-swap-quote-response';
import { OpenOceanQuoteResponse } from '../models/open-ocean-quote-response';
import { OpenOceanTokenListResponse } from '../models/open-ocean-token-list-response';

export class OpenOceanApiService {
    private static apiV4Url = 'https://open-api.openocean.finance/v4';

    private static xApiUrl = 'https://x-api.rubic.exchange/oo/api';

    public static readonly nativeOpenOceanAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

    public static async fetchQuoteData(
        fromWithoutFee: PriceTokenAmount<OpenoceanOnChainSupportedBlockchain>,
        toToken: PriceToken<EvmBlockchainName>,
        slippageTolerance: number
    ): Promise<OpenOceanQuoteResponse> {
        const gasPriceNonWei = await this.getGasPriceNonWei(fromWithoutFee);

        const quoteResponse = await Injector.httpClient.get<OpenOceanQuoteResponse>(
            `${this.xApiUrl}/v4/${openOceanBlockchainName[fromWithoutFee.blockchain]}/quote`,
            {
                headers: { apikey: 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4' },
                params: {
                    chain: openOceanBlockchainName[fromWithoutFee.blockchain],
                    inTokenAddress: this.getTokenAddress(fromWithoutFee),
                    outTokenAddress: this.getTokenAddress(toToken),
                    amount: fromWithoutFee.tokenAmount.toString(),
                    // @TODO check if needs to pass slippage in quote
                    slippage: slippageTolerance! * 100,
                    gasPrice: gasPriceNonWei
                }
            }
        );

        return quoteResponse;
    }

    public static async fetchSwapData(
        fromWithoutFee: PriceTokenAmount<OpenoceanOnChainSupportedBlockchain>,
        to: PriceTokenAmount,
        walletAddress: string,
        slippageTolerance: number
    ): Promise<OpenoceanSwapQuoteResponse> {
        const gasPriceNonWei = await this.getGasPriceNonWei(fromWithoutFee);

        const swapResponse = await Injector.httpClient.get<OpenoceanSwapQuoteResponse>(
            `${this.xApiUrl}/v4/${openOceanBlockchainName[fromWithoutFee.blockchain]}/swap`,
            {
                headers: { apikey: 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4' },
                params: {
                    chain: openOceanBlockchainName[fromWithoutFee.blockchain],
                    inTokenAddress: this.getTokenAddress(fromWithoutFee),
                    outTokenAddress: this.getTokenAddress(to),
                    amount: fromWithoutFee.tokenAmount.toString(),
                    gasPrice: gasPriceNonWei,
                    slippage: slippageTolerance * 100,
                    account: walletAddress,
                    referrer: '0x429A3A1a2623DFb520f1D93F64F38c0738418F1f'
                }
            }
        );

        return swapResponse;
    }

    public static async fetchSuiSwapData(
        fromWithoutFee: PriceTokenAmount<SuiBlockchainName>,
        to: PriceTokenAmount,
        walletAddress: string,
        slippageTolerance: number,
        senderAddress: string
    ): Promise<OpenoceanSuiSwapQuoteResponse> {
        const gasPriceNonWei = await this.getGasPriceNonWei(fromWithoutFee);

        const swapResponse = await Injector.httpClient.get<OpenoceanSuiSwapQuoteResponse>(
            `${this.xApiUrl}/v4/${openOceanBlockchainName[fromWithoutFee.blockchain]}/swap`,
            {
                headers: { apikey: 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4' },
                params: {
                    chain: openOceanBlockchainName[fromWithoutFee.blockchain],
                    inTokenAddress: this.getTokenAddress(fromWithoutFee),
                    outTokenAddress: this.getTokenAddress(to),
                    amount: fromWithoutFee.tokenAmount.toString(),
                    gasPrice: gasPriceNonWei,
                    slippage: slippageTolerance * 100,
                    account: walletAddress,
                    sender: senderAddress,
                    referrer: '0x429A3A1a2623DFb520f1D93F64F38c0738418F1f'
                }
            }
        );

        return swapResponse;
    }

    public static async fetchTokensList(
        blockchain: OpenoceanOnChainSupportedBlockchain
    ): Promise<OpenOceanTokenListResponse> {
        const tokenListResponse = await Injector.httpClient.get<OpenOceanTokenListResponse>(
            `${this.xApiUrl}/token_list/${openOceanBlockchainName[blockchain]}`,
            { headers: { apikey: 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4' } }
        );

        return tokenListResponse;
    }

    private static async getGasPriceNonWei(
        fromWithoutFee: PriceTokenAmount<OpenoceanOnChainSupportedBlockchain>
    ): Promise<string> {
        if (fromWithoutFee.blockchain === BLOCKCHAIN_NAME.SUI) {
            return '5000000000';
        }
        if (fromWithoutFee.blockchain === BLOCKCHAIN_NAME.ARBITRUM) {
            return ARBITRUM_GAS_PRICE;
        }

        const gasPriceWei = await Injector.web3PublicService
            .getWeb3Public(fromWithoutFee.blockchain)
            .getGasPrice();
        const gasPriceNonWei = Web3Pure.fromWei(
            gasPriceWei,
            nativeTokensList[fromWithoutFee.blockchain].decimals
        )
            .multipliedBy(10 ** 9)
            .toString();

        return gasPriceNonWei;
    }

    private static getTokenAddress(token: PriceToken): string {
        if (token.isNative) {
            if (token.blockchain === BLOCKCHAIN_NAME.SUI) {
                return token.address;
            }
            if (token.blockchain === BLOCKCHAIN_NAME.METIS) {
                return '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000';
            }

            return this.nativeOpenOceanAddress;
        }
        return token.address;
    }
}
