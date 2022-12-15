import BigNumber from 'bignumber.js';
import {
    LowSlippageDeflationaryTokenError,
    RubicSdkError,
    SwapRequestError
} from 'src/common/errors';
import { nativeTokensList } from 'src/common/tokens';
import { PriceTokenAmount } from 'src/common/tokens/price-token-amount';
import { parseError } from 'src/common/utils/errors';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { onChainProxyContractAddress } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-proxy-service/constants/on-chain-proxy-contract';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { openOceanBlockchainName } from 'src/features/on-chain/calculation-manager/providers/open-ocean/constants/open-ocean-blockchain';
import { OpenoceanOnChainSupportedBlockchain } from 'src/features/on-chain/calculation-manager/providers/open-ocean/constants/open-ocean-on-chain-supported-blockchain';
import { OpenOceanTradeStruct } from 'src/features/on-chain/calculation-manager/providers/open-ocean/models/open-ocean-trade-struct';

import { openOceanApiUrl } from './constants/get-open-ocean-api-url';
import { OpenoceanSwapQuoteResponse } from './models/open-cean-swap-quote-response';

interface OpenOceanTransactionRequest {
    to: string;
    data: string;
    gasLimit?: string;
    gasPrice?: string;
}

export class OpenOceanTrade extends EvmOnChainTrade {
    /** @internal */
    public static async getGasLimit(
        openOceanTradeStruct: OpenOceanTradeStruct
    ): Promise<BigNumber | null> {
        const fromBlockchain = openOceanTradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        const openOceanTrade = new OpenOceanTrade(openOceanTradeStruct, EvmWeb3Pure.EMPTY_ADDRESS);
        try {
            const transactionConfig = await openOceanTrade.encode({ fromAddress: walletAddress });

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const gasLimit = (
                await web3Public.batchEstimatedGas(walletAddress, [transactionConfig])
            )[0];

            if (gasLimit?.isFinite()) {
                return gasLimit;
            }
        } catch {}
        try {
            const transactionData = await openOceanTrade.getTransactionData();

            if (transactionData.gasLimit) {
                return new BigNumber(transactionData.gasLimit);
            }
        } catch {}
        return null;
    }

    public readonly type = ON_CHAIN_TRADE_TYPE.OPEN_OCEAN;

    private readonly _toTokenAmountMin: PriceTokenAmount;

    protected get spenderAddress(): string {
        const openOceanContractAddress =
            this.from.blockchain === BLOCKCHAIN_NAME.OKE_X_CHAIN
                ? '0xc0006Be82337585481044a7d11941c0828FFD2D4'
                : '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64';

        return this.useProxy
            ? onChainProxyContractAddress[this.from.blockchain]
            : openOceanContractAddress;
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    public get toTokenAmountMin(): PriceTokenAmount {
        return this._toTokenAmountMin;
    }

    constructor(tradeStruct: OpenOceanTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);

        this._toTokenAmountMin = new PriceTokenAmount({
            ...this.to.asStruct,
            weiAmount: tradeStruct.toTokenWeiAmountMin
        });
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        this.checkFromAddress(options.fromAddress, true);
        checkUnsupportedReceiverAddress(options?.receiverAddress, this.walletAddress);

        try {
            const transactionData = await this.getTransactionData();
            const { gas, gasPrice } = this.getGasParams(options, {
                gasLimit: transactionData.gasLimit,
                gasPrice: transactionData.gasPrice
            });

            return {
                to: transactionData.to,
                data: transactionData.data,
                value: this.fromWithoutFee.isNative ? this.fromWithoutFee.stringWeiAmount : '0',
                gas,
                gasPrice
            };
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }
            if (this.isDeflationError()) {
                throw new LowSlippageDeflationaryTokenError();
            }
            throw parseError(err);
        }
    }

    private async getTransactionData(): Promise<OpenOceanTransactionRequest> {
        const gasPrice = await Injector.web3PublicService
            .getWeb3Public(this.from.blockchain)
            .getGasPrice();
        const walletAddress = (
            Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM) as EvmWeb3Private
        ).address;
        const apiUrl = openOceanApiUrl.swapQuote(
            openOceanBlockchainName[this.from.blockchain as OpenoceanOnChainSupportedBlockchain]
        );
        const swapQuoteResponse = await Injector.httpClient.get<OpenoceanSwapQuoteResponse>(
            apiUrl,
            {
                params: {
                    chain: openOceanBlockchainName[
                        this.from.blockchain as OpenoceanOnChainSupportedBlockchain
                    ],
                    inTokenAddress: this.from.address,
                    outTokenAddress: this.to.address,
                    amount: this.from.tokenAmount.toString() as unknown as number,
                    gasPrice: Web3Pure.fromWei(
                        gasPrice,
                        nativeTokensList[this.from.blockchain].decimals
                    )
                        .multipliedBy(10 ** 9)
                        .toFixed(0),
                    slippage: this.slippageTolerance * 100,
                    account: walletAddress
                }
            }
        );
        const { data, to } = swapQuoteResponse.data;

        return {
            data,
            to
        };
    }
}
