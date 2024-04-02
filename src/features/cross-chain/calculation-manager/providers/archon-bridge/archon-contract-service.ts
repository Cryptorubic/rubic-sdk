import BigNumber from 'bignumber.js';
import { Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { Injector } from 'src/core/injector/injector';
import { archonBridgeAbi } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-abi';
import {
    archonBridgeInContractAddress,
    archonBridgeOutContractAddress
} from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-out-contract-address';
import { ArchonBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-supported-blockchain';
import { archonWrapBridgeAbi } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-wrap-bridge-abi';
import { layerZeroIds } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/layer-zero-ids';
import {
    eonAvalancheTokensMapping,
    eonEthTokensMapping,
    supportedEonTokens
} from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/supported-tokens';

export class ArchonContractService {
    public static async fetchDepositFeeBps(fromToken: Token, toToken: Token): Promise<number> {
        const { web3, contract } = ArchonContractService.getWeb3AndAddress(fromToken, toToken);
        let fee: string;

        if (contract.type === 'originRouter') {
            fee = await web3.callContractMethod(
                contract.address,
                archonBridgeAbi,
                'depositFeeBps',
                []
            );
        } else {
            fee = await web3.callContractMethod(
                contract.address,
                archonWrapBridgeAbi,
                'withdrawalFeeBps',
                []
            );
        }

        return new BigNumber(fee).dividedBy(10_000).toNumber();
    }

    public static async fetchLayerZeroFee(fromToken: Token, toToken: Token): Promise<string> {
        const { web3, contract } = ArchonContractService.getWeb3AndAddress(fromToken, toToken);

        if (contract.type === 'originRouter') {
            const fee = await web3.callContractMethod<{ nativeFee: string }>(
                contract.address,
                archonBridgeAbi,
                'estimateBridgeFee',
                [false, '0x']
            );
            return fee.nativeFee;
        }

        const remoteChainId = layerZeroIds[toToken.blockchain as ArchonBridgeSupportedBlockchain];
        const fee = await web3.callContractMethod<{ nativeFee: string }>(
            contract.address,
            archonWrapBridgeAbi,
            'estimateBridgeFee',
            [remoteChainId, false, '0x']
        );
        return fee.nativeFee;
    }

    public static getWeb3AndAddress(
        fromToken: Token,
        toToken: Token
    ): { web3: EvmWeb3Public; contract: { address: string; type: string } } {
        const web3 = Injector.web3PublicService.getWeb3Public(fromToken.blockchain);
        const contract = { address: '', type: '' };

        if (fromToken.blockchain === BLOCKCHAIN_NAME.HORIZEN_EON) {
            const toBlockchain = toToken.blockchain as Exclude<
                ArchonBridgeSupportedBlockchain,
                typeof BLOCKCHAIN_NAME.HORIZEN_EON
            >;
            const contractOut = archonBridgeOutContractAddress[toBlockchain];
            contract.address = fromToken.isNative
                ? contractOut.originRouter
                : contractOut.wrapRouter;
            contract.type = fromToken.isNative ? 'originRouter' : 'wrapRouter';
        } else {
            const fromBlockchain = fromToken.blockchain as Exclude<
                ArchonBridgeSupportedBlockchain,
                typeof BLOCKCHAIN_NAME.HORIZEN_EON
            >;
            const contractIn = archonBridgeInContractAddress[fromBlockchain];
            const fromNetworkAddresses =
                toToken.blockchain === BLOCKCHAIN_NAME.ETHEREUM
                    ? eonEthTokensMapping
                    : eonAvalancheTokensMapping;

            const wzenNonEonAddress = fromNetworkAddresses[supportedEonTokens.wzen][0]!;
            const isWzen = compareAddresses(fromToken.address, wzenNonEonAddress);

            contract.address = isWzen ? contractIn.wrapRouter : contractIn.originRouter;
            contract.type = isWzen ? 'wrapRouter' : 'originRouter';
        }

        return { web3, contract };
    }
}
