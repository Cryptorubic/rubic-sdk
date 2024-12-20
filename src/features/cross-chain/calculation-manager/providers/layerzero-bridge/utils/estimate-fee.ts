import { solidityPack } from 'ethers/lib/utils';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';

import { ALGB_TOKEN } from '../constants/algb-token-addresses';
import { layerZeroProxyOFT } from '../constants/layerzero-bridge-address';
import { layerZeroChainIds } from '../constants/layzerzero-chain-ids';
import { LayerZeroBridgeSupportedBlockchain } from '../models/layerzero-bridge-supported-blockchains';
import { layerZeroOFTABI } from '../models/layerzero-oft-abi';

export async function estimateSendFeeLZ(
    from: PriceTokenAmount<LayerZeroBridgeSupportedBlockchain>,
    to: PriceToken<LayerZeroBridgeSupportedBlockchain>,
    receiverAddress?: string
) {
    const web3Public = Injector.web3PublicService.getWeb3Public(from.blockchain);
    const walletAddress = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
        from.blockchain
    ).address;
    const adapterParams = solidityPack(
        ['uint16', 'uint256'],
        [1, to.blockchain === BLOCKCHAIN_NAME.ARBITRUM ? 2_000_000 : 200_000]
    );

    const contractAddress =
        from.blockchain === BLOCKCHAIN_NAME.POLYGON
            ? layerZeroProxyOFT[BLOCKCHAIN_NAME.POLYGON]
            : ALGB_TOKEN[from.blockchain];
    const methodArguments = [
        layerZeroChainIds[to.blockchain],
        receiverAddress || walletAddress,
        from.stringWeiAmount,
        false,
        adapterParams
    ];

    const gasFee = await web3Public.callContractMethod(
        contractAddress,
        layerZeroOFTABI,
        'estimateSendFee',
        methodArguments
    );

    return gasFee[0];
}
