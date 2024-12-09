import { Token } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

/**
 * @returns wei total gas
 */
export function getStonfiTotalGas(from: Token, to: Token): string {
    if (from.isNative) return Web3Pure.toWei(0.185, nativeTokensList.TON.decimals);
    if (to.isNative) return Web3Pure.toWei(0.17, nativeTokensList.TON.decimals);
    return Web3Pure.toWei(0.22, nativeTokensList.TON.decimals);
}
