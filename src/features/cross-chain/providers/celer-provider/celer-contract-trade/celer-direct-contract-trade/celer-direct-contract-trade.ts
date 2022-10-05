import { BridgeCelerSwapInfo } from 'src/features/cross-chain/providers/celer-provider/celer-contract-trade/models/bridge-celer-swap-info';
import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/celer-provider/models/celer-cross-chain-supported-blockchain';
import { CelerCrossChainContractData } from 'src/features/cross-chain/providers/celer-provider/celer-cross-chain-contract-data';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CelerContractTrade } from 'src/features/cross-chain/providers/celer-provider/celer-contract-trade/celer-contract-trade';
import { DestinationCelerSwapInfo } from 'src/features/cross-chain/providers/celer-provider/celer-contract-trade/models/destination-celer-swap-info';
import { PriceTokenAmount } from 'src/common/tokens';
import { SwapVersion } from 'src/features/cross-chain/providers/celer-provider/celer-contract-trade/models/provider-type.enum';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';

export class CelerDirectContractTrade extends CelerContractTrade {
    public readonly fromToken: PriceTokenAmount<EvmBlockchainName>;

    public readonly toToken: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    constructor(
        blockchain: CelerCrossChainSupportedBlockchain,
        contract: CelerCrossChainContractData,
        private readonly token: PriceTokenAmount<EvmBlockchainName>
    ) {
        super(blockchain, contract, 0);
        this.fromToken = this.token;
        this.toToken = this.token;
        this.toTokenAmountMin = this.toToken.tokenAmount;
    }

    public getCelerSourceTrade(): string {
        const trade: BridgeCelerSwapInfo = {
            srcBridgeToken: this.toToken.address
        };
        return trade.srcBridgeToken;
    }

    public getCelerDestinationTrade(integratorAddress: string, receiverAddress: string): unknown[] {
        const trade: DestinationCelerSwapInfo = {
            dex: EvmWeb3Pure.EMPTY_ADDRESS,
            nativeOut: this.toToken.isNative,
            receiverEOA: receiverAddress,
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
        toContractTrade: CelerContractTrade,
        walletAddress: string,
        providerAddress: string,
        options: {
            maxSlippage: number;
            receiverAddress: string;
        }
    ): Promise<unknown[]> {
        const receiver = toContractTrade.contract.address || walletAddress;
        const tokenInAmountAbsolute = this.fromToken.stringWeiAmount;
        const targetChainId = blockchainId[toContractTrade.toToken.blockchain];
        const source = this.getCelerSourceTrade();
        const destination = toContractTrade.getCelerDestinationTrade(
            providerAddress,
            options.receiverAddress
        );

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
