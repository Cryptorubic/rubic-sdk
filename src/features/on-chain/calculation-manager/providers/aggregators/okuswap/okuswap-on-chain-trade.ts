import BigNumber from 'bignumber.js';
import { RubicSdkError, UnnecessaryApproveError } from 'src/common/errors';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { TransactionReceipt } from 'web3-eth';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from '../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { EvmEncodedConfigAndToAmount } from '../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { OkuQuoteRequestBody, OkuSwapRequestBody } from './models/okuswap-api-types';
import { OkuSwapSupportedBlockchain } from './models/okuswap-on-chain-supported-chains';
import { OkuSwapOnChainTradeStruct } from './models/okuswap-trade-types';
import { OkuSwapApiService } from './services/okuswap-api-service';

export class OkuSwapOnChainTrade extends AggregatorEvmOnChainTrade {
    public readonly type: OnChainTradeType = ON_CHAIN_TRADE_TYPE.OKU_SWAP;

    private readonly okuSubProvider: string;

    private readonly quoteReqBody: OkuQuoteRequestBody;

    private readonly swapReqBody: OkuSwapRequestBody;

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

    /**
     * Sends approve and if needed permit2Approve on UniswapV3Like-contract
     */
    public async approve(
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

    public async needApprove(fromAddress?: string): Promise<boolean> {
        if (this.from.isNative) {
            return false;
        }
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

    public async encode(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        if (this.from.blockchain === 'ROOTSTOCK') {
            await checkUnsupportedReceiverAddress(options.receiverAddress, this.walletAddress);
        }
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        if (this.useProxy) {
            return this.encodeProxy(options);
        }
        return this.encodeDirect(options);
    }

    protected async getTransactionConfigAndAmount(
        _options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
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
