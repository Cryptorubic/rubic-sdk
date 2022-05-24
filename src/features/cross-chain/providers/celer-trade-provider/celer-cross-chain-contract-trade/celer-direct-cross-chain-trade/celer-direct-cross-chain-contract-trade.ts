import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import BigNumber from 'bignumber.js';
import { BlockchainsInfo, MAINNET_BLOCKCHAIN_NAME, Web3Pure } from 'src/core';
import { CelerCrossChainContractTrade } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-cross-chain-contract-trade';
import { EMPTY_ADDRESS } from '@core/blockchain/constants/empty-address';
import { CelerCrossChainContractData } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-data';
import { DestinationCelerSwapInfo } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/destination-celer-swap-info';
import { SwapVersion } from '@features/cross-chain/providers/common/models/provider-type.enum';
import { BridgeCelerSwapInfo } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/models/bridge-celer-swap-info';

export class CelerDirectCrossChainContractTrade extends CelerCrossChainContractTrade {
    public readonly fromToken: PriceTokenAmount;

    public readonly toToken: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    constructor(
        blockchain: MAINNET_BLOCKCHAIN_NAME,
        contract: CelerCrossChainContractData,
        private readonly token: PriceTokenAmount
    ) {
        super(blockchain, contract, 0);
        this.fromToken = this.token;
        this.toToken = this.token;
        this.toTokenAmountMin = this.toToken.tokenAmount;
    }

    protected getFirstPath(): string[] {
        return [this.token.address];
    }

    public getSecondPath(): string[] {
        return [Web3Pure.addressToBytes32(this.token.address)];
    }

    protected async modifyArgumentsForProvider(methodArguments: unknown[][]): Promise<void> {
        const exactTokensForTokens = true;
        const swapTokenWithFee = false;

        methodArguments[0].push(exactTokensForTokens, swapTokenWithFee);
    }

    public getCelerSourceTrade(): string {
        const trade: BridgeCelerSwapInfo = {
            srcBridgeToken: this.toToken.address
        };
        return trade.srcBridgeToken;
    }

    public getCelerDestionationTrade(integratorAddress: string): unknown[] {
        const trade: DestinationCelerSwapInfo = {
            dex: EMPTY_ADDRESS,
            integrator: integratorAddress,
            version: SwapVersion.BRIDGE,
            path: [this.toToken.address],
            pathV3: '0x',
            deadline: 0,
            amountOutMinimum: '0'
        };
        return Object.values(trade);
    }

    /**
     * Returns method's arguments to use in source network.
     */
    public async getMethodArguments(
        toContractTrade: CelerCrossChainContractTrade,
        walletAddress: string,
        providerAddress: string,
        options: {
            maxSlippage: number;
        }
    ): Promise<unknown[]> {
        const receiver = toContractTrade.contract.address || walletAddress;
        const tokenInAmountAbsolute = this.fromToken.stringWeiAmount;
        const targetChainId = BlockchainsInfo.getBlockchainByName(this.toToken.blockchain).id;
        const source = this.getCelerSourceTrade();
        const destination = toContractTrade.getCelerDestionationTrade(providerAddress);

        return [
            receiver,
            tokenInAmountAbsolute,
            targetChainId,
            source,
            destination,
            options.maxSlippage
        ];
    }
}
