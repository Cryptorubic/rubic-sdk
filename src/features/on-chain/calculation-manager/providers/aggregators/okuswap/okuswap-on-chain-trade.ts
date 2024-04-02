import BigNumber from 'bignumber.js';
import {
    LowSlippageDeflationaryTokenError,
    RubicSdkError,
    SwapRequestError,
    UnnecessaryApproveError
} from 'src/common/errors';
import { parseError } from 'src/common/utils/errors';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { TransactionReceipt } from 'web3-eth';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from '../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { GetToAmountAndTxDataResponse } from '../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { OkuQuoteRequestBody, OkuSwapRequestBody } from './models/okuswap-api-types';
import { OkuSwapSupportedBlockchain } from './models/okuswap-on-chain-supported-chains';
import { OkuSwapOnChainTradeStruct } from './models/okuswap-trade-types';
import { OkuSwapApiService } from './services/okuswap-api-service';

export class OkuSwapOnChainTrade extends AggregatorEvmOnChainTrade {
    /* @internal */
    public static async getGasLimit(
        tradeStruct: OkuSwapOnChainTradeStruct,
        providerGateway: string
    ): Promise<BigNumber | null> {
        const fromBlockchain = tradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;

        if (!walletAddress) {
            return null;
        }

        const okuswapTrade = new OkuSwapOnChainTrade(
            tradeStruct,
            EvmWeb3Pure.EMPTY_ADDRESS,
            providerGateway
        );

        try {
            const transactionConfig = await okuswapTrade.encode({ fromAddress: walletAddress });

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const gasLimit = (
                await web3Public.batchEstimatedGas(walletAddress, [transactionConfig])
            )[0];

            if (gasLimit?.isFinite()) {
                return gasLimit;
            }
        } catch {}

        try {
            const transactionData = await okuswapTrade.getTxConfigAndCheckAmount();

            if (transactionData.gas) {
                return new BigNumber(transactionData.gas);
            }
        } catch {}

        return null;
    }

    public readonly type: OnChainTradeType = ON_CHAIN_TRADE_TYPE.OKU_SWAP;

    private okuSubProvider: string;

    private quoteReqBody: OkuQuoteRequestBody;

    private swapReqBody: OkuSwapRequestBody;

    protected readonly providerGateway: string;

    protected get spenderAddress(): string {
        return this.useProxy
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : this.providerGateway;
    }

    protected get fromBlockchain(): OkuSwapSupportedBlockchain {
        return this.from.blockchain as OkuSwapSupportedBlockchain;
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    constructor(
        tradeStruct: OkuSwapOnChainTradeStruct,
        providerAddress: string,
        providerGateway: string
    ) {
        super(tradeStruct, providerAddress);

        this.providerGateway = providerGateway;
        this.okuSubProvider = tradeStruct.subProvider;
        this.quoteReqBody = tradeStruct.quoteReqBody;
        this.swapReqBody = tradeStruct.swapReqBody;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        checkUnsupportedReceiverAddress(
            options?.receiverAddress,
            options?.fromAddress || this.walletAddress
        );

        try {
            const transactionData = await this.getTxConfigAndCheckAmount(
                options.receiverAddress,
                options.fromAddress,
                options.directTransaction
            );

            const { gas, gasPrice } = this.getGasParams(options, {
                gasLimit: transactionData.gas,
                gasPrice: transactionData.gasPrice
            });

            const value = this.getSwapValue(transactionData.value);

            return {
                to: transactionData.to,
                data: transactionData.data,
                value,
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

    /**
     * Sends approve and if needed permit2Approve on UniswapV3Like-contract
     */
    public override async approve(
        options: EvmBasicTransactionOptions,
        checkNeedApprove = true,
        amount: BigNumber | 'infinity' = 'infinity'
    ): Promise<TransactionReceipt> {
        const permit2Address =
            this.permit2ApproveConfig.permit2Address ||
            '0xFcf5986450E4A014fFE7ad4Ae24921B589D039b5';

        if (this.permit2ApproveConfig.usePermit2Approve) {
            const needPermit2Approve = await this.needPermit2Approve();
            if (needPermit2Approve) {
                await this.web3Private.approveOnPermit2(
                    this.from.address,
                    permit2Address,
                    this.spenderAddress,
                    amount,
                    new BigNumber(1_000_000),
                    options
                );
            }
        }

        if (checkNeedApprove) {
            const needApprove = await this.needApprove(this.walletAddress);
            if (!needApprove) {
                throw new UnnecessaryApproveError();
            }
        }

        this.checkWalletConnected();
        await this.checkBlockchainCorrect();

        return this.web3Private.approveTokens(this.from.address, permit2Address, amount, options);
    }

    public override async needApprove(fromAddress?: string): Promise<boolean> {
        if (!fromAddress) {
            this.checkWalletConnected();
        }

        const permit2Address =
            this.permit2ApproveConfig.permit2Address ||
            '0xFcf5986450E4A014fFE7ad4Ae24921B589D039b5';

        const needPermit2Approve = await this.needPermit2Approve();

        const allowance = await this.web3Public.getAllowance(
            this.from.address,
            this.walletAddress,
            permit2Address
        );
        return allowance.lt(this.from.weiAmount) || needPermit2Approve;
    }

    private async needPermit2Approve(): Promise<boolean> {
        const permit2Address =
            this.permit2ApproveConfig.permit2Address ||
            '0xFcf5986450E4A014fFE7ad4Ae24921B589D039b5';

        const [allowance, expiration] = await this.web3Public.getAllowanceAndExpirationOnPermit2(
            this.from.address,
            this.walletAddress,
            this.spenderAddress,
            permit2Address
        );

        return this.from.weiAmount.gt(allowance) || new BigNumber(Date.now()).gt(expiration);
    }

    protected async getToAmountAndTxData(): Promise<GetToAmountAndTxDataResponse> {
        const [{ outAmount, estimatedGas }, evmConfig] = await Promise.all([
            OkuSwapApiService.makeQuoteRequest(this.okuSubProvider, this.quoteReqBody),
            OkuSwapApiService.makeSwapRequest(this.okuSubProvider, this.swapReqBody)
        ]);

        return {
            toAmount: Web3Pure.toWei(outAmount, this.to.decimals),
            tx: { ...evmConfig, gas: estimatedGas }
        };
    }
}
