import { AllowanceTransfer } from '@uniswap/permit2-sdk';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import {
    LowSlippageDeflationaryTokenError,
    RubicSdkError,
    SwapRequestError
} from 'src/common/errors';
import { parseError } from 'src/common/utils/errors';
import { Any } from 'src/common/utils/types';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from '../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { GetToAmountAndTxDataResponse } from '../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import {
    OkuPermitSignature,
    OkuQuoteRequestBody,
    OkuSwapRequestBody
} from './models/okuswap-api-types';
import { OkuSwapSupportedBlockchain } from './models/okuswap-on-chain-supported-chains';
import { OkuSwapOnChainTradeStruct } from './models/okuswap-trade-types';
import { OkuSwapApiService } from './services/oku-swap-api-service';
import { SignatureService } from './services/signature-service';

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
        const signatureService = SignatureService.getInstance();
        signatureService.setIsGetGasLimitCall(true);

        try {
            const transactionConfig = await okuswapTrade.encode({ fromAddress: walletAddress });

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const gasLimit = (
                await web3Public.batchEstimatedGas(walletAddress, [transactionConfig])
            )[0];

            if (gasLimit?.isFinite()) {
                signatureService.setIsGetGasLimitCall(false);
                return gasLimit;
            }
        } catch {}

        try {
            const transactionData = await okuswapTrade.getTxConfigAndCheckAmount();

            if (transactionData.gas) {
                return new BigNumber(transactionData.gas);
            }
        } catch {}

        signatureService.setIsGetGasLimitCall(false);
        return null;
    }

    public readonly type: OnChainTradeType = ON_CHAIN_TRADE_TYPE.OKU_SWAP;

    private _okuSubProvider: string;

    private _quoteReqBody: OkuQuoteRequestBody;

    private _swapReqBody: OkuSwapRequestBody;

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
        this._okuSubProvider = tradeStruct.subProvider;
        this._quoteReqBody = tradeStruct.quoteReqBody;
        this._swapReqBody = tradeStruct.swapReqBody;
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

    protected async getToAmountAndTxData(): Promise<GetToAmountAndTxDataResponse> {
        const { outAmount, estimatedGas } = await OkuSwapApiService.makeQuoteRequest(
            this._okuSubProvider,
            this._quoteReqBody
        );

        // const signatureService = SignatureService.getInstance();

        // if (!signatureService.isGetGasLimitCall && this._swapReqBody.signingRequest) {
        //     this._swapReqBody.signingRequest.permitSignature[0]!.signature =
        //         await this.createSignature(
        //             this._swapReqBody.signingRequest.permit2Address,
        //             this._swapReqBody.signingRequest.permitSignature[0]!
        //         );
        //     this._swapReqBody.signingRequest.permitSignature[0]!.permit.details.expiration =
        //         this.toDeadline(1000 * 60 * 60 * 24 * 30).toString();
        // }
        const evmConfig = await OkuSwapApiService.makeSwapRequest(
            this._okuSubProvider,
            this._swapReqBody
        );

        return {
            toAmount: Web3Pure.toWei(outAmount, this.to.decimals),
            tx: { ...evmConfig, gas: estimatedGas }
        };
    }

    private async createSignature(
        permit2Address: string,
        permitData: OkuPermitSignature
    ): Promise<string> {
        const permitSingle = {
            details: {
                token: permitData.permit.details.token,
                amount: permitData.permit.details.amount,
                expiration: this.getExpiration(permitData.permit.details.expiration),
                nonce: permitData.permit.details.nonce
            },
            spender: permitData.permit.spender,
            sigDeadline: permitData.permit.sigDeadline
        };
        const chainId = blockchainId[this.fromBlockchain];

        const { domain, types, values } = AllowanceTransfer.getPermitData(
            permitSingle,
            permit2Address,
            chainId
        );

        // const rpcProviders = Injector.web3PublicService.rpcProvider;
        const provider = new ethers.providers.Web3Provider((window as Any).ethereum);
        const signature = await provider.getSigner()._signTypedData(domain, types, values);

        return signature;
    }

    // private async createSignature(
    //     permit2Address: string,
    //     permitData: OkuPermitSignature
    // ): Promise<string> {
    //     const walletAddress = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
    //         this.fromBlockchain
    //     ).address;
    //     const expiration = this.getExpiration(permitData.permit.details.expiration);
    //     // new Contract()

    //     const typedData = {
    //         types: {
    //             EIP712Domain: [
    //                 { name: 'name', type: 'string' },
    //                 { name: 'version', type: 'string' },
    //                 { name: 'chainId', type: 'uint256' },
    //                 { name: 'verifyingContract', type: 'address' }
    //             ],
    //             PermitSingle: [
    //                 { name: 'details', type: 'PermitDetails' },
    //                 { name: 'spender', type: 'address' },
    //                 { name: 'sigDeadline', type: 'uint256' }
    //             ],
    //             PermitDetails: [
    //                 { name: 'token', type: 'address' },
    //                 { name: 'amount', type: 'uint256' },
    //                 { name: 'expiration', type: 'uint48' },
    //                 { name: 'nonce', type: 'uint48' }
    //             ]
    //         },
    //         domain: {
    //             name: 'PermitSingle',
    //             version: '1',
    //             chainId: blockchainId[this.fromBlockchain],
    //             verifyingContract: permit2Address
    //         },
    //         primaryType: 'PermitSingle',
    //         message: {
    //             details: {
    //                 amount: permitData.permit.details.amount,
    //                 expiration,
    //                 nonce: permitData.permit.details.nonce,
    //                 token: permitData.permit.details.token
    //             },
    //             spender: permitData.permit.spender,
    //             sigDeadline: permitData.permit.sigDeadline
    //         }
    //     };

    //     const signature = (await (window as Any).ethereum.request({
    //         method: 'eth_signTypedData_v4',
    //         params: [walletAddress, typedData]
    //     })) as string;

    //     return signature;
    // }

    private getExpiration(deadline: string): string {
        return new BigNumber(deadline).plus(604800).toFixed(0);
    }

    private toDeadline(expiration: number): number {
        return Math.floor((Date.now() + expiration) / 1000);
    }
}
