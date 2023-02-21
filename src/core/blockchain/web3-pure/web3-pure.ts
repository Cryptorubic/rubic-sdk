import BigNumber from 'bignumber.js';
import { staticImplements } from 'src/common/utils/decorators';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { Web3PureContainer } from 'src/core/blockchain/web3-pure/models/web3-pure-container';
import { BitcoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/bitcoin-web3-pure';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { IcpWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/icp-web3-pure';
import { AlgorandWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/algorand-web3-pure';
import { CardanoWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/cardano-web3-pure';
import { DashWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/dash-web3-pure';
import { DogecoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/dogecoin-web3-pure';
import { LitecoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/litecoin-web3-pure';
import { MoneroWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/monero-web3-pure';
import { NearWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/near-web3-pure';
import { PolkadotWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/polkadot-web3-pure';
import { SolanaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/solana-web3-pure';
import { TezosWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/tezos-web3-pure';
import { ZilliqaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/zilliqa-web3-pure';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';

/**
 * Contains common methods, connected with web3, e.g. wei conversion, encoding data, etc.
 */
@staticImplements<Web3PureContainer>()
export class Web3Pure {
    public static [CHAIN_TYPE.EVM] = EvmWeb3Pure;

    public static [CHAIN_TYPE.TRON] = TronWeb3Pure;

    public static [CHAIN_TYPE.BITCOIN] = BitcoinWeb3Pure;

    public static [CHAIN_TYPE.ICP] = IcpWeb3Pure;

    public static [CHAIN_TYPE.RIPPLE] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.CARDANO] = CardanoWeb3Pure;

    public static [CHAIN_TYPE.SOLANA] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.DOGECOIN] = DogecoinWeb3Pure;

    public static [CHAIN_TYPE.POLKADOT] = PolkadotWeb3Pure;

    public static [CHAIN_TYPE.LITECOIN] = LitecoinWeb3Pure;

    public static [CHAIN_TYPE.MONERO] = MoneroWeb3Pure;

    public static [CHAIN_TYPE.NEAR] = NearWeb3Pure;

    public static [CHAIN_TYPE.ALGORAND] = AlgorandWeb3Pure;

    public static [CHAIN_TYPE.TEZOS] = TezosWeb3Pure;

    public static [CHAIN_TYPE.DASH] = DashWeb3Pure;

    public static [CHAIN_TYPE.ZILLIQA] = ZilliqaWeb3Pure;

    // @TODO create web3pure file before release

    public static [CHAIN_TYPE.AION] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.BITCOIN_DIAMOND] = BitcoinWeb3Pure;

    public static [CHAIN_TYPE.BITCOIN_GOLD] = BitcoinWeb3Pure;

    public static [CHAIN_TYPE.BSV] = BitcoinWeb3Pure;

    public static [CHAIN_TYPE.APTOS] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.ARDOR] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.ARK] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.COSMOS] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.BAND_PROTOCOL] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.CASPER] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.DECRED] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.DIGI_BYTE] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.DIVI] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.MULTIVERS_X] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.FIO_PROTOCOL] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.FIRO] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.FLOW] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.HEDERA] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.HELIUM] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.ICON] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.IOST] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.IOTA] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.KADENA] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.KOMODO] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.KUSAMA] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.LISK] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.TERRA] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.TERRA_CLASSIC] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.MINA_PROTOCOL] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.NANO] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.NEO] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.OSMOSIS] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.PIVX] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.POLYX] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.QTUM] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.THOR_CHAIN] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.RAVENCOIN] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.SIA] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.SECRET] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.STEEM] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.STRATIS] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.STACKS] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.SOLAR] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.TON] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.VE_CHAIN] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.WAVES] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.WAX] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.DX_CHAIN] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.E_CASH] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.NEM] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.STELLAR] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.VERGE] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.SYMBOL] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.ZCASH] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.HORIZEN] = SolanaWeb3Pure;

    public static [CHAIN_TYPE.FILECOIN] = SolanaWeb3Pure;

    /**
     * Increases the gas limit value by the specified percentage and rounds to the nearest integer.
     * @param gasLimit Gas limit value to increase.
     * @param multiplier The multiplier by which the gas limit will be increased.
     */
    public static calculateGasMargin(
        gasLimit: BigNumber | string | number | null | undefined,
        multiplier: number
    ): BigNumber {
        return new BigNumber(gasLimit || '0').multipliedBy(multiplier).dp(0);
    }

    /**
     * Converts amount from Ether to Wei units.
     * @param amount Amount to convert.
     * @param decimals Token decimals.
     * @param roundingMode BigNumberRoundingMode.
     */
    public static toWei(
        amount: BigNumber | string | number,
        decimals = 18,
        roundingMode?: BigNumber.RoundingMode
    ): string {
        return new BigNumber(amount || 0)
            .times(new BigNumber(10).pow(decimals))
            .toFixed(0, roundingMode);
    }

    /**
     * Converts amount from Wei to Ether units.
     * @param amountInWei Amount to convert.
     * @param decimals Token decimals.
     */
    public static fromWei(amountInWei: BigNumber | string | number, decimals = 18): BigNumber {
        return new BigNumber(amountInWei).div(new BigNumber(10).pow(decimals));
    }
}
