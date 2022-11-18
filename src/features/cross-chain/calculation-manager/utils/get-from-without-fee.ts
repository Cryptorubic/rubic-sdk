import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { PriceTokenAmount } from 'src/common/tokens';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export function getFromWithoutFee<T extends BlockchainName>(
    from: PriceTokenAmount<T>,
    feeInfo: FeeInfo
): PriceTokenAmount<T> {
    if (!feeInfo?.platformFee?.percent) {
        return new PriceTokenAmount({
            ...from.asStruct,
            weiAmount: from.weiAmount
        });
    }
    const feeAmount = Web3Pure.toWei(
        from.tokenAmount.multipliedBy(feeInfo.platformFee.percent).dividedBy(100),
        from.decimals,
        1
    );
    return new PriceTokenAmount({
        ...from.asStruct,
        weiAmount: from.weiAmount.minus(feeAmount)
    });
}
