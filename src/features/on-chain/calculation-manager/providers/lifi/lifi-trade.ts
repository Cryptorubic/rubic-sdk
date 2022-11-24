import { Route } from '@lifi/sdk';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens/price-token-amount';
import {
    SwapRequestError,
    LifiPairIsUnavailableError,
    RubicSdkError,
    LowSlippageDeflationaryTokenError
} from 'src/common/errors';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { onChainProxyContractAddress } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-proxy-service/constants/on-chain-proxy-contract';
import { LifiTradeStruct } from 'src/features/on-chain/calculation-manager/providers/lifi/models/lifi-trade-struct';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';

interface LifiTransactionRequest {
    to: string;
    data: string;
    gasLimit?: string;
    gasPrice?: string;
}

export class LifiTrade extends EvmOnChainTrade {
    /** @internal */
    public static async getGasLimit(lifiTradeStruct: LifiTradeStruct): Promise<BigNumber | null> {
        const fromBlockchain = lifiTradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        const lifiTrade = new LifiTrade(lifiTradeStruct, EvmWeb3Pure.EMPTY_ADDRESS);
        try {
            const transactionConfig = await lifiTrade.encode({ fromAddress: walletAddress });

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const gasLimit = (
                await web3Public.batchEstimatedGas(walletAddress, [transactionConfig])
            )[0];

            if (gasLimit?.isFinite()) {
                return gasLimit;
            }
        } catch {}
        try {
            const transactionData = await lifiTrade.getTransactionData(walletAddress);

            if (transactionData.gasLimit) {
                return new BigNumber(transactionData.gasLimit);
            }
        } catch {}
        return null;
    }

    public readonly providerGateway: string;

    public readonly type: OnChainTradeType;

    private readonly route: Route;

    private readonly _toTokenAmountMin: PriceTokenAmount;

    protected get spenderAddress(): string {
        return this.useProxy
            ? onChainProxyContractAddress[this.from.blockchain]
            : this.providerGateway;
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    public get toTokenAmountMin(): PriceTokenAmount {
        return this._toTokenAmountMin;
    }

    constructor(tradeStruct: LifiTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);

        this._toTokenAmountMin = new PriceTokenAmount({
            ...this.to.asStruct,
            weiAmount: tradeStruct.toTokenWeiAmountMin
        });
        this.type = tradeStruct.type;
        this.route = tradeStruct.route;
        this.providerGateway = this.route.steps[0]!.estimate.approvalAddress;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        checkUnsupportedReceiverAddress(options?.receiverAddress, this.walletAddress);
        this.checkFromAddress(options.fromAddress, true);

        try {
            const transactionData = await this.getTransactionData(
                options.fromAddress,
                options.receiverAddress
            );
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
            throw new LifiPairIsUnavailableError();
        }
    }

    private async getTransactionData(
        fromAddress?: string,
        receiverAddress?: string
    ): Promise<LifiTransactionRequest> {
        const firstStep = this.route.steps[0]!;
        const step = {
            ...firstStep,
            action: {
                ...firstStep.action,
                fromAddress: fromAddress || this.walletAddress,
                toAddress: receiverAddress || fromAddress || this.walletAddress
            },
            execution: {
                status: 'NOT_STARTED',
                process: [
                    {
                        message: 'Preparing swap.',
                        startedAt: Date.now(),
                        status: 'STARTED',
                        type: 'SWAP'
                    }
                ]
            }
        };

        const swapResponse: {
            transactionRequest: LifiTransactionRequest;
        } = await this.httpClient.post('https://li.quest/v1/advanced/stepTransaction', {
            ...step
        });

        const { transactionRequest } = swapResponse;
        const gasLimit =
            transactionRequest.gasLimit && parseInt(transactionRequest.gasLimit, 16).toString();
        const gasPrice =
            transactionRequest.gasPrice && parseInt(transactionRequest.gasPrice, 16).toString();

        return {
            to: transactionRequest.to,
            data: transactionRequest.data,
            gasLimit,
            gasPrice
        };
    }
}
